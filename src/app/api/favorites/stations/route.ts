import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @swagger
 * /api/favorites/stations:
 *   get:
 *     tags:
 *       - Favorites
 *     summary: List favorite stations for a user
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
 *         description: Favorite stations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteStation'
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
 *     summary: Add station to favorites
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stanica_id:
 *                 type: integer
 *               korisnik_id:
 *                 type: integer
 *             required:
 *               - stanica_id
 *               - korisnik_id
 *     responses:
 *       201:
 *         description: Favorite station created.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteStation'
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
 *     summary: Remove station from favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stanica_id
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
            .from('omiljena_stanica')
            .select(`
                os_id,
                stanica_id,
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
        const { stanica_id, korisnik_id } = body;

        if (!stanica_id || !korisnik_id) {
            return NextResponse.json({ error: "Stanica ID i Korisnik ID su obavezni" }, { status: 400 });
        }

        // Proveravamo da li već postoji
        const { data: existing } = await supabase
            .from('omiljena_stanica')
            .select('*')
            .eq('korisnik_id', korisnik_id)
            .eq('stanica_id', stanica_id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: "Stanica je već u omiljenim" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('omiljena_stanica')
            .insert({ korisnik_id, stanica_id })
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
        const stanica_id = parametri["stanica_id"];
        const korisnik_id = parametri["korisnik_id"];

        if (!stanica_id || !korisnik_id) {
            return NextResponse.json({ error: "Stanica ID i Korisnik ID su obavezni" }, { status: 400 });
        }

        const { error } = await supabase
            .from('omiljena_stanica')
            .delete()
            .eq('korisnik_id', korisnik_id)
            .eq('stanica_id', stanica_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
