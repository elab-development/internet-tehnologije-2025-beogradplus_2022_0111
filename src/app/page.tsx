'use client'
import dynamic from 'next/dynamic';

function donesiMapu()
{
  return import ('../components/map');
}
const Map  = dynamic(donesiMapu, {ssr:false});
   
export default function Home() {
  return (
    <div className="d-flex align-items-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      
      <div className="card shadow rounded overflow-hidden" 
        style={{ height: "100vh", width: "1024px", backgroundColor: "white" }}>

        <div className="d-flex align-items-center mx-auto" style={{ height: "100%", width: "972px" }}>
            <Map visina="80%" sirina="100%" /> 
        </div>

      </div>

    </div>
  );
}
