BEGIN;

CREATE TABLE prijava_kvara (
  prijava_id SERIAL PRIMARY KEY,
  korisnik_id INTEGER NOT NULL,
  stanica_id INTEGER NOT NULL,
  opis TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'novo',
  datum_kreiranja TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prijava_kvara_status_chk CHECK (status IN ('novo', 'u_radu', 'reseno')),
  CONSTRAINT prijava_kvara_korisnik_fk FOREIGN KEY (korisnik_id)
    REFERENCES korisnik(korisnik_id) ON DELETE CASCADE,
  CONSTRAINT prijava_kvara_stanica_fk FOREIGN KEY (stanica_id)
    REFERENCES stanica(stanica_id) ON DELETE CASCADE
);

COMMIT;
