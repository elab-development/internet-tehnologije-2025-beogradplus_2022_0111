import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Linija } from '../../../types/modeli';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const _naziv = parametri["ime_linije"];
        const _broj = parametri["broj"];

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
            linijaStanice.push({ linija_id: linija.linija_id, stanica_id: stanice[i] });
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
        const { linija_id, stanice, ...updateData } = body;//jako bitno, kad budem slao request saljem stanice kao niz prvo pa onda ostatak(objekat).
        if (Object.keys(updateData).length > 0) {
            await supabase.from('linija').update(updateData).eq('linija_id', linija_id);
        }
        if (stanice && stanice.length > 0) {
            await supabase.from('linija_stanica').delete().eq('linija_id', linija_id);
            let linijaStanice = [];
            for (let i = 0; i < stanice.length; i++) {
                linijaStanice.push({ linija_id: linija_id, stanica_id: stanice[i] });
            }
            await supabase.from('linija_stanica').insert(linijaStanice);
        }


    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });

    }
    return NextResponse.json({ success: true }, { status: 200 });
}
