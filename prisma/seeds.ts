const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  const filePath = path.join(process.cwd(), "prisma", "stops.txt");
  
  console.log(`Učitavam fajl sa: ${filePath}`);

  const stanice: { stanica_id: number; naziv: any; lat: number; lng: number; aktivna: boolean; }[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: { stop_code: any; stop_id: any; stop_name: any; stop_lat: string; stop_lon: string; }) => {
        try {
          const id = parseInt(row.stop_code || row.stop_id, 10);
          const naziv = row.stop_name;
          const lat = parseFloat(row.stop_lat);
          const lng = parseFloat(row.stop_lon);

          if (!isNaN(id) && naziv && !isNaN(lat) && !isNaN(lng)) {
            stanice.push({ 
              stanica_id: id, 
              naziv, 
              lat, 
              lng, 
              aktivna: true 
            });
          } else {
            console.warn(`Preskačem nevalidan red:`, row);
          }
        } catch (err) {
          console.error(`Greška pri parsiranju reda:`, row, err);
        }
      })
      .on("end", () => {
        console.log(`Učitano ${stanice.length} stanica iz CSV fajla`);
        resolve();
      })
      .on("error", (err: any) => {
        console.error("Greška pri čitanju fajla:", err);
        reject(err);
      });
  });

  if (stanice.length > 0) {
    console.log("Ubacujem stanice u bazu...");
    try {
      await prisma.stanica.createMany({
        data: stanice,
        skipDuplicates: true,
      });
      console.log(`✅ Uspešno ubačeno ${stanice.length} stanica!`);
    } catch (err) {
      console.error("❌ Greška prilikom ubacivanja u bazu:", err);
      throw err;
    }
  } else {
    console.log("⚠️ Nema stanica za ubacivanje");
  }
}

main()
  .catch((e) => {
    console.error("❌ Fatalna greška:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Prisma konekcija zatvorena");
  });
  