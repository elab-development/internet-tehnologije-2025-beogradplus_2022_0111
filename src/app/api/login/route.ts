import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';
import bcrypt from 'bcryptjs';
import { Korisnik } from '../../../types/modeli'
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, ime, akcija, credential } = body;

        if (akcija == "google") {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return NextResponse.json({ error: "Nevalidan Google token" }, { status: 401 });
            }

            const googleId = payload.sub;
            const googleEmail = payload.email;
            const googleSlika = payload.picture || null;
            const googleIme = (payload.name || googleEmail.split('@')[0]).replace(/[^a-zA-ZčćžšđČĆŽŠĐ\s]/g, '').trim() || 'Korisnik';

            const { data: postojeci } = await supabase
                .from('korisnik')
                .select('*')
                .or(`google_id.eq.${googleId},email.eq.${googleEmail}`);

            let korisnik;

            if (postojeci && postojeci.length > 0) {
                korisnik = postojeci[0];

                if (!korisnik.google_id) {
                    const { data: azuriran, error: errAzur } = await supabase
                        .from('korisnik')
                        .update({ google_id: googleId })
                        .eq('korisnik_id', korisnik.korisnik_id)
                        .select()
                        .single();

                    if (errAzur) {
                        return NextResponse.json({ error: errAzur.message }, { status: 500 });
                    }
                    korisnik = azuriran;
                }
            } else {
                const noviKorisnik = {
                    ime: googleIme,
                    email: googleEmail,
                    password_hash: null,
                    google_id: googleId,
                    slika_url: googleSlika,
                    datum_kreiranja: new Date(),
                    uloga_id: 1
                };

                const { data: kreiran, error: errKreiranje } = await supabase
                    .from('korisnik')
                    .insert(noviKorisnik)
                    .select()
                    .single();

                if (errKreiranje) {
                    return NextResponse.json({ error: errKreiranje.message }, { status: 500 });
                }
                korisnik = kreiran;
            }

            const token = jwt.sign(
                { korisnik_id: korisnik.korisnik_id, uloga_id: korisnik.uloga_id },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return NextResponse.json({ token, korisnik }, { status: 200 });
        }

        const { data, error } = await supabase.from('korisnik').select('*').eq('email', email);
        if (akcija == "log") {
            let provera = false;
            if (data && data.length > 0) {
                if (!data[0].password_hash) {
                    return NextResponse.json({ error: "Ovaj nalog je kreiran preko Google-a, ulogujte se preko Google dugmeta" }, { status: 400 });
                }
                provera = await compare(password, data[0].password_hash);
                if (provera) {
                    const korisnik = data[0];
                    const token = jwt.sign({ korisnik_id: korisnik.korisnik_id, uloga_id: korisnik.uloga_id }, JWT_SECRET, { expiresIn: '7d' });
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
                uloga_id: 1, slika_url: null, google_id: null
            };

            const { data: dt, error: err } = await supabase.from('korisnik').insert(korisnik).select();
            if (err)
                return NextResponse.json({ error: err.message }, { status: 500 });
            const token = jwt.sign({ korisnik_id: dt[0].korisnik_id, uloga_id: dt[0].uloga_id }, JWT_SECRET, { expiresIn: '7d' });
            return NextResponse.json({ token, korisnik }, { status: 201 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}