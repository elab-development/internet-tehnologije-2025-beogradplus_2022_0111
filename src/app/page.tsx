'use client'
import dynamic from 'next/dynamic';

function donesiMapu() {
  return import('../components/map');
}
const Map = dynamic(donesiMapu, { ssr: false });

export default function Home() {
  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>

      <Map visina="100vh" sirina="100vw" /> 

    </div>
  );
}