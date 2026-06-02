"use client";
import Image from "next/image";
import { toHijri } from 'hijri-converter';
import '../../../../../styles/fonts.css';
import { useState, useEffect, useRef } from "react";
import { db } from "../../../../firebaseConfig";
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
  certificateId: string;
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

  @keyframes glow-line {
    0%, 100% {
      box-shadow: 0 0 4px rgba(84, 192, 138, 0.4), 0 0 8px rgba(84, 192, 138, 0.2);
    }
    50% {
      box-shadow: 0 0 8px rgba(84, 192, 138, 0.6), 0 0 16px rgba(84, 192, 138, 0.3);
    }
  }
  .glow-line {
    animation: glow-line 2s infinite ease-in-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes expandDown {
    from {
      max-height: 0;
      opacity: 0;
    }
    to {
      max-height: 500px;
      opacity: 1;
    }
  }
  .animate-expandDown {
    animation: expandDown 0.4s ease-out;
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

// القائمة المصفاة للهاتف - فقط العناصر المطلوبة
const mobileMenuItems = {
  "عن بلدي": menuItemsData["عن بلدي"],
  "الخدمات": menuItemsData["الخدمات"],
  "الاستعلامات": menuItemsData["الاستعلامات"],
  "تواصل معنا": menuItemsData["تواصل معنا"]
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
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVerifyInfo, setShowVerifyInfo] = useState(false);

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
        where("certificateId", "==", certificateNumber)
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

// فتح صفحة البحث المنبثقة
const openSearchPopup = () => {
  setShowSearchPopup(true);
  setIsMenuOpen(false);
};

// إغلاق صفحة البحث المنبثقة
const closeSearchPopup = () => {
  setShowSearchPopup(false);
  setSearchQuery("");
};

// تبديل إظهار معلومات التحقق
const toggleVerifyInfo = () => {
  setShowVerifyInfo(!showVerifyInfo);
};

  
return (
  
  
  <div className="min-h-screen bg-[#eceff3] flex flex-col">
    
    {/* الشريط العلوي - موقع حكومي */}
    {/* الشريط العلوي - موقع حكومي */}
<div className="w-full bg-gray-100" style={{ direction: 'rtl' }}>
  <div className="max-w-7xl mx-auto px-3 py-1">
    
    {/* ========== تصميم الهاتف (عمودي) ========== */}
    <div className="flex md:hidden flex-col space-y-3 mb-2">
      
      {/* السطر الأول - موقع حكومي مع الأيقونة */}
     <div className="flex items-center justify-start gap-2 w-full" dir="rtl">
        <Image
          src="/gov-icon.png"
          alt="gov"
          width={21}
          height={14}
          className="cursor-pointer"
        />
        <span style={{ fontFamily: "Tajawal", fontWeight: 1000, fontSize: "14px", color: "#333" }}>
          موقع حكومي مسجل لدى هيئة الحكومة الرقمية
        </span>
      </div>
      
      {/* السطر الثاني - كيف تتحقق */}
     <div className="flex justify-end w-full">
        <button
          onClick={toggleVerifyInfo}
          className="flex items-center gap-1"
          style={{ fontFamily: "Tajawal", fontWeight: 500, fontSize: "14px" }}
        >
          <span style={{ color: "#1b8354" }}>كيف تتحقق</span>
          <span style={{ marginRight: "4px" }}>
            {showVerifyInfo ? (
              <ChevronUp className="w-3 h-3" style={{ color: "#1b8354" }} />
            ) : (
              <ChevronDown className="w-3 h-3" style={{ color: "#1b8354" }} />
            )}
          </span>
        </button>
      </div>
      
      {/* السطر الثالث - الإعدادات (يمين) + أدوات سهولة الوصول (يسار) */}
      <div className="flex items-center justify-between">
        {/* الإعدادات - جهة اليمين */}
        <button className="flex items-center gap-1" style={{ fontFamily: "Tajawal", fontWeight: 1000, fontSize: "14px", color: "#333" }}>
          <Image
            src="/settings-icon.png"
            alt="settings"
            width={16}
            height={16}
            className="cursor-pointer"
          />
          <span>الإعدادات</span>
        </button>
        
        {/* أدوات سهولة الوصول - جهة اليسار */}
         <button
    className="flex items-center gap-1"
    style={{
      fontFamily: "Tajawal",
      fontWeight:1000,
      fontSize: "14px",
      color: "#333",
    }}
   >
    <Image
      src="/accessibility-icon.png"
      alt="accessibility"
      width={12}
      height={12}
      className="cursor-pointer"
    />
    <span>أدوات سهولة الوصول</span>
   </button>
      </div>
    </div>

    {/* ========== تصميم الكمبيوتر (أفقي - يبقى كما هو) ========== */}
    <div className="hidden md:flex items-center justify-between">
      {/* جهة اليمين - موقع حكومي */}
      <div className="flex items-center gap-2">
        <Image
          src="/gov-icon.png"
          alt="gov"
          width={14}
          height={14}
          className="cursor-pointer"
        />
        <span style={{ fontFamily: "Tajawal", fontWeight: 500, fontSize: "11px", color: "#000000" }}>
          موقع حكومي مسجل لدى هيئة الحكومة الرقمية
        </span>
      </div>
      
      {/* جهة اليسار - كيف تتحقق + الإعدادات + أدوات سهولة الوصول */}
      <div className="flex items-center gap-6">
        {/* كيف تتحقق */}
        <button
          onClick={toggleVerifyInfo}
          className="flex items-center gap-1"
          style={{ fontFamily: "Tajawal", fontWeight: 500, fontSize: "11px" }}
        >
          <span style={{ color: "#1b8354" }}>كيف تتحقق</span>
          <span style={{ marginRight: "4px" }}>
            {showVerifyInfo ? (
              <ChevronUp className="w-3 h-3" style={{ color: "#1b8354" }} />
            ) : (
              <ChevronDown className="w-3 h-3" style={{ color: "#1b8354" }} />
            )}
          </span>
        </button>

        {/* الإعدادات */}
        <button className="flex items-center gap-1" style={{ fontFamily: "Tajawal", fontWeight: 500, fontSize: "11px", color: "#333" }}>
          <Image
            src="/settings-icon.png"
            alt="settings"
            width={12}
            height={12}
            className="cursor-pointer"
          />
          <span>الإعدادات</span>
        </button>

        {/* أدوات سهولة الوصول */}
          <button
    className="flex items-center gap-1"
    style={{
      fontFamily: "Tajawal",
      fontWeight: 500,
      fontSize: "11px",
      color: "#333",
    }}
   >
    <Image
      src="/accessibility-icon.png"
      alt="accessibility"
      width={12}
      height={12}
      className="cursor-pointer"
    />
    <span>أدوات سهولة الوصول</span>
    </button>
      </div>
    </div>

    {/* معلومات كيف تتحقق - تظهر عند الضغط */}
    {showVerifyInfo && (
      <div className="mt-2 animate-expandDown" style={{ overflow: 'hidden' }}>
        <div className="  pt-6 pb-6 pr-3 pl-9">
          {/* روابط المواقع الإلكترونية */}
          <div className="mb-3">
            <div className="flex items-start gap-4">
              <Image
                src="/verify-icon1.png"
                alt="icon"
                width={35}
                height={15}
                className="mt-0.5"
              />
              <div>
                <div style={{ fontFamily: "Tajawal", fontWeight: 700, fontSize: "16px", color: "#222" }}>
                  روابط المواقع الإلكترونية الرسمية السعودية تنتهي <span style={{ color: "#1b8354" }}>.gov.sa</span>
                </div>
                <div style={{ fontFamily: "Tajawal", fontWeight: 500, fontSize: "14px", color: "#666", marginTop: "8px" }}>
                  جميع روابط المواقع الرسمية التابعة للجهات الحكومية في المملكة العربية السعودية تنتهي بـ.gov.sa 
                </div>
              </div>
            </div>
          </div>

          {/* المواقع الإلكترونية الحكومية */}
          <div className="mb-12">
            <div className="flex items-start gap-4">
              <Image
                src="/verify-icon2.png"
                alt="icon"
                width={35}
                height={15}
                className="mt-0.5"
              />
              <div>
                <div style={{ fontFamily: "Tajawal", fontWeight: 700, fontSize: "16px", color: "#222" }}>
                  المواقع الإلكترونية الحكومية تستخدم بروتوكول <span style={{ color: "#1b8354" }}>HTTPS</span> للتشفير والأمان
                </div>
                <div style={{ fontFamily: "Tajawal", fontWeight: 500, fontSize: "15px", color: "#666", marginTop: "8px" }}>
                  المواقع الإلكترونية الآمنة في المملكة العربية السعودية تستخدم بروتوكول HTTPS للتشفير
                </div>
              </div>
            </div>
          </div>

          {/* مستطيل التسجيل */}
          <div className="mt-3 bg-white rounded-md px-6 py-3 flex items-center" style={{ direction: 'rtl' }}>
            <Image
              src="/register-icon.png"
              alt="register"
              width={25}
              height={25}
              className="ml-4"
            />
            <div style={{ fontFamily: "Tajawal", fontWeight: 400, fontSize: "15px", color: "#444" }}>
              مسجل لدى هيئة الحكومة الرقمية برقم:
              <span style={{ color: "#1b8354", fontWeight: 500, marginRight: "4px" }}>442436633530</span>
            </div>
          </div>
        </div>
      </div>
     )}
     </div>
  </div>

    {/* شريط التنقل المعدل */}
    <div className="sticky top-0 left-0 right-0 z-50">
      <div className="bg-[#ffff] flex justify-between items-center p-4 md:p-2 relative">
        {/* الشعار */}
        <div className="flex items-center">
          <img src="/logoll.png" alt="logo" style={{ width: "110px", height: "50px" }} />
        </div>
        {/* زر القائمة للهواتف فقط */}
        {isMobile && (
          <button
            className="p-2 rounded-md  hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
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

        
    <style>{menuStyles}</style>

        {/* القائمة المنسدلة للهواتف */}
 {isMobile && isMenuOpen && (
  <div
    ref={menuRef}
    className="absolute top-full left-0 right-0 bg-[#ffff] shadow-lg rounded-b-md p-4 text-white bg-custom-teal"
    style={{
      transition: "max-height 0.3s ease",
      overflow: "visible",
    }}
  >
    <div className="flex flex-col">
      {Object.entries(mobileMenuItems).map(([menuName]) => {
        const isServices = menuName === "الخدمات";
        return (
          <div key={menuName} className="relative">
            {isServices ? (
              /* تصميم مميز للخدمات */
              <div className="relative">
                <button
                  className={`flex items-center justify-between py-3 px-2 rounded-md w-full text-white`}
                  style={{ backgroundColor: "#1b8354", fontFamily: "Tajawal", fontWeight: 700 }}
                >
                  <span className="flex items-center">
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </span>
                  <span className="text-right">الخدمات</span>
                </button>
                {/* الخط المضيء تحت الخدمات */}
                <div 
                  className="absolute left-0 right-0 mx-auto glow-line"
                  style={{
                    height: "2px",
                    backgroundColor: "#54c08a",
                    bottom: "-4px",
                    width: "90%",
                    borderRadius: "2px",
                    zIndex: 5,
                    boxShadow: "0 0 6px rgba(84, 192, 138, 0.5), 0 0 12px rgba(84, 192, 138, 0.3), 0 0 20px rgba(84, 192, 138, 0.2)"
                  }}
                />
              </div>
            ) : (
              /* العناصر الأخرى بدون قوائم فرعية */
              <button
                className={`hover:bg-[#055e5b] flex items-center justify-between py-3 px-2 rounded-md w-full text-black`}
                style={{ fontFamily: "Tajawal", fontWeight: 700 }}
              >
                <span className="flex items-center">
                  <ChevronDown className="w-4 h-4 ml-1" />
                </span>
                <span className="text-right">{menuName}</span>
              </button>
            )}
          </div>
        );
      })}

      {/* عنصر بلدي أعمال - بنفس تصميم الخدمات بدون سهم وبدون خط */}
      <div className="relative mt-2">
        <button
          className="flex items-center justify-center py-3 px-2 rounded-md w-full text-white"
          style={{ backgroundColor: "#1b8354", fontFamily: "Tajawal", fontWeight: 700 }}
        >
          <span className="flex items-center justify-center w-full text-center">
            <span className="ml-2">بلدي أعمال</span>
            <Image
              src="/baladi-icon.png"
              alt="icon"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </span>
        </button>
      </div>

      {/* عنصر بحث - بنفس تصميم باقي العناصر بدون سهم مع أيقونة يمين الكلمة */}
      <div className="relative mt-2">
        <button
          onClick={openSearchPopup}
          className="hover:bg-[#055e5b] flex items-center justify-between py-3 px-2 rounded-md w-full text-black"
          style={{ fontFamily: "Tajawal", fontWeight: 700 }}
        >
          <span className="flex items-center">
            <span className="text-right">بحث</span>
          </span>
          <Image
            src="/search-icon.png"
            alt="search"
            width={18}
            height={18}
            className="mr-1 cursor-pointer"
          />
        </button>
      </div>
    </div>

    {/* إضافة CSS للأنيميشن */}
    <style>
      {`
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-scale {
          animation: pulse-scale 1s infinite ease-in-out;
        }
      `}
    </style>
  </div>
)}



        </div>

        {/* صفحة البحث المنبثقة */}
        {showSearchPopup && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" style={{ backgroundColor: "transparent" }}>
            <div className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-2xl animate-slideDown" style={{ direction: 'rtl' }}>
              {/* صف البحث */}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  {/* مربع البحث */}
                  <div className="flex-1 relative">
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden" style={{ boxShadow: "0 0 4px rgba(0,0,0,0.1), 0 0 8px rgba(0,0,0,0.05)" }}>
                      <div className="px-3">
                        <Image
                          src="/search-icon.png"
                          alt="search"
                          width={18}
                          height={18}
                          className="cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن ما تريد"
                        className="flex-1 py-3 px-2 text-right outline-none text-gray-700"
                        style={{ fontFamily: "Tajawal", fontWeight: 500 }}
                      />
                    </div>
                  </div>
                  
                  {/* زر البحث الأخضر */}
                  <button
                    className="px-4 py-3 rounded-md text-white transition-colors"
                    style={{ 
                      backgroundColor: "#1b8354",
                      fontFamily: "Tajawal",
                      fontWeight: 700,
                      boxShadow: "0 0 4px rgba(27, 131, 84, 0.3), 0 0 8px rgba(27, 131, 84, 0.2)"
                    }}
                  >
                    بحث
                  </button>
                  
                  {/* زر الإغلاق X */}
                  <button
                    onClick={closeSearchPopup}
                    className="px-3 py-3 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors flex items-center justify-center"
                    style={{ fontFamily: "Tajawal", fontWeight: 700 }}
                  >
                    X
                  </button>
                </div>
              </div>

              {/* البحث المتقدم */}
              <div className="px-4 pb-3">
                <div 
                  className="inline-block border border-gray-300 rounded-md px-4 py-2"
                  style={{ 
                    fontFamily: "Tajawal", 
                    fontWeight: 500,
                    color: "#666",
                    boxShadow: "0 0 3px rgba(0,0,0,0.08), 0 0 6px rgba(0,0,0,0.04)"
                  }}
                >
                  البحث المتقدم
                </div>
              </div>

              {/* اقتراحات شائعة */}
              <div className="px-4 pt-2 pb-4">
                <div 
                  className="mb-3"
                  style={{ 
                    fontFamily: "Tajawal", 
                    fontWeight: 700,
                    color: "#1b8354",
                    fontSize: "15px"
                  }}
                >
                  اقتراحات شائعة
                </div>
                
                {/* الرخص التجارية */}
                <div className="mb-2">
                  <div 
                    className="bg-gray-100 rounded-md px-4 py-3"
                    style={{ 
                      fontFamily: "Tajawal", 
                      fontWeight: 500,
                      color: "#555",
                      boxShadow: "0 0 3px rgba(0,0,0,0.06), 0 0 6px rgba(0,0,0,0.03)"
                    }}
                  >
                    الرخص التجارية
                  </div>
                </div>

                {/* الرخص الإنشائية */}
                <div className="mb-2">
                  <div 
                    className="bg-gray-100 rounded-md px-4 py-3"
                    style={{ 
                      fontFamily: "Tajawal", 
                      fontWeight: 500,
                      color: "#555",
                      boxShadow: "0 0 3px rgba(0,0,0,0.06), 0 0 6px rgba(0,0,0,0.03)"
                    }}
                  >
                    الرخص الإنشائية
                  </div>
                </div>

                {/* حجز المواعيد الإلكترونية */}
                <div>
                  <div 
                    className="bg-gray-100 rounded-md px-4 py-3"
                    style={{ 
                      fontFamily: "Tajawal", 
                      fontWeight: 500,
                      color: "#555",
                      boxShadow: "0 0 3px rgba(0,0,0,0.06), 0 0 6px rgba(0,0,0,0.03)"
                    }}
                  >
                    حجز المواعيد الإلكترونية
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
              className="font-bold text-black mb-3" 
              style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
            >
              {item.title}
            </div>
            <div className="text-base text-black space-y-3 pb-8" style={{ fontFamily: 'Tajawal', fontWeight: 400, textAlign: 'right' }}>
              {item.descriptions.map((desc, i) => (
                <div key={i} className="hover:text-[#055e5b] cursor-pointer transition-colors">{desc}</div>
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
                className="font-bold text-black mb-3" 
                style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
              >
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
                className="font-bold text-black mb-3" 
                style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
              >
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
                  className="font-bold text-black mb-3" 
                  style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
                >
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
            {/* إضافة أيقونة فقط لعنصر "المشاركة الإلكترونية" */}
          <div 
  className="font-bold text-black mb-3 flex items-center justify-end" 
  style={{ fontSize: '15px', fontFamily: 'Tajawal', fontWeight: 700, textAlign: 'right' }}
>
  {item.title === "المشاركة الإلكترونية" && (
    <img 
      src="sher.png"   // حط هنا مسار الصورة الصحيح
      alt="icon" 
      className="mr-1 w-3 h-3 cursor-pointer"  // ml-2 لو تبغى مسافة بسيطة عن الكلمة
      // onClick={() => window.open('https://example.com/participation', '_blank')}
    />
  )}
  {item.title}
</div>

            <div className="text-base text-black space-y-3 pb-8" style={{ fontFamily: 'Tajawal', fontWeight: 400, textAlign: 'right' }}>
              {item.descriptions.map((desc, i) => (
                <div key={i} className="hover:text-[#055e5b] cursor-pointer transition-colors">{desc}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

              
       
      </div>

     
     
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


      {/* الفوتر */}
  

    </div>
  );
}