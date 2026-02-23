# BeogradPlus

## Opis aplikacije
BeogradPlus je web aplikacija za pregled i upravljanje gradskim prevozom u Beogradu.  
Sadrzi rad sa stanicama i linijama, prijavu/registraciju korisnika, omiljene linije i stanice, kao i admin funkcionalnosti.  
API dokumentacija je dostupna kroz Swagger (`/docs`) i OpenAPI JSON (`/api/docs`).

## Koriscene tehnologije
- Next.js (App Router)
- React
- TypeScript
- Supabase (`@supabase/supabase-js`)
- Swagger/OpenAPI (`swagger-jsdoc`, `swagger-ui-react`)
- Docker i Docker Compose

## Lokalno pokretanje aplikacije
1. Kloniraj repozitorijum i udji u projekat:
```bash
git clone <repo-url>
cd internet-tehnologije-2025-beogradplus_2022_0111
```

2. Napravi `.env` (i po potrebi `.env.local`) fajl sa potrebnim promenljivama:
```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
salt_rounds=10
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Instaliraj zavisnosti:
```bash
npm install
```

4. Pokreni development server:
```bash
npm run dev
```

5. Otvori aplikaciju:
- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs`

## Pokretanje pomocu Dockera i Docker Compose-a
1. Proveri da postoji `.env` fajl u root folderu projekta.

2. Build + start:
```bash
docker compose up --build -d
```

3. Otvori aplikaciju:
- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs`

4. Zaustavljanje kontejnera:
```bash
docker compose down
```
