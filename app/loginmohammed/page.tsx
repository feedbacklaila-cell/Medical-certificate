"use client";
import { toHijri } from 'hijri-converter';
import '../../styles/fonts.css';
import { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";


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

// بيانات القوائم الفرعية (يمكن استبدالها ببيانات حقيقية)
const menuItemsData = {
  "عن بلدي": [
    { 
      title: " من نحن", 
      descriptions: [
        "من نحن",
        "الهيكل التنظيمي",
        "الهيكل الإستراتيجي للوزارة",
         "السياسات والاستراتيجيات",
          "أهداف التنمية المستدامة",
           "أهداف التنمية المستدامة",
            "الوظائف",
             "تواصل معنا"
      ] 
    },
    { 
      title: "المشاركة الإلكترونية", 
      descriptions: [
        "الاستشارات",
        "بيان المشاركة الالكترونية",
        "البيانات المفتوحة",
        "التغذية الراجعة",
        "التطوير المشترك والأفكار",
        "وسائل التواصل الاجتماعي"
      ] 
    },
    { 
      title: "الأخبار والفعاليات", 
      descriptions: [
        "الأخبار",
        "الفعاليات"
      ] 
    },
    { 
      title: "المنافسات والميزانية", 
      descriptions: [
        "المنافسات والمشتريات",
        "الميزانية والإنفاق"
      ] 
    }
  ],
  "مركز المعرفة": [
    { 
      title: "مبادرات وشراكات", 
      descriptions: [
        "المبادرات",
        "الشراكات",
        "منصة استطلاع",
        "منصة تفاعل",
      ] 
    },
    { 
      title: "بيانات وإحصائيات", 
      descriptions: [
        "البيانات المفتوحة",
        "إحصائيات ومؤشرات المنصة"
      ] 
    },
  ],
"الخدمات": [
  { 
    "title": "الصفحات الشخصية", 
    "descriptions": [
      "إدارة الطلبات",
      "إدارة الرخص",
      "لوحة التحكم"
    ] 
  },
  { 
    "title": "المنظمات والأنظمة", 
    "descriptions": [
      "منصة رسم إشغال مرافق الإيواء",
      "منصة رسم تقديم منتجات التبغ",
      "بلدي أعمال",
      "تصنيف مقدمي خدمات المدن"
    ] 
  },
  { 
    "title": "التفويض البلدي الإلكتروني", 
    "descriptions": [
      "إضافة منشأة إلى مدير حساب",
      "الاستعلام عن طلبات منشأة",
      "الاستعلام عن مفوضي منشأة"
    ] 
  },
  { 
    "title": "الرخص التجارية", 
    "descriptions": [
      "إصدار رخصة تجارية",
      "تجديد رخصة نشاط تجاري",
      "إلغاء رخصة نشاط تجاري"
    ] 
  },
  { 
    "title": "الرخص الإنشائية", 
    "descriptions": [
      "إصدار رخصة بناء",
      "خدمة إصدار رخصة تسوير أراضي فضاء"
    ] 
  },
  { 
    "title": "الشهادات الصحية", 
    "descriptions": [
      "إصدار شهادة صحية",
      "تجديد شهادة صحية"
    ] 
  },
  { 
    "title": "خدمات تنسيق المشروعات", 
    "descriptions": [
      "خدمات تنسيق أعمال البنية التحتية",
      "خدمات تنسيق المشروعات الكبرى"
    ] 
  },
  { 
    "title": "خدمات التقارير المساحية", 
    "descriptions": [
      "إصدار تقرير مساحي"
    ] 
  }
],
"الاستعلامات": [
  { 
    "title": "الاستعلامات العامة", 
    "descriptions": [
      "العقود النموذجية",
      "الاستعلام عن المخالفة للإجراءات الاحترازية",
      "حاسبة الرسوم المعلوماتية",
      "الاستعلام عن المكاتب الهندسية",
      "الاستعلام عن عقود النظافة",
      "أسواق المتاجر المتنقلة"
    ] 
  },
  { 
    "title": "الأراضي والبناء", 
    "descriptions": [
      "الاستعلام عن العمارة السعودية",
      "استعلام عن رخصة بناء",
      "المستكشف الجغرافي",
      "مستكشف التغطية لخدمات البنية التحتية",
      "الاستعلام عن تقرير مساحي"
    ] 
  },
  { 
    "title": "الاستعلامات التجارية", 
    "descriptions": [
      "الاستعلام عن الرخص التشغيلية للوحات الدعائية والاعلانية",
      "استعلام عن رخصة نشاط تجاري",
      "الأنشطة التجارية والاشتراطات البلدية",
      "الاستعلام عن مسارات العربات المتجولة"
    ] 
  },
  { 
    "title": "خدمات إكرام الموتى", 
    "descriptions": [
      "الاستعلام عن مقدمي خدمات نقل وتجهيز الموتى (الجهات الخيرية)",
      "الاستعلام عن قبر متوفي",
      "طباعة شهادة دفن",
      "الاستعلام عن المقابر",
      "الدليل التنظيمي للوحات التجارية"
    ] 
  }
],

  "المنصات": [
    { 
      title: "المنصة التعليمية", 
      descriptions: [
        "منصة للتعلم الإلكتروني",
        "دورات تدريبية وتأهيلية"
      ] 
    },
    { 
      title: "منصة المشاركة", 
      descriptions: [
        "المشاركة في صنع القرار",
        "استطلاعات الرأي والمبادرات"
      ] 
    },
    { 
      title: "منصة البيانات", 
      descriptions: [
        "البيانات المفتوحة والاحصاءات",
        "تقارير ومؤشرات أداء"
      ] 
    }
  ],
"تواصل معنا": [
  { 
    "title": "اتصل بنا", 
    "descriptions": [] 
  },
  { 
    "title": "بلاغ عن فساد", 
    "descriptions": [] 
  },
  { 
    "title": "الأسئلة الشائعة", 
    "descriptions": [] 
  },
  { 
    "title": "الدعم الفني بلغة الإشارة", 
    "descriptions": [] 
  },
  { 
    "title": "دليل الأمانات", 
    "descriptions": [] 
  },
  { 
    "title": "وسائل التواصل الإجتماعي", 
    "descriptions": [] 
  },
  { 
    "title": "حجز موعد إلكتروني", 
    "descriptions": [] 
  }
]
};

export default function VerifyLeavePage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState<HealthCertificateData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const certificateNumber = urlParams.get('certificateNumber');
    
    if (certificateNumber) {
      fetchCertificateByNumber(certificateNumber);
    } else {
      setError("لم يتم تقديم رقم شهادة صالح");
      setLoading(false);
    }
  }, []);

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setOpenSubMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCertificateByNumber = async (certificateNumber: string) => {
    setLoading(true);
    setError("");

    try {
      // محاكاة وقت التحميل لمشاهدة تأثير التحميل
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

  const toggleSubMenu = (menuName: string) => {
    if (openSubMenu === menuName) {
      setOpenSubMenu(null);
    } else {
      setOpenSubMenu(menuName);
    }
  };

  
  return (
    <div className="min-h-screen bg-[#f5ebe0] flex flex-col">
      
      {/* شريط التنقل الثابت */}
           <div className="fixed top-0 left-0 right-0 z-50">
           <div className="bg-[#07706d] border-b border-gray-200 flex justify-between items-center p-6">
           <button
            className="p-2 rounded-md text-white hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
           >
            <Menu className="w-6 h-6" />
           </button>
           <div className="flex items-center space-x-2 ml-6">
           <img src="/logoll.png" alt="logo" style={{ width: "110px", height: "50px" }} />
           </div>
            </div>

           {/* الشريط الأبيض تحت شريط التنقل */}
        <div className="h-4 bg-white w-full"></div>

        {/* القائمة المنسدلة */}
        {isMenuOpen && (
          <div 
            ref={menuRef}
            className="bg-[#07706d] shadow-lg rounded-b-md p-4 flex flex-col space-y-3 text-white w-full"
          >
            {Object.entries(menuItemsData).map(([menuName, subItems]) => (
              <div key={menuName} className="relative">
                <button
                  onClick={() => toggleSubMenu(menuName)}
                  className="hover:bg-[#055e5b] flex items-center justify-end space-x-2 py-3 px-4 rounded-md w-full"
                >
                  {openSubMenu === menuName ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>{menuName}</span>
                </button>

                {/* القائمة الفرعية */}
                {openSubMenu === menuName && (
                  <div className="bg-white rounded-md shadow-md overflow-hidden mt-2">
                    {subItems.map((item) => (
                      <div
                        key={item.title}
                        className="block px-4 py-1 hover:bg-gray-50 transition-colors"
                      >
                        {/* العنوان الرئيسي */}
                        <div className="font-bold text-gray-800 text-right mb-4"
                          style={{ fontFamily: 'Tajawal', fontWeight: 700 }}>
                          {item.title}
                        </div>

                        {/* النصوص الفرعية */}
                        <div 
                          className="text-sm text-gray-800 text-right space-y-1"
                          style={{ fontFamily: 'Tajawal', fontWeight: 400 }}
                        >
                          {item.descriptions.map((desc, index) => (
                            <div key={index}>{desc}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مساحة لتعويض ارتفاع الشريط الثابت */}
      <div className="h-28"></div>
     
      {/* حالة التحميل المعدلة */}
      {loading && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
          <div className="relative">
            {/* وميض خلف الشعار (دائرة أصغر) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-8 h-8 rounded-full bg-gray-400 opacity-30 animate-ping"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>

            {/* صورة الشعار */}
            <div className="relative flex items-center justify-center">
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className="w-35 h-35 object-contain relative z-10"
              />
            </div>
          </div>
        </div>
      )}

      
      {error && (
        <div className="text-red-600 font-semibold text-center p-2">
          {error}
        </div>
      )}

      {/* عرض النتيجة */}
      {certificateData && !loading && (
         <div className="flex justify-center px-0 md:px-4 pb-10 mt-4">
          {/* مربع النتائج - على الهواتف يكون ممتدًا بالكامل، وعلى الأجهزة الكبيرة يكون بعرض محدد */}
  <div className="w-full md:max-w-4xl rounded-lg overflow-hidden bg-white shadow-lg">
            {/* محتوى البطاقة */}
           
            {/* صورة الشخص مع العنوان فوقها مباشرة */}
            <div className="flex flex-col items-center mb-3 pt-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-4 md:px-6">
              {/* الأمانة */}
              <div className="relative">
                <div className="absolute right-3 -top-2 w-11 h-3 bg-white flex items-center justify-center">
                  <span 
                    className="relative text-black text-base top-1 font-bold" 
                    style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
                  >
                    الامانة
                  </span>
                </div>
                <div 
                  className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
                  style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
                >
                  {certificateData.baladia}
                </div>
              </div>
              
              {/* البلدية */}
              <div className="relative">
                <div className="absolute right-3 -top-2 w-11 h-3 bg-white flex items-center justify-center">
                  <span 
                    className="relative text-black text-base top-1 font-bold" 
                    style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
                  >
                    البلدية
                  </span>
                </div>
                <div 
                  className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
                  style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
                >
                  {certificateData.baladia}
                </div>
              </div>
            </div>

            {/* البيانات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-4 md:px-6">
           <div className="relative">
  <div className="absolute right-3 -top-2 w-11 h-3 bg-white flex items-center justify-center">
    <span
      className="relative text-black text-base top-1 font-bold"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      الاسم 
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.name || "-"}
  </div>
</div>

              {/* رقم الهوية/الإقامة */}
        {/* رقم الهوية */}
{/* رقم الهوية */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      رقم الهوية
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.idNumber || "-"}
  </div>
</div>


{/* الجنس */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      الجنس
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.gender || "-"}
  </div>
</div>

{/* الجنسية */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      الجنسية
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.nationality || "-"}
  </div>
</div>

{/* رقم الشهادة الصحية */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      رقم الشهادة الصحية
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.healthCertificateNumber || "-"}
  </div>
</div>

{/* المهنة */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      المهنة
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.jobTitle || "-"}
  </div>
</div>

{/* نوع البرنامج التثقيفي */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      نوع البرنامج التثقيفي
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.programType || "-"}
  </div>
</div>

{/* رقم الرخصة */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      رقم الرخصة
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.licenseNumber || "-"}
  </div>
</div>

{/* اسم المنشأة */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      اسم المنشأة
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.establishmentName || "-"}
  </div>
</div>

{/* رقم المنشأة */}
<div className="relative">
  <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
    <span
      className="relative text-black text-base top-1 font-bold whitespace-nowrap"
      style={{ fontFamily: "Tajawal", fontWeight: 700 }}
    >
      رقم المنشأة
    </span>
  </div>
  <div
    className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light"
    style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
  >
    {certificateData.establishmentNumber || "-"}
  </div>
</div>
</div>
            
            {/* التواريخ - 6 مربعات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-4 md:px-6">
  {/* تاريخ إصدار الشهادة ميلادي */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ إصدار الشهادة الميلادي
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {certificateData.certificateIssueDate 
        ? certificateData.certificateIssueDate.replace(/-/g, "/") 
        : "-"}
    </div>
  </div>

  {/* تاريخ إصدار الشهادة هجري */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ إصدار الشهادة هجري
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {convertToHijri(certificateData.certificateIssueDate) || "-"}
    </div>
  </div>

  {/* تاريخ انتهاء الشهادة ميلادي */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ انتهاء الشهادة الميلادي
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {certificateData.healthCertificateIssueDate 
        ? certificateData.healthCertificateIssueDate.replace(/-/g, "/") 
        : "-"}
    </div>
  </div>

  {/* تاريخ انتهاء الشهادة هجري */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ انتهاء الشهادة هجري
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {convertToHijri(certificateData.healthCertificateIssueDate) || "-"}
    </div>
  </div>

  {/* تاريخ انتهاء البرنامج ميلادي */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ انتهاء البرنامج الميلادي
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {certificateData.programEndDate 
        ? certificateData.programEndDate.replace(/-/g, "/") 
        : "-"}
    </div>
  </div>

  {/* تاريخ انتهاء البرنامج هجري */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ انتهاء البرنامج هجري
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {convertToHijri(certificateData.programEndDate) || "-"}
    </div>
  </div>
</div>

          </div>
        </div>
      )}

      {/* الفوتر */}
      <footer className="bg-white text-black mt-12 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 space-y-4 md:space-y-0">
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
        </div>
      </footer>
    </div>
  );
}