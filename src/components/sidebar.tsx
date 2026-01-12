'use client'
import Linkbtn from './linkbtn'

export default function Sidebar() {
    return (
        <aside className="d-flex flex-column bg-dark text-white p-3 vh-100 gap-3">
            <nav className="d-flex flex-column w-100">
                <Linkbtn href="/" label="Početna" />
                <Linkbtn href="/aboutus" label="O nama" />
                <Linkbtn href="/user" label="Korisnik" />
            </nav>
        </aside>
    );
}
