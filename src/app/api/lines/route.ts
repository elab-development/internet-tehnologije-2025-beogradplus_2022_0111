import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const parametri = Object.fromEntries(request.nextUrl.searchParams);
        const _naziv = parametri["ime_linije"];
        const _broj = parametri["broj"];
        const _linija_id = parametri["linija_id"];
        const _stanice = parametri["stanice"];
        const _stanica_id = parametri["stanica_id"];
        const _smer = parametri["smer"];
        const _smerovi = parametri["smerovi"];

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
            const jedinstveneLinije = Array.from(
                new Map(linije.map((l: any) => [l.linija_id, l])).values()
            );
            return NextResponse.json(jedinstveneLinije);
        }

        if (_linija_id && _smerovi === 'true') {
            const { data, error } = await supabase
                .from('linija_smer')
                .select('smer, naziv')
                .eq('linija_id', _linija_id)
                .order('smer', { ascending: true });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json(data);
        }

        if (_linija_id && _stanice === 'true') {
            let upit = supabase
                .from('linija_stanica')
                .select(`
                    stanica_id,
                    redni_broj,
                    smer,
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

            if (_smer !== undefined) {
                upit = upit.eq('smer', _smer);
            }

            const { data, error } = await upit;

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            const stanice = data
                .filter(item => item.stanica)
                .map(item => ({
                    ...item.stanica,
                    redni_broj: item.redni_broj,
                    smer: item.smer
                }));

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
        const { broj, tip, ime_linije, aktivna, stanice, smer } = body;
        const { data: linija, error } = await supabase.from('linija').insert({ broj, tip, ime_linije, aktivna }).select().single();
        const linijaStanice = [];
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        for (let i = 0; i < stanice.length; i++) {
            linijaStanice.push({
                linija_id: linija.linija_id,
                stanica_id: stanice[i],
                redni_broj: i + 1,
                smer: smer ?? 0
            });
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
        const { linija_id, stanice, smer, ...updateData } = body;
        if (Object.keys(updateData).length > 0) {
            await supabase.from('linija').update(updateData).eq('linija_id', linija_id);
        }
        if (stanice && stanice.length > 0) {
            const smerVrednost = smer ?? 0;

            await supabase
                .from('linija_stanica')
                .delete()
                .eq('linija_id', linija_id)
                .eq('smer', smerVrednost);

            let linijaStanice = [];
            for (let i = 0; i < stanice.length; i++) {
                linijaStanice.push({
                    linija_id: linija_id,
                    stanica_id: stanice[i],
                    redni_broj: i + 1,
                    smer: smerVrednost
                });
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