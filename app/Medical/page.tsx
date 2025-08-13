"use client";

import { useRouter } from "next/navigation";
import { Grid } from "lucide-react"; // أيقونة بديلة لـ Menu
import { motion } from "framer-motion"; // مكتبة الأنيميشن

export default function HomePage() {
  const router = useRouter();

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white font-sans"
      initial={{ opacity: 0, y: 20 }} // بداية الحركة
      animate={{ opacity: 1, y: 0 }} // نهاية الحركة
      transition={{ duration: 0.6, ease: "easeOut" }} // مدة وتأثير الحركة
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
        {/* أيقونة Grid داخل دائرة */}
        <div className="p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-default">
          <Grid className="w-6 h-6" />
        </div>
      </header>

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
