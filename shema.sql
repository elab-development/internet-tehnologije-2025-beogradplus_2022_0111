CREATE TABLE uloga (
  uloga_id SERIAL PRIMARY KEY,
  naziv VARCHAR(50) NOT NULL,
  opis TEXT
);

CREATE TABLE korisnik (
  korisnik_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  ime VARCHAR(100) NOT NULL,
  datum_kreiranja TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  uloga_id INTEGER NOT NULL,
  FOREIGN KEY (uloga_id) REFERENCES uloga(uloga_id)
);

CREATE TABLE stanica (
  stanica_id SERIAL PRIMARY KEY,
  naziv VARCHAR(255) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  aktivna BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE linija (
  linija_id SERIAL PRIMARY KEY,
  broj VARCHAR(10) NOT NULL,
  tip VARCHAR(50) NOT NULL,
  ime_linije VARCHAR(255) NOT NULL,
  aktivna BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE linija_stanica (
  linija_id INTEGER NOT NULL,
  stanica_id INTEGER NOT NULL,
  PRIMARY KEY (linija_id, stanica_id),
  FOREIGN KEY (linija_id) REFERENCES linija(linija_id) ON DELETE CASCADE,
  FOREIGN KEY (stanica_id) REFERENCES stanica(stanica_id) ON DELETE CASCADE
);

CREATE TABLE omiljena_stanica (
  korisnik_id INTEGER NOT NULL,
  stanica_id INTEGER NOT NULL,
  PRIMARY KEY (korisnik_id, stanica_id),
  FOREIGN KEY (korisnik_id) REFERENCES korisnik(korisnik_id) ON DELETE CASCADE,
  FOREIGN KEY (stanica_id) REFERENCES stanica(stanica_id) ON DELETE CASCADE
);

CREATE TABLE omiljena_linija (
  korisnik_id INTEGER NOT NULL,
  linija_id INTEGER NOT NULL,
  PRIMARY KEY (korisnik_id, linija_id),
  FOREIGN KEY (korisnik_id) REFERENCES korisnik(korisnik_id) ON DELETE CASCADE,
  FOREIGN KEY (linija_id) REFERENCES linija(linija_id) ON DELETE CASCADE
);