'use client'
import dynamic from 'next/dynamic';
import Sidebar from '../components/sidebar'
function donesiMapu() {
  return import('../components/map');
}
const Map = dynamic(donesiMapu, { ssr: false });

export default function Home() {
  return (

    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>

      <div style={{ height: "100vh", width: "7vw", display: "flex", flexDirection: "column" }}>
        <Sidebar />
      </div>

      <div style={{ flex: 1 }}>
        <Map visina="100vh" sirina="100%" />
      </div>
    </div>


  );
}