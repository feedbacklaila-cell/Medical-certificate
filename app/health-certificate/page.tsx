"use client";
import { toHijri } from 'hijri-converter';
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "../firebaseConfig";

import { collection, query, where, getDocs } from "firebase/firestore";

type HealthCertificateData = {
  personImageUrl: string;
  qrCodeImageUrl: string;
  amanaImageUrl: string;
  certificateType: string;
  name: string;
  idNumber: string;
  nationality: string;
  healthCertificateNumber: string;
  jobTitle: string;
  certificateIssueDate: string;
  healthCertificateIssueDate: string;
  programType: string;
  programEndDate: string;
};

export default function HealthCertificatePage() {
  const [certificateData, setCertificateData] = useState<HealthCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const certificateNumber = urlParams.get("certificateNumber");

    if (certificateNumber) {
      fetchCertificateByNumber(certificateNumber);
    } else {
      setError("لم يتم تقديم رقم شهادة صالح");
      setLoading(false);
    }
  }, []);

  const fetchCertificateByNumber = async (certificateNumber: string) => {
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "healthCertificates"),
        where("healthCertificateNumber", "==", certificateNumber)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data() as HealthCertificateData;
        setCertificateData(data);
      } else {
        setError("لم يتم العثور على الشهادة بهذا الرقم");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء جلب البيانات");
    }

    setLoading(false);
  };
// دالة لتحويل التاريخ الميلادي إلى هجري
function convertToHijri(gregorianDateStr: string): string {
  if (!gregorianDateStr) return '';
  
  try {
    const date = new Date(gregorianDateStr);
    if (isNaN(date.getTime())) return '';

    // تحويل التاريخ الميلادي إلى هجري
    const hijriDate = toHijri(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );

    const day = hijriDate.hd.toString().padStart(2, '0');
    const month = hijriDate.hm.toString().padStart(2, '0');
    const year = hijriDate.hy.toString();

    return `${year}/${month}/${day}`;
  } catch (error) {
    console.error('Error converting to Hijri date:', error);
    return '';
  }
}

  if (loading) {
    return <div className="text-center mt-10">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!certificateData) return null;

  return (
    <div className="relative overflow-x-hidden w-full max-w-[2814px] mx-auto">
      {/* الصورة الأساسية للشهادة */}
      <div className="relative w-full" style={{ paddingTop: "62.65%" }}>
        <Image
          src="/tr2.png"
          alt="الشهادة الصحية"
          fill
          className="object-cover"
          priority
        />

        {/* صورة الشخص */}
       <div
  className="absolute overflow-hidden"
  style={{
    left: "2.9%",
    top: "21.3%",
    width: "18.5%",
    height: "30%"
  }}
>
  <img
    src= "/face.jpg"
    alt="صورة الشخص"
    style={{ width: "100%", height: "100%", objectFit: "fill" }}
  />
</div>

        {/* QR */}
      <div
  className="absolute overflow-hidden"
  style={{
    left: "2.9%",
    top: "57.8%",
    width: "18.5%",
    height: "29%"
  }}
>
  <img
     src= "/qr1.png"
    alt="QR Code"
    style={{ width: "100%", height: "100%", objectFit: "fill" }}
  />
</div>

        {/* شعار */}
       <div
  className="absolute overflow-hidden"
  style={{
    left: "66.5%",
    top: "2.5%",
    width: "11.2%",
    height: "17%"
  }}
>
  <img
       src= "/up.png"
    alt="الشعار"
    style={{ width: "100%", height: "100%", objectFit: "fill" }}
  />
</div>

        {/* عنوان */}
        <div
          className="absolute flex items-center justify-center font-bold"
          style={{
            left: "1.7%",
            top: "5.6%",
            width: "48.2%",
            height: "5.5%",
            color: "white",
            fontFamily: "Tanseek",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "7.5vw" }}>
            {certificateData.certificateType}
          </span>
        </div>

        {/* البيانات */}
        <div
          className="absolute flex items-center justify-start font-bold"
          style={{
            left: "69.5%",
            top: "26.6%",
            width: "48.2%",
            height: "5.5%",
            color: "#0c7773",
            fontFamily: "Droid",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "2.4vw" }}>{certificateData.name}</span>
        </div>

        <div
          className="absolute text-black"
          style={{
            left: "78.8%",
            top: "40.7%",
            fontSize: "2.1vw",
            width: "24.41%",
            height: "3.9%",
            textAlign: "center",
            lineHeight: "150%",
          }}
        >
          <span>{certificateData.idNumber}</span>
        </div>

        <div
          className="absolute text-black"
          style={{
            left: "39%",
            direction: "rtl",
            top: "40.7%",
            width: "19.53%",
            height: "3.9%",
            fontSize: "2.1vw",
            fontFamily: "Droid",
           
          }}
        >
          <span>{certificateData.nationality}</span>
        </div>

        <div
          className="absolute text-black"
          style={{
            left: "82.8%",
            top: "55%",
            fontSize: "2.1vw",
            width: "24.41%",
            height: "3.9%",
          }}
        >
          <span>{certificateData.healthCertificateNumber}</span>
           
        </div>

        <div
          className="absolute text-black"
          style={{
             left: "39%",
            direction: "rtl",
            top: "55%",
            width: "19.53%",
            height: "3.9%",
            fontSize: "2.1vw",
            fontFamily: "Droid",
          
          }}
        >
          <span>{certificateData.jobTitle}</span>
        </div>

        <div
          className="absolute text-black"
          style={{
            left: "86%",
            top: "68.5%",
            fontSize: "2.1vw",
            width: "24.41%",
            height: "3.9%",
          }}
        >
          <span> {convertToHijri(certificateData.certificateIssueDate) || "-"}</span>
           
        </div>

        <div
          className="absolute text-black"
          style={{
            left: "47.9%",
            top: "68.5%",
            width: "19.53%",
            height: "3.9%",
            fontSize: "2.1vw",
          }}
        >
        
               <span> {convertToHijri(certificateData.healthCertificateIssueDate) || "-"}</span>

        </div>

       <div
  className="absolute text-black"
  style={{
    left: "72.5%",
    top: "82%",
    fontSize: "2.1vw",
    width: "24.41%",
    height: "3.9%",
    fontFamily: "Droid",
    textAlign: "right",    // النص يلتزم باليمين
    direction: "rtl",      // يضمن أن البداية من اليمين
    whiteSpace: "nowrap",  // كله في سطر واحد
  }}
>
  <span
    style={{
      display: "inline-block",
      paddingLeft: "9999px", // يخلي أي زيادة تخرج لليسار
    }}
  >
    {certificateData?.programType}
  </span>
</div>


        <div
          className="absolute text-black"
          style={{
            left: "47.9%",
            top: "82%",
            fontSize: "2.1vw",
            width: "19.53%",
            height: "3.9%",
          }}
        >
       
          <span> {convertToHijri(certificateData.programEndDate) || "-"}</span>
        </div>
      </div>
      <div className="relative w-full mt-10" style={{ paddingTop: "62.65%" }}>
        <Image
          src="/tr1.png"
          alt="نسخة ثانية للشهادة"
          fill
          className="object-cover"
        />
      </div>
    </div>
    

      
   
  );
}
