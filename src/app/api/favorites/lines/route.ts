import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @swagger
 * /api/favorites/lines:
 *   get:
 *     tags:
 *       - Favorites
 *     summary: List favorite lines for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: korisnik_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID.
 *     responses:
 *       200:
 *         description: Favorite lines.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteLine'
 *       400:
 *         description: Missing query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Favorites
 *     summary: Add line to favorites
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linija_id:
 *                 type: integer
 *               korisnik_id:
 *                 type: integer
 *             required:
 *               - linija_id
 *               - korisnik_id
 *     responses:
 *       201:
 *         description: Favorite line created.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteLine'
 *       400:
 *         description: Validation error or already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Favorites
 *     summary: Remove line from favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: linija_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: korisnik_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Favorite removed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Missing query params.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const korisnik_id = parametri["korisnik_id"];

        if (!token) {
            return NextResponse.json({ error: "Token nije pronađen" }, { status: 401 });
        }

        if (!korisnik_id) {
            return NextResponse.json({ error: "Korisnik ID je obavezan" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('omiljena_linija')
            .select(`
                ol_id,
                linija_id,
                korisnik_id
            `)
            .eq('korisnik_id', korisnik_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: "Token nije pronađen" }, { status: 401 });
        }

        const body = await request.json();
        const { linija_id, korisnik_id } = body;

        if (!linija_id || !korisnik_id) {
            return NextResponse.json({ error: "Linija ID i Korisnik ID su obavezni" }, { status: 400 });
        }

        const { data: existing } = await supabase
            .from('omiljena_linija')
            .select('*')
            .eq('korisnik_id', korisnik_id)
            .eq('linija_id', linija_id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: "Linija je već u omiljenim" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('omiljena_linija')
            .insert({ korisnik_id, linija_id })
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: "Token nije pronađen" }, { status: 401 });
        }

        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const linija_id = parametri["linija_id"];
        const korisnik_id = parametri["korisnik_id"];

        if (!linija_id || !korisnik_id) {
            return NextResponse.json({ error: "Linija ID i Korisnik ID su obavezni" }, { status: 400 });
        }

        const { error } = await supabase
            .from('omiljena_linija')
            .delete()
            .eq('korisnik_id', korisnik_id)
            .eq('linija_id', linija_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
