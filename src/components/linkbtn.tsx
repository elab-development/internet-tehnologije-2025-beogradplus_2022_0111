'use client'
import Link from 'next/link'

export default function Linkbtn({ href = "", label = "" }) {
  return (
    <Link
      href={href}
      className="nav-link text-white w-100 mb-3"
      style={{ display: 'block', padding: '0.5rem 0rem' }}
    >
      {label}
    </Link>
  );
}
