"use client";
import Image from "next/image";

export default function HealthCertificatePage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-0 m-0 relative">
      {/* الصورة داخل حاوية نسبية */}
        <Image
          src="/tr1.png"
          alt="الشهادة الصحية"
          width={2048}
          height={1283}
          priority
          className="object-contain w-full h-auto"
        />

   {/* صورة الشخص مكان المربع الأخضر */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: "2.9%",
            top: "8.3%",
            width: "18.5%",
            height: "11.8%"
          }}
        >
          <Image
            src="/face.jpg" // ضع مسار الصورة هنا
            alt="صورة الشخص"
            fill
            className="object-cover"
          />
        </div>
     
    
        {/* المربعات النصية بالنسبة المئوية */}
       <div className="absolute text-black" style={{ left: "70.83%", top: "12.47%", width: "24.41%", height: "3.9%" }}>
          <span>1234567890</span>
        </div>
        <div className="absolute text-black" style={{ left: "46.38%", top: "12.47%", width: "19.53%", height: "3.9%" }}>
          <span>Indian</span>
        </div>
        <div className="absolute text-black" style={{ left: "70.83%", top: "21.04%", width: "24.41%", height: "3.9%" }}>
          <span>HC-987654</span>
        </div>
        <div className="absolute text-black" style={{ left: "46.38%", top: "21.04%", width: "19.53%", height: "3.9%" }}>
          <span>Worker</span>
        </div>
        <div className="absolute text-black" style={{ left: "70.83%", top: "29.6%", width: "24.41%", height: "3.9%" }}>
          <span>2025-01-01</span>
        </div>
        <div className="absolute text-black" style={{ left: "46.38%", top: "29.6%", width: "19.53%", height: "3.9%" }}>
          <span>2026-01-01</span>
        </div>
        <div className="absolute text-black" style={{ left: "70.83%", top: "38.18%", width: "24.41%", height: "3.9%" }}>
          <span>Food Safety</span>
        </div>
        <div className="absolute text-black" style={{ left: "46.38%", top: "38.18%", width: "19.53%", height: "3.9%" }}>
          <span>2026-06-01</span>
        </div>
      </div>
   
  );
}
