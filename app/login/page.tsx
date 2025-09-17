"use client";
import { toHijri } from 'hijri-converter';
import '../../styles/fonts.css';
import { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
/* eslint-disable @typescript-eslint/no-unused-vars */
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

function convertToHijri(gregorianDateStr: string): string {
  if (!gregorianDateStr) return '';
  
  try {
    const date = new Date(gregorianDateStr);
    if (isNaN(date.getTime())) return '';

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

const menuStyles = `
  @keyframes pulse-scale {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  .animate-pulse-scale {
    animation: pulse-scale 1s infinite ease-in-out;
  }

  .bg-custom-teal {
    transition: max-height 0.3s ease;
  }
  .bg-custom-teal.expanded {
    max-height: 600px;
  }
`;

const menuItemsData = { 
  "عن بلدي": [
    { 
      title: " من نحن", 
      descriptions: [
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
      "أسواق المتاجر المتنقلة",
      "الاستعلام عن الإيقافات",
      "الاستعلام عن المخالفات",
      " الدليل التنظيمي للوحات التجارية"
    ] 
  },
  { 
    "title": "الأراضي والبناء", 
    "descriptions": [
      "استعلام عن رخصة بناء",
      "المستكشف الجغرافي",
      "مستكشف التغطية لخدمات البنية التحتية",
      "الاستعلام عن تقرير مساحي"
    ] 
  },
  { 
  

    "title": "الاستعلامات التجارية", 
    "descriptions": [
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
      "الاستعلام عن المقابر"
    ] 
  }
],

  "المنصات": [
    { 
      title: "بوابة الفرص الاستثمارية", 
      descriptions: [

      ] 
    },
    { 
      title: "المنصات التفاعلية", 
      descriptions: [
      ] 
    },
    { 
      title: "منصة تحدي الاستثمار الاجتماعي للقطاع البلدي والإسكان", 
      descriptions: [
      ] 
    }
  ],
"تواصل معنا": [
  { 
    "title": "اتصل بنا", 
    descriptions: [
      ]
  },
  { 
    "title": "بلاغ عن فساد", 
     descriptions: [
      ]
  },
  { 
    "title": "الأسئلة الشائعة", 
        descriptions: []

  },
  { 
    "title": "الدعم الفني بلغة الإشارة", 
       descriptions: []

  },
  { 
    "title": "دليل الأمانات", 
        descriptions: []

  },
  { 
    "title": "وسائل التواصل الإجتماعي", 
       descriptions: []

  },
  { 
    "title": "حجز موعد إلكتروني", 
    descriptions: []
  }
]
};

export default function VerifyLeavePage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState<HealthCertificateData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);
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

    // الكشف عن حجم الشاشة
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setOpenSubMenu(null);
        setActiveMenu(null);
        setActiveMobileMenu(null);
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
// 1️⃣ فتح/إغلاق القائمة الفرعية
const toggleSubMenu = (menuName: string) => {
  if (openSubMenu === menuName) {
    setOpenSubMenu(null);
    setActiveMobileMenu(null);
  } else {
    setOpenSubMenu(menuName);
    setActiveMobileMenu(menuName);
  }
};

// 2️⃣ فتح/إغلاق القائمة الرئيسية على الهاتف
const toggleMobileMenu = () => {
  setIsMenuOpen(prev => {
    const newState = !prev; // قلب حالة القائمة

    if (!newState) {
      // إذا أصبحت مغلقة → أغلق كل شيء
      setOpenSubMenu(null);      // أغلق أي قائمة فرعية
      setActiveMobileMenu(null); // ألغِ القائمة الفرعية النشطة
      setActiveMenu(null);       // أغلق القائمة الرئيسية نفسها
    }

    return newState;
  });
};

// 3️⃣ عند الضغط على عنصر القائمة
const handleMenuClick = (menuName: string) => {
  if (isMenuOpen) {
    // إذا كانت القائمة مفتوحة على الهاتف → تحكم بالقائمة الفرعية
    toggleSubMenu(menuName);
  } else {
    // نسخة الكمبيوتر → التحكم بالقائمة الرئيسية
    setActiveMenu(activeMenu === menuName ? null : menuName);
  }
};



  
return (
  
  
  <div className="min-h-screen bg-[#eceff3] flex flex-col">
    
    {/* شريط التنقل المعدل */}
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-[#07706d] flex justify-between items-center p-4 md:p-2 relative">
        
        {/* زر القائمة للهواتف فقط */}
        {isMobile && (
          <button
            className="p-2 rounded-md text-white hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* عناصر القائمة لأجهزة الكمبيوتر */}
        {!isMobile && (
          <div className="flex-1 flex justify-end space-x-9 rtl:space-x-reverse mr-6">
            {Object.keys(menuItemsData).reverse().map((menuName) => (
              <div key={menuName} className="relative flex flex-col items-center">
                <button
                  onClick={() => handleMenuClick(menuName)}
                  className="text-white hover:text-blue-200 flex flex-col items-center transition-colors"
                  style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
                >
                  <span>{menuName}</span>
                  {activeMenu === menuName ? (
                    <ChevronUp className="w-4 h-4 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mt-1" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* الشعار */}
        <div className="flex items-center">
          <img src="/logoll.png" alt="logo" style={{ width: "110px", height: "50px" }} />
        </div>
    <style>{menuStyles}</style>

        {/* القائمة المنسدلة للهواتف */}
 {isMobile && isMenuOpen && (
  <div
    ref={menuRef}
    className="absolute top-full left-0 right-0 bg-[#07706d] shadow-lg rounded-b-md p-4 text-white bg-custom-teal"
    style={{
      transition: "max-height 0.3s ease",
      overflow: "visible",
    }}
  >
    {/* عن بلدي في الأعلى */}
    <div className="mb-4 relative">
      {Object.entries(menuItemsData)
        .filter(([menuName]) => menuName === "عن بلدي")
        .map(([menuName, subItems]) => (
          <div key={menuName} className="relative">
            {/* زر عن بلدي */}
            <button
              onClick={() => toggleSubMenu(menuName)}
              className={`hover:bg-[#055e5b] flex items-center   px-10 mt-4 ml-35   rounded-md w-full ${
                activeMobileMenu === menuName ? "text-[#68a12d]" : "text-white"
              }`}
            >
              <span
                className="flex items-center"
                style={{ fontFamily: "Tajawal", fontWeight: 700 }}
              >
                {openSubMenu === menuName ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
                <span className="text-right">{menuName}</span>
              </span>
            </button>

         {isMobile && isMenuOpen && (
  <div
  ref={menuRef}
  className={`absolute top-full -left-4 shadow-lg rounded-b-md pl-17 mt-2 text-white transition-colors duration-300 ${
    openSubMenu === menuName ? "bg-[#07706d]" : "opacity-0 pointer-events-none"
  }`}
  style={{
    transition: "max-height 0.3s ease",
    overflow: "visible",
  }}
>
    {/* عن بلدي في الأعلى على اليسار */}
    <div className=" mb-17 relative flex justify-between">
      {/* عن بلدي على اليسار */}
      <div className="flex-1 ml-5 ">
        {Object.entries(menuItemsData)
          .filter(([menuName]) => menuName === "عن بلدي")
          .map(([menuName, subItems]) => (
            <div key={menuName} className="relative ">


              {openSubMenu === menuName && (
                <div className="relative">
                  {/* القائمة الفرعية نفسها */}
                  <div
                    className="absolute left-0 bg-white rounded-none shadow-md pt-2 pb-4 mt-1 overflow-auto w-[80%]"
                    style={{
                      minWidth: "50px",
                      maxWidth: "185px",
                      maxHeight: "605px",
                      transition: "max-height 0.3s ease",
                      zIndex: 20,
                    }}
                  >
                   {subItems.map((item) => (
  <div
    key={item.title}
    className="block px-2 hover:bg-gray-50 transition-colors"
  >
    {/* العنوان */}
    <div
      className="font-bold text-gray-800 text-right flex items-center justify-end mb-1"
      style={{
        fontFamily: "Tajawal",
        fontWeight: 700,
      }}
    >
      {item.title}
    </div>

    {/* الوصف */}
    <div
      className="text-sm text-[#666b71] text-right space-y-3"
      style={{ fontFamily: "Tajawal", fontWeight: 400 }}
    >
      {item.descriptions.map((desc, i) => (
        <div
          key={i}
          className={`py-1 flex items-center justify-end ${i === 0 ? "mt-5" : ""}`}
        >
          <span className="ml-2">{desc}</span>
          <img
            src="sher2.png"
            alt="أيقونة"
            className="w-3.1 h-2.5 m-2 flex-shrink-0 relative"
            style={{ top: "3px" }}
          />
        </div>
      ))}
    </div>
  </div>
))}

                  </div>

                  {/* هذا الجزء الشفاف يخلي القائمة الرئيسية تطول بنفس ارتفاع القائمة الفرعية */}
<div
  className=" w-screen" // w-screen يجعل العرض كامل شاشة الجهاز
  style={{ height: "555px", zIndex: 10 }}
/>                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  </div>
)}
          </div>

        ))}
        
    </div>

   {/* إضافة CSS للأنيميشن */}
<style>
  {`
    @keyframes pulse-scale {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); } /* خففت التكبير شوية */
    }
    .animate-pulse-scale {
      animation: pulse-scale 1s infinite ease-in-out; /* أسرع شوية */
    }
  `}
</style>

   {/* باقي عناصر القائمة */}
    <div className="flex flex-col">
      {Object.entries(menuItemsData)
        .filter(([menuName]) => menuName !== "عن بلدي")
        .map(([menuName, subItems]) => (
          <div key={menuName} className="relative">
            <button
              onClick={() => toggleSubMenu(menuName)}
              className={`hover:bg-[#055e5b] flex items-center justify-end py-3 px-2 rounded-md w-full ${
                activeMobileMenu === menuName ? "text-[#68a12d]" : "text-white"
              }`}
            >
              <span
                className="flex items-center"
                style={{ fontFamily: "Tajawal", fontWeight: 700 }}
              >
                {openSubMenu === menuName ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
                <span className="text-right">{menuName}</span>
              </span>
            </button>

            {/* القوائم الفرعية لباقي العناصر */}
            {openSubMenu === menuName && (
              <div
                className="bg-white rounded-none shadow-md pt-2 pb-2 w-[80%] ml-auto mr-2"
                style={{
                  minWidth: "200px",
                  maxWidth: "95%",
                  transition: "max-height 0.3s ease",
                }}
              >
                {subItems.map((item) => (
                  <div
                    key={item.title}
                    className="block px-2 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="font-bold text-gray-800 text-right flex items-center justify-end mb-1"
                      style={{
                        fontFamily: "Tajawal",
                        fontWeight: 700,
                      }}
                    >
                      {/* إضافة الأيقونة للعناصر الرئيسية في المنصات وتواصل معنا */}
                      {(menuName === "المنصات" || menuName === "تواصل معنا") && (
                        <img 
                          src="sher2.png" 
                          alt="أيقونة" 
                          className="w-3.1 h-2.5 ml-2 flex-shrink-0 relative"
                          style={{ top: "3px" }}
                        />
                      )}
                      {item.title}
                    </div>

                    {/* النصوص الفرعية مع إضافة الأيقونة الجديدة */}
                    <div
                      className="text-sm text-[#666b71] text-right space-y-2"
                      style={{ fontFamily: "Tajawal", fontWeight: 400 }}
                    >
                      {item.descriptions.map((desc, i) => {
                        // تحديد لون النص حسب الوصف
                        const textColor =
                          desc === "لوحة التحكم"
                            ? "text-[#b2d48f]"
                            : desc === "بلدي أعمال"
                            ? "text-[#698be1]"
                            : "text-gray-600";

                        const badgeColor =
                          desc === "لوحة التحكم"
                            ? "bg-[#b2d48f] text-white"
                            : desc === "بلدي أعمال"
                            ? "bg-[#698be1] text-white"
                            : "";

                        return (
                          <div
                            key={i}
                            className={`py-1 flex items-center justify-end ${
                              i === 0 ? "mt-5" : ""
                            }`}
                          >
                            {/* كلمة جديد */}
                            {(desc === "لوحة التحكم" || desc === "بلدي أعمال") && (
                              <span
                                className={`ml-2 px-1 py-0.5 text-xs rounded-sm ${badgeColor} animate-pulse-scale`}
                              >
                                جديد
                              </span>
                            )}

                            {/* النص بلون مطابق */}
                            <span className={`ml-2 ${textColor}`}>{desc}</span>

                            {/* المستطيل / صورة PNG مع النزول قليلًا */}
                            <img
                              src="sher2.png"
                              alt="أيقونة"
                              className="w-3.1 h-2.5 m-2 flex-shrink-0 relative"
                              style={{ top: "3px" }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  </div>
)}



        </div>

        {/* القائمة المنسدلة لأجهزة الكمبيوتر */}
   

{!isMobile && activeMenu && (
  <div 
    ref={menuRef}
    className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md pr-12"
    style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, marginTop: 0 }}
  >
    {activeMenu === "المنصات" ? (
      <div className="max-w-8xl ml-auto grid grid-cols-3 gap-4 py-6 px-12" style={{direction: 'rtl'}}>
        {(menuItemsData[activeMenu as keyof typeof menuItemsData] || []).map((item, index) => (
          <div key={item.title} className="text-right" style={{direction: 'ltr'}}>
            <div 
              className="font-bold text-black mb-3 flex items-center justify-end" 
              style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
            >
              {/* إضافة الأيقونة sher2.png للعناصر الرئيسية في المنصات */}
              <img 
                src="sher2.png" 
                alt="أيقونة" 
                className="w-3.1 h-2.5 ml-2 flex-shrink-0 relative"
                style={{ top: "3px" }}
              />
              {item.title}
            </div>
            <div className="text-base text-black space-y-3 pb-8" style={{ fontFamily: 'Tajawal', fontWeight: 400, textAlign: 'right' }}>
              {item.descriptions.map((desc, i) => (
                <div key={i} className="hover:text-[#055e5b] cursor-pointer transition-colors flex items-center justify-end">
                  <span>{desc}</span>
                  <img 
                    src="sher2.png" 
                    alt="أيقونة" 
                    className="w-3.1 h-2.5 m-2 flex-shrink-0 relative"
                    style={{ top: "3px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : activeMenu === "تواصل معنا" ? (
      <div className="max-w-8xl ml-auto py-1 px-2" style={{direction: 'rtl'}}>
        {/* الصف الأول - 3 عناصر */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(menuItemsData[activeMenu as keyof typeof menuItemsData] || []).slice(0, 3).map((item, index) => (
            <div key={item.title} className="text-right" style={{direction: 'ltr'}}>
              <div 
                className="font-bold text-black mb-3 flex items-center justify-end" 
                style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
              >
                {/* إضافة الأيقونة sher2.png للعناصر الرئيسية في تواصل معنا */}
                <img 
                  src="sher2.png" 
                  alt="أيقونة" 
                  className="w-3.1 h-2.5 ml-2 flex-shrink-0 relative"
                  style={{ top: "3px" }}
                />
                {item.title}
              </div>
            </div>
          ))}
        </div>
        
        {/* الصف الثاني - 3 عناصر */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(menuItemsData[activeMenu as keyof typeof menuItemsData] || []).slice(3, 6).map((item, index) => (
            <div key={item.title} className="text-right" style={{direction: 'ltr'}}>
              <div 
                className="font-bold text-black mb-3 flex items-center justify-end" 
                style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
              >
                {/* إضافة الأيقونة sher2.png للعناصر الرئيسية في تواصل معنا */}
                <img 
                  src="sher2.png" 
                  alt="أيقونة" 
                  className="w-3.1 h-2.5 ml-2 flex-shrink-0 relative"
                  style={{ top: "3px" }}
                />
                {item.title}
              </div>
            </div>
          ))}
        </div>
        
        {/* الصف الثالث - عنصر واحد فقط في أقصى اليمين */}
        <div className="flex justify-start">
          <div className="text-right w-1/3" style={{direction: 'rtl'}}>
            {(menuItemsData[activeMenu as keyof typeof menuItemsData] || []).slice(6).map((item, index) => (
              <div key={item.title}>
                <div 
                  className="font-bold text-black mb-3 flex items-center justify-end" 
                  style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
                >
                  {/* إضافة الأيقونة sher2.png للعناصر الرئيسية في تواصل معنا */}
                  <img 
                    src="sher2.png" 
                    alt="أيقونة" 
                    className="w-3.1 h-2.5 ml-2 flex-shrink-0 relative"
                    style={{ top: "3px" }}
                  />
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="max-w-8xl ml-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{direction: 'rtl'}}>
        {(menuItemsData[activeMenu as keyof typeof menuItemsData] || []).map((item, index) => (
          <div key={item.title} className="text-right" style={{direction: 'ltr'}}>
            {/* العناصر الأخرى تبقى كما هي */}
            <div 
              className="font-bold text-black mb-3 flex items-center justify-end" 
              style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
            >
              {item.title === "المشاركة الإلكترونية" && (
                <img 
                  src="sher.png"   
                  alt="icon" 
                  className="mr-1 w-3 h-3 cursor-pointer"
                />
              )}
              {item.title}
            </div>
            <div className="text-base text-black space-y-3 pb-8" style={{ fontFamily: 'Tajawal', fontWeight: 400, textAlign: 'right' }}>
              {item.descriptions.map((desc, i) => (
                <div key={i} className="hover:text-[#055e5b] cursor-pointer transition-colors flex items-center justify-end">
                  <span>{desc}</span>
                  <img 
                    src="sher2.png" 
                    alt="أيقونة" 
                    className="w-3.1 h-2.5 m-2 flex-shrink-0 relative"
                    style={{ top: "3px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}



        {/* الشريط الأبيض تحت شريط التنقل */}
        <div className="h-7 bg-white w-full"></div>
      </div>

      {/* مساحة لتعويض ارتفاع الشريط الثابت */}
      <div className="h-28"></div>
     
      {/* باقي المحتوى (لم يتغير) */}
      {loading && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-8 h-8 rounded-full bg-gray-400 opacity-30 animate-ping"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>
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
    {/* عرض النتيجة */}
{certificateData && !loading && (
  <div className="flex justify-center px-0 md:px-4 pb-10 mt-4">
    {isMobile ? (
      // تصميم الهاتف (كما هو تمامًا)
      <div className="w-full md:max-w-4xl rounded-none overflow-hidden bg-white shadow-lg">
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
              src= "/face.jpg"
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
              {certificateData.amana}
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

          {/* تاريخ إصدار الشهادة هجري */}
          <div className="relative">
            <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
              <span 
                className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
                style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
              >
                تاريخ إصدار الشهادة الصحية هجري
              </span>
            </div>
            <div 
              className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
              style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
            >
              {convertToHijri(certificateData.certificateIssueDate) || "-"}
            </div>
          </div>

          {/* تاريخ إصدار الشهادة ميلادي */}
          <div className="relative">
            <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
              <span 
                className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
                style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
              >
                تاريخ إصدار الشهادة الصحية ميلادي
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

          {/* تاريخ نهاية الشهادة هجري */}
          <div className="relative">
            <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
              <span 
                className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
                style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
              >
                تاريخ نهاية الشهادة الصحية هجري
              </span>
            </div>
            <div 
              className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
              style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
            >
              {convertToHijri(certificateData.healthCertificateIssueDate) || "-"}
            </div>
          </div>

          {/* تاريخ نهاية الشهادة ميلادي */}
          <div className="relative">
            <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
              <span 
                className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
                style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
              >
                تاريخ نهاية الشهادة الصحية ميلادي
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

          {/* تاريخ انتهاء البرنامج هجري */}
          <div className="relative">
            <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
              <span 
                className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
                style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
              >
                تاريخ انتهاء البرنامج التثقيفى
              </span>
            </div>
            <div 
              className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-6 rounded-sm h-15 flex items-center justify-end text-lg font-light" 
              style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
            >
              {convertToHijri(certificateData.programEndDate) || "-"}
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
      </div>
    ) : (
      // تصميم الكمبيوتر (نفس المحتوى لكن مع حواف مستديرة ومساحة أكبر)
      <div className="w-full max-w-6xl rounded-xl overflow-hidden bg-white shadow-lg pb-15" style={{ margin: '0 7rem' }}>
        {/* محتوى البطاقة */}
       
        {/* صورة الشخص مع العنوان فوقها مباشرة */}
        <div className="flex flex-col items-center mb-3 pt-10">
  <h2 className="text-xl font-semibold text-[#306db5] mb-6">
    <span 
      className="relative font-bold  text-[32px] text-[#484e56]" 
      style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
    >
      {certificateData.certificateType}
    </span>
  </h2>
  {certificateData.personImageUrl && (
    <img 
      src="/face.jpg"
      alt="صورة الشخص" 
      className="max-w-[200px] max-h-[200px] "
    />
  )}
</div>


                {/* صف يحتوي على الأمانة والبلدية */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-8" dir="rtl">
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {certificateData.amana}
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {certificateData.baladia}
    </div>
  </div>
</div>

{/* البيانات الأساسية */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-8" dir="rtl">
  {/* الاسم */}
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
    >
      {certificateData.name || "-"}
    </div>
  </div>

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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2"
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2"
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2"
      style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
    >
      {certificateData.jobTitle || "-"}
    </div>
  </div>

  {/* تاريخ إصدار الشهادة هجري */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ إصدار الشهادة الصحية هجري
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {convertToHijri(certificateData.certificateIssueDate) || "-"}
    </div>
  </div>

  {/* تاريخ إصدار الشهادة ميلادي */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ إصدار الشهادة الصحية ميلادي
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {certificateData.certificateIssueDate 
        ? certificateData.certificateIssueDate.replace(/-/g, "/") 
        : "-"}
    </div>
  </div>

  {/* تاريخ نهاية الشهادة هجري */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ نهاية الشهادة الصحية هجري
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {convertToHijri(certificateData.healthCertificateIssueDate) || "-"}
    </div>
  </div>

  {/* تاريخ نهاية الشهادة ميلادي */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ نهاية الشهادة الصحية ميلادي
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {certificateData.healthCertificateIssueDate 
        ? certificateData.healthCertificateIssueDate.replace(/-/g, "/") 
        : "-"}
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2"
      style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
    >
      {certificateData.programType || "-"}
    </div>
  </div>

  {/* تاريخ انتهاء البرنامج هجري */}
  <div className="relative">
    <div className="absolute right-3 -top-2 h-3 bg-white flex items-center justify-center w-auto px-1">
      <span 
        className="relative text-black text-base top-1 font-bold whitespace-nowrap" 
        style={{ fontFamily: 'Tajawal', fontWeight: 700 }}
      >
        تاريخ انتهاء البرنامج التثقيفى
      </span>
    </div>
    <div 
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2" 
      style={{ color: "#939c94", fontFamily: 'Tajawal', fontWeight: 500 }}
    >
      {convertToHijri(certificateData.programEndDate) || "-"}
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2"
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2"
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
      className="bg-[#f2f2f2] border border-[#d7d7d7] p-4 pt-2 rounded-sm h-14 flex items-center justify-start text-sm font-light text-right pr-2"
      style={{ color: "#939c94", fontFamily: "Tajawal", fontWeight: 500 }}
    >
      {certificateData.establishmentNumber || "-"}
    </div>
  </div>
  
</div>


        
      </div>
    )}
  </div>
)}

      {/* الفوتر */}
   <footer className="bg-white text-black mt-12 py-3">
  <div className="flex flex-col md:flex-row justify-between items-center max-w-10xl mx-auto px-4 space-y-4 md:space-y-0">
    
    {/* النصوص - تظهر أولاً على الهواتف */}
    <div 
      className="flex flex-wrap justify-center md:justify-start space-x-4 rtl:space-x-reverse text-sm text-black text-center md:text-right order-2 md:order-1" 
      style={{ fontFamily: "Tajawal", fontWeight: 500 }}
    >
      <a href="#" className="hover:underline">خريطة الموقع</a>
      <a href="#" className="hover:underline">شروط الاستخدام</a>
      <a href="#" className="hover:underline">اتصل بنا</a>
    </div>

    {/* الشعار وحقوق النشر - تظهر في المنتصف على الهواتف */}
    <div className="flex flex-col items-center space-y-2 rtl:space-y-reverse order-1 md:order-2">
      <div className="flex flex-col md:flex-row-reverse items-center">
        {/* الصورة */}
        <img src="/logaup.svg" alt="moh-approved" className="w-25 h-15  md:ml-4" />
        {/* النص - يصبح على اليسار في الشاشات الكبيرة */}
        <div 
          className="text-xs text-center md:text-left md:mr-4" 
          style={{ fontFamily: "Tajawal", fontWeight: 500, color: "black" }}
        >
          © 2025 وزارة البلديات والإسكان
        </div>
      </div>
    </div>

  </div>
</footer>

    </div>
  );
}