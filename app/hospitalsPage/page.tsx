// HomePage.jsx
"use client";

import { useRouter } from "next/navigation";
import { FaHospital, FaUserMd, FaCalendarPlus } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 flex flex-col items-center justify-center font-sans">
      <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">لوحة التحكم</h1>

      <div className="grid grid-cols-1 gap-6 w-full max-w-xs">
        {/* إضافة مستشفى */}
        <button
          onClick={() => navigateTo("/hospitalsPage")}
          className="flex items-center justify-between bg-white shadow-md rounded-2xl px-6 py-4 text-right border border-green-300 hover:shadow-lg transition"
        >
          <div>
            <h2 className="text-lg font-semibold text-green-700">إضافة مستشفى</h2>
            <p className="text-sm text-gray-500">سجل مستشفى جديد</p>
          </div>
          <FaHospital className="text-green-500 text-3xl" />
        </button>

        {/* إضافة طبيب */}
        <button
          onClick={() => navigateTo("/doctorsPage")}
          className="flex items-center justify-between bg-white shadow-md rounded-2xl px-6 py-4 text-right border border-green-300 hover:shadow-lg transition"
        >
          <div>
            <h2 className="text-lg font-semibold text-green-700">إضافة طبيب</h2>
            <p className="text-sm text-gray-500">سجل طبيب جديد</p>
          </div>
          <FaUserMd className="text-green-500 text-3xl" />
        </button>

        {/* إجازة جديدة */}
        <button
          onClick={() => navigateTo("/newLeave")}
          className="flex items-center justify-between bg-white shadow-md rounded-2xl px-6 py-4 text-right border border-green-300 hover:shadow-lg transition"
        >
          <div>
            <h2 className="text-lg font-semibold text-green-700">إجازة جديدة</h2>
            <p className="text-sm text-gray-500">إضافة طلب إجازة</p>
          </div>
          <FaCalendarPlus className="text-green-500 text-3xl" />
        </button>
      </div>
    </div>
  );
}
