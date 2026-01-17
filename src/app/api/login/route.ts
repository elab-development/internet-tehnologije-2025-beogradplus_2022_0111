import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';
import bcrypt from 'bcryptjs';
import { Korisnik } from '../../../types/modeli'
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, ime, akcija } = body;
        const { data, error } = await supabase.from('korisnik').select('*').eq('email', email);
        if (akcija == "log") {
            let provera = false;
            if (data && data.length > 0)
                provera = await compare(password, data[0].password_hash);
            if (provera)
                return NextResponse.json(data, { status: 201 });
            return NextResponse.json({ error: "Pogresni kredencijali" }, { status: 500 });

        }
        else if(akcija == "reg")
        {

            if (data && data.length > 0)
                return NextResponse.json({ error: "vec postoji korisnik..." }, { status: 500 });
            const hash = await bcrypt.hash(password, Number(process.env.salt_rounds))
            const vreme = new Date();
            var k: Korisnik = {
                ime: ime, password_hash: hash, email: email,
                datum_kreiranja: vreme,
                uloga_id: 1
            };
    
            const { data: dt, error: err } = await supabase.from('korisnik').insert(k).select();
            if (err)
                return NextResponse.json({ error: err.message }, { status: 500 });
            return NextResponse.json(dt, { status: 201 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}