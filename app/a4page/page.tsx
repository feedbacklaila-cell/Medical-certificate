"use client";
import '../fonts.css';
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Image from 'next/image';

// واجهة بيانات الإجازة
interface LeaveData {
  name?: string;
  reportDate?: string;
  entryDateGregorian?: string;
  leaveEndGregorian?: string;
  leaveDurationDays?: string | number;
  doctorName?: string;
  jobTitle?: string;
}

// بيانات وهمية للعرض (يجب استبدالها باتصالات Firebase الحقيقية)
const mockLeaveData = {
  name: "محمد أحمد عبد الله",
  reportDate: "1445/09/15",
  entryDateGregorian: "2024/04/10",
  leaveEndGregorian: "2024/04/20",
  leaveDurationDays: "10 أيام",
  doctorName: "د. خالد بن سعيد",
  jobTitle: "مهندس برمجيات"
};

export default function VerifyLeavePage() {
  const [leaveCode, setLeaveCode] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<LeaveData | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    setError("");
    setUserData(null);

    if (!leaveCode || !idNumber) {
      setError("يرجى إدخال رمز الإجازة ورقم الهوية.");
      return;
    }

    setLoading(true);

    try {
      // محاكاة اتصال Firebase (استبدل هذا بالاتصال الحقيقي)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // في البيئة الحقيقية، استخدم:
      // const q = query(
      //   collection(db, "users"),
      //   where("leaveCode", "==", leaveCode),
      //   where("idNumber", "==", idNumber)
      // );
      // const querySnapshot = await getDocs(q);
      // if (!querySnapshot.empty) {
      //   const data = querySnapshot.docs[0].data();
      //   setUserData(data);
      // } else {
      //   setError("لم يتم العثور على بيانات مطابقة.");
      // }
      
      // استخدام بيانات وهمية للعرض
      setUserData(mockLeaveData);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء البحث.");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setLeaveCode("");
    setIdNumber("");
    setUserData(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* شريط التنقل */}
      <div className="bg-[#f8f9fb] border-b border-gray-200 flex justify-between items-center p-4 md:p-6 relative">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-14 md:w-40 md:h-16 flex items-center justify-center">
            <span className="text-gray-500 text-xs">شعار المنصة</span>
          </div>
        </div>

        {/* زر القائمة */}
        <button
          className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* القائمة المنسدلة */}
        {open && (
          <div 
            ref={menuRef}
            className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-md p-4 flex flex-col space-y-3 text-gray-700 w-48 z-50 border border-gray-100"
          >
            <a href="#" className="hover:text-blue-600 py-1">الخدمات</a>
            <a href="#" className="hover:text-blue-600 py-1">الاستعلامات</a>
            <a href="#" className="hover:text-blue-600 py-1">إنشاء حساب</a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full text-center mt-2">
              تسجيل الدخول
            </button>
          </div>
        )}
      </div>

      {/* العنوان الرئيسي */}
      <div className="bg-white text-center py-6 md:py-8 px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-[#306db5] mt-4 relative inline-block font-cairo">
          الإجازات المرضية
        </h1>
        <p className="text-sm md:text-base text-[#798ca1] mt-2 max-w-2xl mx-auto font-cairo">
          خدمة الاستعلام عن الإجازات المرضية تتيح لك الاستعلام عن حالة طلبك للإجازة ويمكنك طباعتها عن طريق تطبيق صحتي
        </p>
      </div>

      {/* نموذج البحث */}
      <div className="flex justify-center px-4 py-6">
        <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-md space-y-4 border border-gray-100">
          <div className="space-y-3">
            <input
              type="text"
              value={leaveCode}
              onChange={(e) => setLeaveCode(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="رمز الخدمة"
            />
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="رقم الهوية / الإقامة"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 font-medium p-3 rounded-md text-center">
              {error}
            </div>
          )}
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري البحث...
              </span>
            ) : "استعلام"}
          </button>
        </div>
      </div>

      {/* عرض النتيجة */}
      {userData && (
        <div className="flex justify-center px-4 py-6">
          <div className="bg-gray-50 rounded-lg p-6 shadow-md w-full max-w-4xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <div className="font-semibold text-[#1a3760] mb-1">الاسم:</div>
                  <div className="text-gray-800 text-lg">{userData.name || "-"}</div>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="font-semibold text-[#1a3760] mb-1">تاريخ إصدار تقرير الإجازة:</div>
                  <div className="text-gray-800">{userData.reportDate || "-"}</div>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="font-semibold text-[#1a3760] mb-1">تبدأ من:</div>
                  <div className="text-gray-800">{userData.entryDateGregorian || "-"}</div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <div className="font-semibold text-[#1a3760] mb-1">وحتى:</div>
                  <div className="text-gray-800">{userData.leaveEndGregorian || "-"}</div>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="font-semibold text-[#1a3760] mb-1">المدة بالأيام:</div>
                  <div className="text-gray-800">{userData.leaveDurationDays || "-"}</div>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="font-semibold text-[#1a3760] mb-1">اسم الطبيب:</div>
                  <div className="text-gray-800">{userData.doctorName || "-"}</div>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <div className="font-semibold text-[#1a3760] mb-1">المسمى الوظيفي:</div>
                  <div className="text-gray-800">{userData.jobTitle || "-"}</div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                استعلام جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* الفوتر */}
      <footer className="bg-[#306db5] text-white mt-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* القسم الأيسر */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-3">
                <span className="text-gray-500 text-xs">شعار وزارة الصحة</span>
              </div>
              <div className="text-xs text-center text-blue-100">
                منصة صحة معتمدة من قبل وزارة الصحة © 2024
              </div>
            </div>

            {/* القسم الأيمن */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-100 text-center">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                <a href="#" className="hover:text-white hover:underline transition">تواصل معنا</a>
                <a href="#" className="hover:text-white hover:underline transition">الأسئلة الشائعة</a>
                <a href="#" className="hover:text-white hover:underline transition">الرئيسية</a>
                <a href="#" className="hover:text-white hover:underline transition">دليل الاستخدام</a>
                <a href="#" className="hover:text-white hover:underline transition">الشروط والأحكام</a>
              </div>
              <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>920002005</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>support@seha.sa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}