import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';
import bcrypt from 'bcryptjs';
import { Korisnik } from '../../../types/modeli'
import jwt from 'jsonwebtoken';
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Prijava ili registracija korisnika
 *     description: |
 *       Ponasanje endpointa zavisi od polja `akcija` u request body-ju:
 *       - `log`: prijava postojeceg korisnika
 *       - `reg`: registracija novog korisnika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Uspesna prijava.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       201:
 *         description: Uspesna registracija.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       500:
 *         description: Greska validacije ili serverska greska.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, ime, akcija } = body;
        const { data, error } = await supabase.from('korisnik').select('*').eq('email', email);
        if (akcija == "log") {
            let provera = false;
            if (data && data.length > 0) {
                provera = await compare(password, data[0].password_hash);
                if (provera) {
                    const korisnik = data[0];
                    const token = jwt.sign({ korisnik_id: korisnik.korisnik_id, uloga_id: korisnik.uloga_id },JWT_SECRET,{ expiresIn: '7d' });
                    return NextResponse.json({ token, korisnik }, { status: 200 });
                }
            }

            return NextResponse.json({ error: "Pogresni kredencijali" }, { status: 500 });

        }
        else if (akcija == "reg") {

            if (data && data.length > 0)
                return NextResponse.json({ error: "vec postoji korisnik..." }, { status: 500 });
            const hash = await bcrypt.hash(password, Number(process.env.salt_rounds))
            const vreme = new Date();
            var korisnik: Korisnik = {
                ime: ime, password_hash: hash, email: email,
                datum_kreiranja: vreme,
                uloga_id: 1
            };

            const { data: dt, error: err } = await supabase.from('korisnik').insert(korisnik).select();
            if (err)
                return NextResponse.json({ error: err.message }, { status: 500 });
              const token = jwt.sign({ korisnik_id: dt[0].korisnik_id, uloga_id: dt[0].uloga_id },JWT_SECRET,{ expiresIn: '7d' });
            return NextResponse.json({token, korisnik}, { status: 201 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
