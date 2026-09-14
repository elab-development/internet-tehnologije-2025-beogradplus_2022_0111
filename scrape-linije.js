const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const DB_CONFIG = {
  connectionString: 'postgresql://postgres.myoxjpsjfokvhuwkutrb:BeogradPlus123@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool(DB_CONFIG);
const PAUZA_MS = 800;

const CIR_U_LAT = {
  'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Ђ':'Đ','Е':'E','Ж':'Ž','З':'Z',
  'И':'I','Ј':'J','К':'K','Л':'L','Љ':'Lj','М':'M','Н':'N','Њ':'Nj','О':'O',
  'П':'P','Р':'R','С':'S','Т':'T','Ћ':'Ć','У':'U','Ф':'F','Х':'H','Ц':'C',
  'Ч':'Č','Џ':'Dž','Ш':'Š',
  'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'đ','е':'e','ж':'ž','з':'z',
  'и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o',
  'п':'p','р':'r','с':'s','т':'t','ћ':'ć','у':'u','ф':'f','х':'h','ц':'c',
  'ч':'č','џ':'dž','ш':'š'
};

function cirULat(t) {
  return t ? t.split('').map(z => CIR_U_LAT[z] ?? z).join('') : t;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function pripremiTabele(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS linija_smer (
      linija_id INTEGER NOT NULL,
      smer SMALLINT NOT NULL,
      naziv VARCHAR(255),
      PRIMARY KEY (linija_id, smer),
      FOREIGN KEY (linija_id) REFERENCES linija(linija_id) ON DELETE CASCADE
    );
  `);
}

function izvuciNazivBlokova($, brojLinije) {
  const blokovi = [];
  $('body *').each((_, el) => {
    const $el = $(el);
    if ($el.children().length === 0) {
      const txt = $el.text().trim();
      if (txt) blokovi.push(txt);
    }
  });

  const idx = blokovi.findIndex(b => b === String(brojLinije));
  if (idx === -1) return { nazivA: null, nazivB: null };

  const prvi = blokovi[idx + 1] || null;
  const drugi = blokovi[idx + 2] || null;
  const drugiJeSmer = !!drugi && drugi.includes(' - ') && !/prika/i.test(drugi);

  return {
    nazivA: prvi ? cirULat(prvi) : null,
    nazivB: drugiJeSmer ? cirULat(drugi) : null
  };
}

function normalizujNaziv(t) {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/["'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePetljuNaziva(nazivA) {
  if (!nazivA) return null;
  const delovi = nazivA.split(' - ').map(d => d.trim()).filter(Boolean);
  if (delovi.length !== 3) return null;
  if (normalizujNaziv(delovi[0]) !== normalizujNaziv(delovi[2])) return null;
  return { pocetak: delovi[0], sredina: delovi[1], kraj: delovi[2] };
}

function pronadjiIndexSredine(stanice, sredinaNorm) {
  return stanice.findIndex(s => normalizujNaziv(s.naziv || '') === sredinaNorm);
}

async function skrejpujSmer(brojLinije, smerSlovo) {
  const url = `https://www.bgprevoz.rs/linije/red-voznje/smer-${smerSlovo}/${brojLinije}`;
  let html;
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
    html = res.data;
  } catch {
    return { stanice: [], $: null };
  }

  const $ = cheerio.load(html);
  const stanice = [];

  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 4) return;

    const redniBroj = parseInt($(cells[1]).text().trim(), 10);
    const naziv = $(cells[2]).text().trim();
    const sifra = $(cells[4]).text().trim().replace('#', '').trim();
    if (isNaN(redniBroj) || !sifra) return;

    stanice.push({ redniBroj, stanicaId: 20000 + parseInt(sifra, 10), naziv: cirULat(naziv) });
  });

  return { stanice, $ };
}

