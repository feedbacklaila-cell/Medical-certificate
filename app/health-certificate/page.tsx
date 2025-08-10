"use client";
import Image from "next/image";

export default function HealthCertificatePage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-0 m-0 relative">
      {/* الصورة داخل حاوية نسبية */}
      <div className="relative w-full" style={{ maxWidth: "2048px" }}>
        <Image
          src="/tr1.png"
          alt="الشهادة الصحية"
          width={2048}
          height={1283}
          priority
          className="object-contain w-full h-auto"
        />

        {/* المربعات النصية بالنسبة المئوية */}
       <div
  className="absolute text-black"
  style={{
    left: "85.0%",
    top: "41%",
    width: "24.41%",
    height: "3.9%",
    fontSize: "28px", // هنا تحدد الحجم بالبكسل
    fontWeight: "bold" // إذا أردت يكون عريض
  }}
>
  <span>1234567890</span>
</div>

        <div
  className="absolute text-black"
  style={{
    left: "82.0%",
    top: "55%",
    width: "24.41%",
    height: "3.9%",
    fontSize: "28px", // هنا تحدد الحجم بالبكسل
    fontWeight: "bold" // إذا أردت يكون عريض
  }}
>
  <span>1234567890123</span>
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
    </div>
  );
}
