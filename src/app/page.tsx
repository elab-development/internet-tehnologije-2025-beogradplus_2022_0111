'use client'
import dynamic from 'next/dynamic';

function donesiMapu()
{
  return import ('../components/map');
}
const Map  = dynamic(donesiMapu, {ssr:false});
   
export default function Home() {
  return (
   <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      
      <div className="card shadow rounded overflow-hidden d-flex justify-content-center align-items-center" 
           style={{ height: "85vh", width: "1024px", backgroundColor: "white" }}>
        <div style={{ height: "75vh", width: "972px" }}>
          <Map visina="100%" sirina="100%" /> 
        </div>

      </div>

    </div>

  );
  
}