async function uvezilLiniju(client, linijaId, brojLinije, stanicaIds, nepovezane) {
  console.log(`▶ Linija ${brojLinije} (id ${linijaId})`);

  const smerA = await skrejpujSmer(brojLinije, 'a');
  await sleep(PAUZA_MS);
  const smerB = await skrejpujSmer(brojLinije, 'b');
  await sleep(PAUZA_MS);

  if (smerA.stanice.length === 0 && smerB.stanice.length === 0) {
    console.log('   preskočeno, nema podataka');
    return;
  }

  const izvorZaNazive = smerA.$ || smerB.$;
  const { nazivA, nazivB } = izvorZaNazive
    ? izvuciNazivBlokova(izvorZaNazive, brojLinije)
    : { nazivA: null, nazivB: null };

  const postojiDrugiSmer = smerB.stanice.length > 0 && !!nazivB;

  let smerovi;

  if (postojiDrugiSmer) {
    smerovi = [
      { stanice: smerA.stanice, smer: 0, naziv: nazivA },
      { stanice: smerB.stanice, smer: 1, naziv: nazivB }
    ];
  } else {
    const petlja = parsePetljuNaziva(nazivA);
    const sredinaIdx = petlja ? pronadjiIndexSredine(smerA.stanice, normalizujNaziv(petlja.sredina)) : -1;

    if (petlja && sredinaIdx > 0 && sredinaIdx < smerA.stanice.length - 1) {
      const segment0 = smerA.stanice.slice(0, sredinaIdx + 1).map((s, i) => ({ ...s, redniBroj: i + 1 }));
      const segment1 = smerA.stanice.slice(sredinaIdx).map((s, i) => ({ ...s, redniBroj: i + 1 }));

      smerovi = [
        { stanice: segment0, smer: 0, naziv: `${petlja.pocetak} - ${petlja.sredina}` },
        { stanice: segment1, smer: 1, naziv: `${petlja.sredina} - ${petlja.kraj}` }
      ];
      console.log(`   kružna linija, podela na "${petlja.sredina}" (indeks ${sredinaIdx})`);
    } else {
      smerovi = [{ stanice: smerA.stanice, smer: 0, naziv: nazivA }];
      if (petlja && sredinaIdx === -1) {
        console.log(`   ⚠️ kružna linija ali stanica "${petlja.sredina}" nije pronađena u listi, nema podele`);
      }
    }
  }

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM linija_stanica WHERE linija_id = $1', [linijaId]);
    await client.query('DELETE FROM linija_smer WHERE linija_id = $1', [linijaId]);

    for (const { stanice, smer, naziv } of smerovi) {
      if (naziv) {
        await client.query(
          `INSERT INTO linija_smer (linija_id, smer, naziv) VALUES ($1,$2,$3)
           ON CONFLICT (linija_id, smer) DO UPDATE SET naziv = EXCLUDED.naziv`,
          [linijaId, smer, naziv]
        );
      }

      for (const s of stanice) {
        if (!stanicaIds.has(s.stanicaId)) {
          nepovezane.push({ brojLinije, smer, ...s });
          continue;
        }
        await client.query(
          `INSERT INTO linija_stanica (linija_id, stanica_id, redni_broj, smer) VALUES ($1,$2,$3,$4)
           ON CONFLICT (linija_id, stanica_id, smer) DO UPDATE SET redni_broj = EXCLUDED.redni_broj`,
          [linijaId, s.stanicaId, s.redniBroj, smer]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`   ok: ${smerovi.map(sm => `smer${sm.smer}=${sm.stanice.length}(${sm.naziv || '-'})`).join('  ')}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.log(`   greška: ${err.message}`);
  }
}

(async () => {
  const client = await pool.connect();
  const nepovezane = [];

  try {
    await pripremiTabele(client);

    const { rows: sveStanice } = await client.query('SELECT stanica_id FROM stanica');
    const stanicaIds = new Set(sveStanice.map(r => r.stanica_id));

    const { rows: linije } = await client.query('SELECT linija_id, broj FROM linija ORDER BY linija_id');
    console.log(`${linije.length} linija za obradu\n`);

    for (const l of linije) {
      await uvezilLiniju(client, l.linija_id, l.broj.trim(), stanicaIds, nepovezane);
    }
  } finally {
    client.release();
  }

  console.log(`\nGotovo. Nepovezanih stanica: ${nepovezane.length}`);
  nepovezane.forEach(n => console.log(`  linija=${n.brojLinije} smer=${n.smer} r.b.=${n.redniBroj} stanica_id=${n.stanicaId}`));

  await pool.end();
})();