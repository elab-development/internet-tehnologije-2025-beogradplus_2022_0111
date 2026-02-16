import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @swagger
 * /api/korisnici/promote:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Change user role (promote/demote)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoteRequest'
 *     responses:
 *       200:
 *         description: Role changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *       400:
 *         description: Missing input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not admin or user not found).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Target user does not exist.
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

export async function PUT(request: NextRequest) {
    try {

        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Niste ulogovani' }, { status: 401 });
        }


        const token = authHeader.replace(/^Bearer\s+/i, '').replace(/["']/g, '').trim();


        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Nevalidan ili istekao token' }, { status: 401 });
        }


        const { data: adminUser, error: adminCheckError } = await supabase
            .from('korisnik')
            .select('uloga_id')
            .eq('korisnik_id', decoded.korisnik_id) 
            .single();

        if (adminCheckError || !adminUser) {
            return NextResponse.json({ error: 'Korisnik nije pronađen' }, { status: 403 });
        }

        if (adminUser.uloga_id !== 2) {
            return NextResponse.json({ error: 'Nemate pristup admin panelu' }, { status: 403 });
        }


        const body = await request.json();
        const { email, uloga_id } = body;

        if (!email || !uloga_id) {
            return NextResponse.json({ error: 'Nedostaju podaci' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('korisnik')
            .update({ uloga_id: Number(uloga_id) })
            .eq('email', email)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Korisnik sa tim email-om ne postoji' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
