"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react"; // زر Menu بدل Grid
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // لإغلاق sidebar عند الضغط خارجها
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

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white font-sans"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <header className="mx-4 mt-4 rounded-xl flex items-center justify-between bg-white px-6 py-4 shadow-md">
        <div className="flex items-center space-x-2">
          <img 
            src="/m11.png" 
            alt="logo" 
            width={70} 
            height={60}
            className="rounded-lg shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/default-logo.png';
            }}
          />
        </div>

        {/* زر Menu */}
        <div
          className="p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <Menu className="w-6 h-6" />
        </div>
      </header>

      {/* Sidebar (نفس القائمة والأيقونات كما في الكود الأول) */}
      {open && (
        <motion.div
          ref={sidebarRef}
          className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 p-6"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <h2 className="text-xl font-bold text-blue-700 mb-6 text-right">القائمة</h2>
          <ul className="space-y-4 text-right">
            <li>
    <button onClick={() => router.push("/AmanatData")} className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100">
      <span className="text-blue-800 font-medium">إدارة الأمانات والبلديات</span>
      <span className="text-blue-600 text-3xl">🏛️</span>
    </button>
  </li><li>
  <button
    onClick={() => router.push("/Name")}
    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100"
  >
    <span className="text-blue-800 font-medium">إضافة مستخدم</span>
    <span className="text-blue-600 text-3xl">🧑‍🤝‍🧑</span>
  </button>
</li>
           <li>
  <button 
    onClick={() => router.push("/EducationalPrograms")} 
    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100"
  >
    <span className="text-blue-800 font-medium">إدارة البرامج التثقيفية</span>
    <span className="text-blue-600 text-3xl">🎓</span>
  </button>
</li>

<li>
  <button 
    onClick={() => router.push("/Establishments")} 
    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100"
  >
    <span className="text-blue-800 font-medium">إدارة المنشآت</span>
    <span className="text-blue-600 text-3xl">🏢</span>
  </button>
</li>

           {/* <li>
  <button 
    onClick={() => router.push("/newLeave")} 
    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100"
  >
    <span className="text-blue-800 font-medium">نموذج الشهادة الصحية</span>
    <span className="text-blue-600 text-3xl">📜</span>
  </button>
</li> */}

            {/* <li>
              <button onClick={() => router.push("/companion")} className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100">
                <span className="text-blue-800 font-medium">مرافق مريض</span>
                <span className="text-blue-600 text-3xl">👥</span>
              </button>
            </li>
            <li>
              <button onClick={() => router.push("/reviewnote")} className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100">
                <span className="text-blue-800 font-medium">مشهد مراجعة</span>
                <span className="text-blue-600 text-3xl">📝</span>
              </button>
            </li> */}
          </ul>
        </motion.div>
      )}

      {/* زر إضافة جديد */}
      <motion.div
        className="flex justify-end h-12 mt-8 px-4"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <button
          onClick={() => router.push("/newLeave")}
          className="flex items-center bg-blue-600 text-white rounded-full px-5 py-2 font-cairo font-bold text-sm shadow-md transition-all hover:shadow-lg hover:bg-blue-700"
        >
          <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 font-bold">+</span>
          إضافة جديد
        </button>
      </motion.div>
    </motion.div>
  );
}
