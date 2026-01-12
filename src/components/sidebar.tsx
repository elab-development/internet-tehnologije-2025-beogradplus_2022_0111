'use client'
import Linkbtn from './linkbtn'

export default function Sidebar() {
    return (
        <aside className="d-flex flex-column bg-dark text-white p-3 vh-100 gap-3">
            <nav className="d-flex flex-column w-100">
                <Linkbtn href="/" label="Home" />
                <Linkbtn href="/map" label="Map" />
                <Linkbtn href="/locations" label="Locations" />
                <Linkbtn href="/settings" label="Settings" />
            </nav>
        </aside>
    );
}
