import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Stanica } from '../../../types/modeli';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const _naziv = parametri["naziv"];

        let query = supabase.from('stanica').select('*').range(0,9999);
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
        if(!stanica_id){
            return NextResponse.json({error : "Stanica id je obavezan",status: 400});
        }
        const { data, error } = await supabase.from('stanica').update(updateData).eq('stanica_id', stanica_id).select();
        if(error)
            return NextResponse.json({error : error,status: 501});

        return NextResponse.json(data, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });

    }
}
