import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @swagger
 * /api/lines:
 *   get:
 *     tags:
 *       - Lines
 *     summary: List lines or fetch related entities
 *     description: |
 *       Returns lines by default. Use special query combinations to return related data:
 *       - `stanica_id`: returns lines passing through a station
 *       - `linija_id` + `stanice=true`: returns stations for a line
 *     parameters:
 *       - in: query
 *         name: ime_linije
 *         schema:
 *           type: string
 *         description: Filter by line name.
 *       - in: query
 *         name: broj
 *         schema:
 *           type: string
 *         description: Filter by line number.
 *       - in: query
 *         name: linija_id
 *         schema:
 *           type: integer
 *         description: Line ID for special lookups.
 *       - in: query
 *         name: stanice
 *         schema:
 *           type: boolean
 *         description: When `true` together with `linija_id`, returns line stations.
 *       - in: query
 *         name: stanica_id
 *         schema:
 *           type: integer
 *         description: Returns lines assigned to this station.
 *     responses:
 *       200:
 *         description: Lines or stations, depending on query params.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Line'
 *                   - $ref: '#/components/schemas/Station'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Lines
 *     summary: Create line and assign stations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               broj:
 *                 type: string
 *               tip:
 *                 type: integer
 *               ime_linije:
 *                 type: string
 *               aktivna:
 *                 type: boolean
 *               stanice:
 *                 type: array
 *                 items:
 *                   type: integer
 *             required:
 *               - broj
 *               - tip
 *               - ime_linije
 *               - aktivna
 *               - stanice
 *     responses:
 *       200:
 *         description: Insert completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Lines
 *     summary: Update line and optionally re-order stations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linija_id:
 *                 type: integer
 *               broj:
 *                 type: string
 *               tip:
 *                 type: integer
 *               ime_linije:
 *                 type: string
 *               aktivna:
 *                 type: boolean
 *               stanice:
 *                 type: array
 *                 items:
 *                   type: integer
 *             required:
 *               - linija_id
 *     responses:
 *       200:
 *         description: Update completed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Lines
 *     summary: Delete line
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Delete result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(request: NextRequest) {
    try {
        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const _naziv = parametri["ime_linije"];
        const _broj = parametri["broj"];
        const _linija_id = parametri["linija_id"];
        const _stanice = parametri["stanice"];
        const _stanica_id = parametri["stanica_id"];

        if (_stanica_id) {
            const { data, error } = await supabase
                .from('linija_stanica')
                .select(`
                    linija_id,
                    linija:linija_id (
                        linija_id,
                        broj,
                        tip,
                        ime_linije,
                        aktivna
                    )
                `)
                .eq('stanica_id', _stanica_id);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            const linije = data.map(item => item.linija).filter(Boolean);
            return NextResponse.json(linije);
        }

        if (_linija_id && _stanice === 'true') {
            const { data, error } = await supabase
                .from('linija_stanica')
                .select(`
                    stanica_id,
                    redni_broj,
                    stanica:stanica_id (
                        stanica_id,
                        naziv,
                        lat,
                        lng,
                        aktivna
                    )
                `)
                .eq('linija_id', _linija_id)
                .order('redni_broj', { ascending: true });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            const stanice = data.map(item => item.stanica).filter(Boolean);
            return NextResponse.json(stanice);
        }
        
        let query = supabase.from('linija').select('*');
        if (_naziv)
            query = query.like('ime_linije', `%${_naziv}%`);
        if (_broj)
            query = query.like('broj', `%${_broj}%`);
        const { data, error } = await query;
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { broj, tip, ime_linije, aktivna, stanice } = body;
        const { data: linija, error } = await supabase.from('linija').insert({ broj, tip, ime_linije, aktivna }).select().single();
        const linijaStanice = [];
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        for (let i = 0; i < stanice.length; i++) {
            linijaStanice.push({ linija_id: linija.linija_id, stanica_id: stanice[i], redni_broj: i + 1 });
        }
        const { error: err } = await supabase.from('linija_stanica').insert(linijaStanice).select();
        if (err) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { linija_id, stanice, ...updateData } = body;
        if (Object.keys(updateData).length > 0) {
            await supabase.from('linija').update(updateData).eq('linija_id', linija_id);
        }
        if (stanice && stanice.length > 0) {
            await supabase.from('linija_stanica').delete().eq('linija_id', linija_id);
            let linijaStanice = [];
            for (let i = 0; i < stanice.length; i++) {
                linijaStanice.push({ linija_id: linija_id, stanica_id: stanice[i], redni_broj: i + 1 });
            }
            const { data, error } = await supabase.from('linija_stanica').insert(linijaStanice);
            if (error)
                return NextResponse.json({ error: error.message }, { status: 500 });
        }

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
    try {
        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const linija_id = parametri["id"];

        const { data: stanica, error } = await supabase.from('linija').delete().eq('linija_id', linija_id).select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        
        return NextResponse.json({ status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });

    }
}
