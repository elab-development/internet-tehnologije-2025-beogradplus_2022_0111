'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

import Sidebar from '../components/sidebar';
import Searchbar from '../components/searchbar';

function donesiMapu() {
  return import('../components/map');
}

const Map = dynamic(donesiMapu, { ssr: false });

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   const auth = sessionStorage.getItem("auth");
  //   if (!auth) {
  //     router.push("/login");
  //   }
  // }, [router]);

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      <div
        style={{
          height: "100vh",
          width: "6vw",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Sidebar />
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "relative", zIndex: 0, height: "100%", width: "100%" }}>
          <Map visina="100%" sirina="100%" />
        </div>

        <div
          style={{
            position: "absolute",
            left: "1vw",
            top: "1%",
            zIndex: 9999
          }}
        >
          <Searchbar />
        </div>
      </div>
    </div>
  );
}
