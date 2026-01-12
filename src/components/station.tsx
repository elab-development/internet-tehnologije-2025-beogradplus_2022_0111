import {Stanica} from '../types/modeli'


export default function StationItem({ stanica, onClick }: { stanica: Stanica; onClick: () => void }) {
  return (
    <div
      className="px-3 py-2 border-bottom"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="fw" style={{ fontSize: "0.9rem" }}>{stanica.naziv}</div>
        </div>
        {!stanica.aktivna && (
          <span className="badge bg-secondary">Neaktivna</span>
        )}
      </div>
    </div>
  );
}