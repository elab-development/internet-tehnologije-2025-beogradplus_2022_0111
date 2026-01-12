import {Linija} from '../types/modeli'
export default function LineItem({ linija, onClick }: { linija: Linija; onClick: () => void }) {
  return (
    <div
      className="px-3 py-2 border-bottom"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <div className="d-flex align-items-center gap-2">
        <span className="fw-bold" style={{ 
          backgroundColor: linija.tip === "autobus" ? "#dc3545" : "#0d6efd",
          color: "white",
          padding: "2px 8px",
          borderRadius: 4,
          fontSize: "0.9rem"
        }}>
          {linija.broj}
        </span>
        <span style = {{fontSize: "0.9rem"}}>{linija.ime_linije}</span>
        {!linija.aktivna && (
          <span className="badge bg-secondary ms-auto">Neaktivna</span>
        )}
      </div>
    </div>
  );
}