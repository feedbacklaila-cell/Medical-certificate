"use client";
import { toHijri } from 'hijri-converter';
import '../../styles/fonts.css';
import { useState, useEffect } from "react";


interface HealthCertificateData {
  amana: string;
  baladia: string;
  name: string;
  idNumber: string;
  gender: string;
  nationality: string;
  healthCertificateNumber: string;
  jobTitle: string;
  programType: string;
  licenseNumber: string;
  establishmentName: string;
  establishmentNumber: string;
  certificateIssueDate: string;
  healthCertificateIssueDate: string;
  certificateType: string;
  programEndDate: string;
  personImageUrl: string;
  qrCodeImageUrl: string;
}

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

export default function VerifyLeavePage() {
  const [certificateData, setCertificateData] = useState<HealthCertificateData | null>(null);

  useEffect(() => {
    // بيانات ثابتة بدلاً من جلبها من Firebase
    const staticData: HealthCertificateData = {
      amana: "أمانة منطقة الرياض",
      baladia: "بلدية الرياض",
      name: "محمد أحمد السعدون",
      idNumber: "1098765432",
      gender: "ذكر",
      nationality: "سعودي",
      healthCertificateNumber: "SH-2023-87654",
      jobTitle: "طاهٍ",
      programType: "برنامج التثقيف الصحي للمطاعم",
      licenseNumber: "L-7890-2023",
      establishmentName: "مطعم النخبة الذهبية",
      establishmentNumber: "EST-4567-2023",
      certificateIssueDate: "2023-10-15",
      healthCertificateIssueDate: "2024-10-14",
      certificateType: "شهادة صحية",
      programEndDate: "2024-04-15",
      personImageUrl: "/face.jpg",
      qrCodeImageUrl: "/qr-code-placeholder.png"
    };
    
    setCertificateData(staticData);
  }, []);

  // const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* شريط التنقل */}
      {/* <div className="bg-[#07706d] border-b border-gray-200 flex justify-between items-center p-6 relative">
        <button
          className="p-2 rounded-md text-white hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2 ml-6">
          <img src="/logoll.png" alt="logo" style={{ width: "110px", height: "50px" }} />
        </div>

        {open && (
          <div className="absolute top-full right-0 mt-0 bg-[#07706d] shadow-lg rounded-b-md p-4 flex flex-col space-y-3 text-white w-full z-50">
            <a href="#" className="hover:bg-[#055e5b] flex items-center justify-between py-3 px-4 rounded-md">
              <span>عن بلدي</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#" className="hover:bg-[#055e5b] flex items-center justify-between py-3 px-4 rounded-md">
              <span>مركز المعرفة</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#" className="hover:bg-[#055e5b] flex items-center justify-between py-3 px-4 rounded-md">
              <span>الخدمات</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#" className="hover:bg-[#055e5b] flex items-center justify-between py-3 px-4 rounded-md">
              <span>الاستعلامات</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#" className="hover:bg-[#055e5b] flex items-center justify-between py-3 px-4 rounded-md">
              <span>المنصات</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#" className="hover:bg-[#055e5b] flex items-center justify-between py-3 px-4 rounded-md">
              <span>تواصل معنا</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        )}
      </div> */}
     
      {/* عرض النتيجة */}
      {certificateData && (
        <div className="flex justify-center mt-4 px-4">
          <div className="w-full max-w-4xl rounded-lg overflow-hidden bg-white">
            {/* محتوى البطاقة */}
           
            {/* صورة الشخص مع العنوان فوقها مباشرة */}
           <div className="flex flex-col items-center mb-3">
  <h2 className="text-xl font-semibold text-[#306db5] mb-2">
    <span 
        className="relative font-bold -top-2 text-[35px] text-[#484e56]" 
  style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
    >
     {certificateData.certificateType}
    </span>
  </h2>
  {certificateData.personImageUrl && (
    <img 
      src={certificateData.personImageUrl} 
      alt="صورة الشخص" 
      className="max-w-xs max-h-60"
    />
  )}
</div>

            
{/* صف يحتوي على الأمانة والبلدية */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div>
    <p className="text-sm font-bold">الامانة</p>
    <div className="border p-2">
      {certificateData.amana}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">البلدية</p>
    <div className="border p-2">
      {certificateData.baladia}
    </div>
  </div>
</div>

{/* البيانات الأساسية */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div>
    <p className="text-sm font-bold">الاسم الكامل</p>
    <div className="border p-2">
      {certificateData.name || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">رقم الهوية/الإقامة</p>
    <div className="border p-2">
      {certificateData.idNumber || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">الجنس</p>
    <div className="border p-2">
      {certificateData.gender || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">الجنسية</p>
    <div className="border p-2">
      {certificateData.nationality || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">رقم الشهادة الصحية</p>
    <div className="border p-2">
      {certificateData.healthCertificateNumber || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">المهنة</p>
    <div className="border p-2">
      {certificateData.jobTitle || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">نوع البرنامج التثقيفي</p>
    <div className="border p-2">
      {certificateData.programType || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">رقم الرخصة</p>
    <div className="border p-2">
      {certificateData.licenseNumber || "-"}
    </div>
  </div>
</div>

{/* معلومات المنشأة */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div>
    <p className="text-sm font-bold">اسم المنشأة</p>
    <div className="border p-2">
      {certificateData.establishmentName || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">رقم المنشأة</p>
    <div className="border p-2">
      {certificateData.establishmentNumber || "-"}
    </div>
  </div>
</div>

{/* التواريخ */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div>
    <p className="text-sm font-bold">تاريخ إصدار الشهادة الميلادي</p>
    <div className="border p-2">
      {certificateData.certificateIssueDate 
        ? certificateData.certificateIssueDate.replace(/-/g, "/") 
        : "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">تاريخ إصدار الشهادة هجري</p>
    <div className="border p-2">
      {convertToHijri(certificateData.certificateIssueDate) || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">تاريخ انتهاء الشهادة الميلادي</p>
    <div className="border p-2">
      {certificateData.healthCertificateIssueDate 
        ? certificateData.healthCertificateIssueDate.replace(/-/g, "/") 
        : "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">تاريخ انتهاء الشهادة هجري</p>
    <div className="border p-2">
      {convertToHijri(certificateData.healthCertificateIssueDate) || "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">تاريخ انتهاء البرنامج الميلادي</p>
    <div className="border p-2">
      {certificateData.programEndDate 
        ? certificateData.programEndDate.replace(/-/g, "/") 
        : "-"}
    </div>
  </div>
  <div>
    <p className="text-sm font-bold">تاريخ انتهاء البرنامج هجري</p>
    <div className="border p-2">
      {convertToHijri(certificateData.programEndDate) || "-"}
    </div>
  </div>
</div>

              
           
          </div>
        </div>
      )}

      {/* الفوتر */}
      <footer className="bg-white text-black mt-12 py-6">
        {/* <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 space-y-4 md:space-y-0">
          <div className="flex flex-col items-center space-y-2 rtl:space-y-reverse">
            <img src="/logaup.svg" alt="moh-approved" className="w-25 h-15" />
            <div 
  className="text-xs text-center" 
  style={{ fontFamily: "Tajawal", fontWeight: 500, color: "black" }}
>
  © 2025 وزارة البلديات والإسكان
</div>

          </div>

        <div 
  className="flex flex-wrap justify-center md:justify-end space-x-4 rtl:space-x-reverse text-sm text-black text-center" 
  style={{ fontFamily: "Tajawal", fontWeight: 500 }}
>
  <a href="#" className="hover:underline">اتصل بنا</a>
  <a href="#" className="hover:underline">شروط الاستخدام</a>
  <a href="#" className="hover:underline">اتصل بنا</a>
</div>

        </div> */}
      </footer>
    </div>
  );
}