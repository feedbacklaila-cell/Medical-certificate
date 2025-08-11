"use client";

import {  useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { FaUserMd, FaCalendarPlus, FaFileAlt, FaStethoscope, FaUserFriends, FaClipboardCheck, FaHospital } from "react-icons/fa";

export default function HomePage() {
  // حالة القائمة ما راح نستخدمها عشان نعطلها
  // const [open, setOpen] = useState(false);
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const actions = [
    { title: "إضافة طبيب", icon: <FaUserMd className="text-blue-600 text-3xl" />, path: "/adddoctor" },
    { title: "إجازة جديدة", icon: <FaCalendarPlus className="text-blue-600 text-3xl" />, path: "/newLeave" },
    { title: "تقرير", icon: <FaFileAlt className="text-blue-600 text-3xl" />, path: "/a4page" },
    { title: "إضافة مستشفى", icon: <FaHospital className="text-blue-600 text-3xl" />, path: "/addHospitalPage" },
    { title: "تقرير طبي", icon: <FaStethoscope className="text-blue-600 text-3xl" />, path: "/medicalreport" },
    { title: "مرافق مريض", icon: <FaUserFriends className="text-blue-600 text-3xl" />, path: "/companion" },
    { title: "مشهد مراجعة", icon: <FaClipboardCheck className="text-blue-600 text-3xl" />, path: "/reviewnote" },
  ];

  // نعطل تأثير إغلاق القائمة عشان ما يحتاج أصلاً
  /*
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  */

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* Header */}
      <header className="mx-4 mt-4 rounded-xl flex items-center justify-between bg-white px-6 py-4 shadow-md">
        <div className="flex items-center space-x-2">
          <img 
            src="/m11.png" 
            alt="logo" 
            width={70} 
            height={60}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/default-logo.png';
            }}
          />
        </div>
        <button
          className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {}}  // لا يفعل شيء عند الضغط
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* القائمة الجانبية معطلة بالكامل - لا تظهر أبداً */}

      {/* زر إضافة جديد */}
      <div className="flex justify-end h-12 mt-8 px-4">
        <button
          onClick={() => router.push("/newLeave")}
          className="flex items-center bg-white text-blue-600 rounded-full px-4 py-2 font-cairo font-bold text-sm shadow-md transition-all hover:shadow-lg"
        >
          <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2">+</span>
          إضافة جديد
        </button>
      </div>

      {/* مساحات فارغة وتعليقات */}
    </div>
  );
}
