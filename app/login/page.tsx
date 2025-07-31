"use client";
import '../../styles/fonts.css';
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Menu } from "lucide-react";

interface LeaveData {
  name?: string;
  reportDate?: string;
  leaveStartGregorian?: string;
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
  
  // حالات جديدة لإدارة المحاولات والانتظار
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // عند تحميل الصفحة، تحقق من وجود حظر سابق
  useEffect(() => {
    const storedBlockTime = localStorage.getItem("blockTime");
    if (storedBlockTime) {
      const blockTime = parseInt(storedBlockTime);
      const currentTime = Math.floor(Date.now() / 1000);
      const elapsed = currentTime - blockTime;
      const remaining = 300 - elapsed; // 5 دقائق بالثواني

      if (remaining > 0) {
        setIsBlocked(true);
        setRemainingTime(remaining);
      } else {
        localStorage.removeItem("blockTime");
      }
    }
  }, []);

  // التحقق من صحة رمز الخدمة: 3 أحرف كبيرة + 11 رقم
  const isValidLeaveCode = (code: string) => {
    return /^[A-Z]{3}\d{11}$/.test(code);
  };

  // التحقق من صحة رقم الهوية: 10 أرقام فقط
  const isValidIdNumber = (id: string) => {
    return /^\d{10}$/.test(id);
  };

  // مؤقت تنازلي للانتظار
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBlocked && remainingTime > 0) {
      timer = setTimeout(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
    } else if (isBlocked && remainingTime === 0) {
      setIsBlocked(false);
      setAttempts(0);
      localStorage.removeItem("blockTime");
    }
    return () => clearTimeout(timer);
  }, [isBlocked, remainingTime]);

  const handleSearch = async () => {
    setError("");
    setUserData(null);

    // إذا كان المستخدم محظورًا
    if (isBlocked) {
      return;
    }

    // التحقق من المدخلات
    if (!leaveCode || !idNumber) {
      setError("يرجى إدخال رمز الإجازة ورقم الهوية.");
      return;
    }

    // التحقق من صحة رمز الخدمة
    if (!isValidLeaveCode(leaveCode)) {
      setError("رمز الخدمة غير صحيح.");
      return;
    }

    // التحقق من صحة رقم الهوية
    if (!isValidIdNumber(idNumber)) {
      setError("رقم الهوية/الإقامة غير صحيح.");
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
        setAttempts(0); // إعادة تعيين المحاولات عند النجاح
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        // إذا تجاوزت المحاولات 3
        if (newAttempts >= 3) {
          // احفظ وقت الحظر في localStorage (بالثواني)
          const currentTime = Math.floor(Date.now() / 1000);
          localStorage.setItem("blockTime", currentTime.toString());
          setIsBlocked(true);
          setRemainingTime(300); // 5 دقائق = 300 ثانية
          setError("لقد تجاوزت عدد المحاولات المسموحة. يرجى الانتظار 5 دقائق.");
        } else {
          setError("لم يتم العثور على بيانات مطابقة.");
        }
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
    setAttempts(0);
  };

  // تنسيق الوقت المتبقي للانتظار
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* شريط التنقل */}
      <div className="bg-[#f8f9fb] border-b border-gray-200 flex justify-between items-center p-6 relative">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="logo" style={{ width: "135px", height: "60px" }} />
        </div>

        {/* زر القائمة */}
        <button
          className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* القائمة المنسدلة */}
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
            onChange={(e) => setLeaveCode(e.target.value.toUpperCase())}
            className="w-full border border-gray-300 p-2 rounded-md text-right"
            placeholder="رمز الخدمة"
            maxLength={14}
            disabled={isBlocked}
          />
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full border border-gray-300 p-2 rounded-md text-right"
            placeholder="رقم الهوية / الإقامة"
            maxLength={10}
            disabled={isBlocked}
          />
          
          {error && !isBlocked && (
            <div className="text-red-600 font-semibold text-center p-2">
              {error}
            </div>
          )}
          
          {isBlocked ? (
            <div className="bg-red-100 text-red-800 p-4 rounded-md text-center">
              <p className="font-semibold">لقد تجاوزت عدد المحاولات المسموحة</p>
              <p className="mt-2 text-lg font-bold">الوقت المتبقي: {formatTime(remainingTime)}</p>
              <p className="mt-2 text-sm">الرجاء الانتظار قبل المحاولة مرة أخرى</p>
            </div>
          ) : (
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`px-4 py-2 rounded-md w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {loading ? "جاري البحث..." : "استعلام"}
            </button>
          )}
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
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-semibold text-[#1a3760]">تاريخ إصدار تقرير الإجازة:</div>
                  <div className="text-gray-700">{userData.reportDate || "-"}</div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-semibold text-[#1a3760]">تبدأ من:</div>
                  <div className="text-gray-700">{userData.leaveStartGregorian || "-"}</div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-semibold text-[#1a3760]">وحتى:</div>
                  <div className="text-gray-700">{userData.leaveEndGregorian || "-"}</div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-semibold text-[#1a3760]">المدة بالأيام:</div>
                  <div className="text-gray-700">{userData.leaveDurationDays || "-"}</div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-semibold text-[#1a3760]">الطبيب:</div>
                  <div className="text-gray-700">{userData.doctorName || "-"}</div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="font-semibold text-[#1a3760]">مسمى وظيفي:</div>
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

      {/* الفوتر */}
      <footer className="bg-[#306db5] text-white mt-12 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 space-y-4 md:space-y-0">
          <div className="flex flex-col items-center space-y-2 rtl:space-y-reverse">
            <img src="/m9.png" alt="moh-approved" className="w-25 h-15" />
            <div className="text-xs text-center">
              منصة صحة معتمدة من قبل وزارة الصحة © 2024
            </div>
          </div>

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