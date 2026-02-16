import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Stanica } from '../../../types/modeli';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @swagger
 * /api/stations:
 *   get:
 *     tags:
 *       - Stations
 *     summary: List stations
 *     parameters:
 *       - in: query
 *         name: naziv
 *         schema:
 *           type: string
 *         description: Filter by partial station name.
 *     responses:
 *       200:
 *         description: List of stations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Stations
 *     summary: Create station
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naziv:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               aktivna:
 *                 type: boolean
 *             required:
 *               - naziv
 *               - lat
 *               - lng
 *               - aktivna
 *     responses:
 *       201:
 *         description: Created station.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Stations
 *     summary: Update station
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stanica_id:
 *                 type: integer
 *               naziv:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               aktivna:
 *                 type: boolean
 *             required:
 *               - stanica_id
 *     responses:
 *       201:
 *         description: Updated station data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Stations
 *     summary: Delete station
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Station ID.
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
        const _naziv = parametri["naziv"];

        let query = supabase.from('stanica').select('*').range(0, 9999);
        if (_naziv)
            query = query.like('naziv', `%${_naziv}%`);
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
        const { naziv, lat, lng, aktivna } = body;

        const { data, error } = await supabase.from('stanica').insert({ naziv, lat: Number(lat), lng: Number(lng), aktivna }).select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { stanica_id, ...updateData } = body;
        if (!stanica_id) {
            return NextResponse.json({ error: "Stanica id je obavezan", status: 400 });
        }
        const { data, error } = await supabase.from('stanica').update(updateData).eq('stanica_id', stanica_id).select();
        if (error)
            return NextResponse.json({ error: error, status: 501 });

        return NextResponse.json(data, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });

    }
}
export async function DELETE(request: NextRequest) {
    try {
        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const stanica_id = parametri["id"];
        
        const { data: stanica, error } = await supabase.from('stanica').delete().eq('stanica_id', stanica_id).select();
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json({ status: 201 });  
        
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

