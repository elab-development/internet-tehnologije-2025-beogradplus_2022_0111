'use client'
import Link from 'next/link'

export default function Linkbtn({ href = "", label = "", className = "" }) {
  const finalClass = className || "nav-link text-white w-100 mb-3";
  return (
    <Link
      href={href}
      className={finalClass}
      style={{ display: 'inline-block', textDecoration: 'none' }}
    >
      {label}
    </Link>
  );
}
