export interface Korisnik {
  korisnik_id?: number;
  email: string;
  password_hash: string;
  ime: string;
  datum_kreiranja: Date; 
  uloga_id: number;      
}

export interface Uloga {
  uloga_id: number;
  naziv: string;
  opis: string;
}

export interface Stanica {
  stanica_id: number;
  naziv: string;
  lat: number;
  lng: number;
  aktivna: boolean;
}

export interface Linija {
  linija_id: number;
  broj: string;
  tip: number;
  ime_linije: string;
  aktivna: boolean;
}

export interface LinijaStanica {
  linija_id: number;
  stanica_id: number;
  redni_broj: number;
}

export interface OmiljenaStanica {
  korisnik_id: number;
  stanica_id: number;
  os_id: number;
}

export interface OmiljenaLinija {
  korisnik_id: number;
  linija_id: number;
  ol_id: number;
}