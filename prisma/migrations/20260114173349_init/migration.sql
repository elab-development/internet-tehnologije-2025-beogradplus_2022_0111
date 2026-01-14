-- CreateTable
CREATE TABLE "uloge" (
    "uloga_id" SERIAL NOT NULL,
    "naziv" VARCHAR(50) NOT NULL,
    "opis" TEXT,

    CONSTRAINT "uloge_pkey" PRIMARY KEY ("uloga_id")
);

-- CreateTable
CREATE TABLE "korisnici" (
    "korisnik_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "ime" VARCHAR(100) NOT NULL,
    "datum_kreiranja" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uloga_id" INTEGER NOT NULL,

    CONSTRAINT "korisnici_pkey" PRIMARY KEY ("korisnik_id")
);

-- CreateTable
CREATE TABLE "stanice" (
    "stanica_id" SERIAL NOT NULL,
    "naziv" VARCHAR(255) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "aktivna" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "stanice_pkey" PRIMARY KEY ("stanica_id")
);

-- CreateTable
CREATE TABLE "linije" (
    "linija_id" SERIAL NOT NULL,
    "broj" VARCHAR(10) NOT NULL,
    "tip" VARCHAR(50) NOT NULL,
    "ime_linije" VARCHAR(255) NOT NULL,
    "aktivna" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "linije_pkey" PRIMARY KEY ("linija_id")
);

-- CreateTable
CREATE TABLE "linija_stanica" (
    "linija_id" INTEGER NOT NULL,
    "stanica_id" INTEGER NOT NULL,

    CONSTRAINT "linija_stanica_pkey" PRIMARY KEY ("linija_id","stanica_id")
);

-- CreateTable
CREATE TABLE "omiljene_stanice" (
    "korisnik_id" INTEGER NOT NULL,
    "stanica_id" INTEGER NOT NULL,

    CONSTRAINT "omiljene_stanice_pkey" PRIMARY KEY ("korisnik_id","stanica_id")
);

-- CreateTable
CREATE TABLE "omiljene_linije" (
    "korisnik_id" INTEGER NOT NULL,
    "linija_id" INTEGER NOT NULL,

    CONSTRAINT "omiljene_linije_pkey" PRIMARY KEY ("korisnik_id","linija_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "korisnici_email_key" ON "korisnici"("email");

-- AddForeignKey
ALTER TABLE "korisnici" ADD CONSTRAINT "korisnici_uloga_id_fkey" FOREIGN KEY ("uloga_id") REFERENCES "uloge"("uloga_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linija_stanica" ADD CONSTRAINT "linija_stanica_linija_id_fkey" FOREIGN KEY ("linija_id") REFERENCES "linije"("linija_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linija_stanica" ADD CONSTRAINT "linija_stanica_stanica_id_fkey" FOREIGN KEY ("stanica_id") REFERENCES "stanice"("stanica_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "omiljene_stanice" ADD CONSTRAINT "omiljene_stanice_korisnik_id_fkey" FOREIGN KEY ("korisnik_id") REFERENCES "korisnici"("korisnik_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "omiljene_stanice" ADD CONSTRAINT "omiljene_stanice_stanica_id_fkey" FOREIGN KEY ("stanica_id") REFERENCES "stanice"("stanica_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "omiljene_linije" ADD CONSTRAINT "omiljene_linije_korisnik_id_fkey" FOREIGN KEY ("korisnik_id") REFERENCES "korisnici"("korisnik_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "omiljene_linije" ADD CONSTRAINT "omiljene_linije_linija_id_fkey" FOREIGN KEY ("linija_id") REFERENCES "linije"("linija_id") ON DELETE CASCADE ON UPDATE CASCADE;
