"use client";
import '../../styles/fonts.css';
import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Menu } from "lucide-react";

interface LeaveData {
  name?: string;
  reportDate?: string;
  entryDateGregorian?: string;
  leaveEndGregorian?: string;
  leaveDurationDays?: string | number;
  doctorName?: string;
  jobTitle?: string;
}
export default function VerifyLeavePage() {
  const [leaveCode, setLeaveCode] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const [userData, setUserData] = useState<LeaveData | null>(null);
 const [open, setOpen] = useState(false);
  const handleSearch = async () => {
    setError("");
    setUserData(null);

    if (!leaveCode || !idNumber) {
      setError("يرجى إدخال رمز الإجازة ورقم الهوية.");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("leaveCode", "==", leaveCode),
        where("idNumber", "==", idNumber)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setUserData(data);
      } else {
        setError("لم يتم العثور على بيانات مطابقة.");
      }
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
      
      <div className="bg-[#f8f9fb] border-b border-gray-200 flex justify-between items-center p-6 relative">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="logo" style={{ width: "135px", height: "60px" }} />
        </div>

        {/* زر الهامبرغر دائماً ظاهر */}
        <button
          className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* القائمة المنسدلة تظهر فقط عند الضغط على الأيقونة */}
        {open && (
          <div className="absolute top-full right-6 mt-2 bg-white shadow-md rounded-md p-4 flex flex-col space-y-2 text-gray-700 w-48 z-50">
            <a href="#" className="hover:text-blue-600">الخدمات</a>
            <a href="#" className="hover:text-blue-600">الاستعلامات</a>
            <a href="#" className="hover:text-blue-600">إنشاء حساب</a>
            <button className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 w-full text-center">تسجيل الدخول</button>
          </div>
        )}
      </div>
     

      {/* العنوان */}
      <div className="bg-white text-center py-8">
        <h1 style={{
            backgroundPosition: "50%",
            backgroundRepeat: "no-repeat",
            color: "#306db5",
            display: "inline-block",
            fontFamily: "Cairo, sans-serif",
            fontSize: "40px",
            fontWeight: 700,
            marginTop: "20px",
            position: "relative",
          }}
        >
          الإجازات المرضية
        </h1>
        <p className="text-[14px]" style={{ color: "#798ca1", fontFamily: "Cairo, sans-serif", fontWeight: 400 }}>
          خدمة الاستعلام عن الإجازات المرضية تتيح لك الاستعلام عن حالة طلبك للإجازة ويمكنك طباعتها عن طريق تطبيق صحتي
        </p>
      </div>

      {/* نموذج البحث */}
      <div className="flex justify-center">
        <div className="bg-white rounded-md p-8 shadow-md w-full max-w-md space-y-4">
          <input
            type="text"
            value={leaveCode}
            onChange={(e) => setLeaveCode(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md text-right"
            placeholder="رمز الخدمة"
          />
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md text-right"
            placeholder="رقم الهوية / الإقامة"
          />
          {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
          >
            {loading ? "جاري البحث..." : "استعلام"}
          </button>
        </div>
      </div>

      {/* عرض النتيجة */}
      {userData && (
        <div className="flex justify-center mt-8">
          <div className="bg-gray-50 rounded-md p-8 shadow-md w-full max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div className="space-y-8">

            <div className="flex flex-col items-center space-y-1">
    <div className="font-semibold text-[#1a3760]">الاسم:</div>
    <div className="text-gray-700">{userData.name || "-"}</div>
  </div>
                <div>
                  <div className="font-semibold text-[#1a3760]">تاريخ إصدار تقرير الإجازة:</div>
                  <div className="text-gray-700">{userData.reportDate || "-"}</div>
                </div>
                <div>
                  <div className="font-semibold text-[#1a3760]">تبدأ من:</div>
                  <div className="text-gray-700">{userData.entryDateGregorian || "-"}</div>
                </div>
                <div>
                  <div className="font-semibold text-[#1a3760]">وحتى:</div>
                  <div className="text-gray-700">{userData.leaveEndGregorian || "-"}</div>
                </div>
                <div>
                  <div className="font-semibold text-[#1a3760]">المدة بالأيام:</div>
                  <div className="text-gray-700">{userData.leaveDurationDays || "-"}</div>
                </div>
                <div>
                  <div className="font-semibold text-[#1a3760]">اسم الطبيب:</div>
                  <div className="text-gray-700">{userData.doctorName || "-"}</div>
                </div>
                <div>
                  <div className="font-semibold text-[#1a3760]">المسمى الوظيفي:</div>
                  <div className="text-gray-700">{userData.jobTitle || "-"}</div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                استعلام جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* الفوتر الجديد */}
      <footer className="bg-[#306db5] text-white mt-12 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 space-y-4 md:space-y-0">

          {/* القسم الأيسر */}
         <div className="flex flex-col items-center space-y-2 rtl:space-y-reverse">
  <img src="/m9.png" alt="moh-approved" className="w-25 h-15" />
  <div className="text-xs text-center">
    منصة صحة معتمدة من قبل وزارة الصحة © 2024
  </div>
</div>

          {/* القسم الأيمن */}
          <div className="flex flex-wrap justify-center md:justify-end space-x-4 rtl:space-x-reverse text-sm text-white text-center">
            <a href="#" className="hover:underline">تواصل معنا</a>
            <a href="#" className="hover:underline">الأسئلة الشائعة</a>
            <a href="#" className="hover:underline">الرئيسية</a>
            <a href="#" className="hover:underline">دليل الاستخدام</a>
            <a href="#" className="hover:underline">الشروط والأحكام</a>
            <span className="block md:ml-4">support@seha.sa</span>
            <span className="block md:ml-4">920002005</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
