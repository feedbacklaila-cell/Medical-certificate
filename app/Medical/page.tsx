"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, Pencil, Search, UserPlus, Printer,Building, GraduationCap, Castle } from "lucide-react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

type HealthCertificate = {
  name: string;
  idNumber: string;
  healthCertificateNumber: string;
  certificateType: string;
  qrCodeImageUrl?: string;
  amana?: string;
  baladia?: string;
  gender?: string;
  nationality?: string;
  jobTitle?: string;
  programType?: string;
  licenseNumber?: string;
  establishmentName?: string;
  establishmentNumber?: string;
  certificateIssueDate?: string;
  healthCertificateIssueDate?: string;
  programEndDate?: string;
  amanaImageUrl?: string;
  personImageUrl?: string;
  certificateId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [certificates, setCertificates] = useState<HealthCertificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // جلب البيانات من فايربيس
const fetchCertificates = useCallback(async () => {
  try {
    const snapshot = await getDocs(collection(db, "healthCertificates"));
    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        name: docData.name || "",
        idNumber: docData.idNumber || "",
        healthCertificateNumber: docData.healthCertificateNumber || "",
        certificateType: docData.certificateType || "",
        qrCodeImageUrl: docData.qrCodeImageUrl,
        amana: docData.amana,
        baladia: docData.baladia,
        gender: docData.gender,
        nationality: docData.nationality,
        jobTitle: docData.jobTitle,
        programType: docData.programType,
        licenseNumber: docData.licenseNumber,
        establishmentName: docData.establishmentName,
        establishmentNumber: docData.establishmentNumber,
        certificateIssueDate: docData.certificateIssueDate,
        healthCertificateIssueDate: docData.healthCertificateIssueDate,
        programEndDate: docData.programEndDate,
        amanaImageUrl: docData.amanaImageUrl,
        personImageUrl: docData.personImageUrl,
        certificateId: docData.certificateId,
        createdAt: docData.createdAt,
        updatedAt: docData.updatedAt,
        id: doc.id
      } as HealthCertificate;
    });
    setCertificates(data);
  } catch (error) {
    console.error("خطأ أثناء جلب البيانات:", error);
  }
}, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // حذف شهادة
  // const handleDelete = async (healthCertificateNumber: string) => {
  //   if (confirm("هل تريد حذف هذه الشهادة الطبية؟")) {
  //     try {
  //       const q = query(
  //         collection(db, "healthCertificates"),
  //         where("healthCertificateNumber", "==", healthCertificateNumber)
  //       );
  //       const snapshot = await getDocs(q);

  //       snapshot.forEach(async (document) => {
  //         await deleteDoc(doc(db, "healthCertificates", document.id));
  //       });

  //       await fetchCertificates();
  //       alert("تم حذف الشهادة بنجاح ✅");
  //     } catch (error) {
  //       console.error("فشل الحذف:", error);
  //       alert("حدث خطأ أثناء الحذف ❌");
  //     }
  //   }
  // };

  // فلترة البحث
  const filteredCertificates = certificates.filter((c) => {
    const name = c.name?.toLowerCase() || "";
    const idNumber = c.idNumber?.toLowerCase() || "";
    const certNo = c.healthCertificateNumber?.toLowerCase() || "";
    const certType = c.certificateType?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || idNumber.includes(q) || certNo.includes(q) || certType.includes(q);
  });

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/80 via-white to-blue-100/50 font-sans relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* تأثير زجاجي للخلفية */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-lg -z-10"></div>
      
      {/* Header */}
      <header className="mx-4 mt-4 rounded-2xl flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 shadow-lg border border-white/30">
        <div className="flex items-center space-x-2">
          <img
            src="/m11.png"
            alt="logo"
            width={70}
            height={60}
            className="rounded-xl shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/default-logo.png";
            }}
          />
          <h1 className="text-xl font-bold text-blue-800 font-cairo">نظام الشهادات الصحية</h1>
        </div>
        <div
          className="p-2 rounded-full text-blue-600 bg-blue-100/80 hover:bg-blue-200/60 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
          onClick={() => setOpen(!open)}
        >
          <Menu className="w-6 h-6" />
        </div>
      </header>

      {/* Sidebar */}
      {open && (
  <motion.div
    ref={sidebarRef}
    className="fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 p-6 border-l border-blue-100/30"
    initial={{ x: 300 }}
    animate={{ x: 0 }}
    exit={{ x: 300 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <h2 className="text-xl font-bold text-blue-700 mb-6 text-right font-cairo border-b border-blue-100 pb-3">
      القائمة الرئيسية
    </h2>
    <ul className="space-y-3 text-right">
      <li>
        <button
          onClick={() => router.push("/AmanatData")}
          className="flex flex-row-reverse items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50/80 transition-all duration-300 group"
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg transition-all duration-300">
            <Castle size={20} className="text-blue-600" />
          </div>
          <span className="text-blue-800 font-medium font-cairo">
            إدارة الأمانات والبلديات
          </span>
        </button>
      </li>
      <li>
        <button
          onClick={() => router.push("/Name")}
          className="flex flex-row-reverse items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50/80 transition-all duration-300 group"
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg transition-all duration-300">
            <UserPlus size={20} className="text-blue-600" />
          </div>
          <span className="text-blue-800 font-medium font-cairo">
            إضافة مستخدم
          </span>
        </button>
      </li>
      <li>
        <button
          onClick={() => router.push("/EducationalPrograms")}
          className="flex flex-row-reverse items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50/80 transition-all duration-300 group"
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg transition-all duration-300">
            <GraduationCap size={20} className="text-blue-600" />
          </div>
          <span className="text-blue-800 font-medium font-cairo">
            إدارة البرامج التثقيفية
          </span>
        </button>
      </li>
      <li>
        <button
          onClick={() => router.push("/Establishments")}
          className="flex flex-row-reverse items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50/80 transition-all duration-300 group"
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg transition-all duration-300">
            <Building size={20} className="text-blue-600" />
          </div>
          <span className="text-blue-800 font-medium font-cairo">
            إدارة المنشآت
          </span>
        </button>
      </li>
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
          className="flex items-center bg-gradient-to-l from-blue-600 to-blue-500 text-white rounded-xl px-5 py-3 font-cairo font-bold text-sm shadow-md transition-all hover:shadow-lg hover:from-blue-700 hover:to-blue-600 group"
        >
          <span className="bg-white/20 group-hover:bg-white/30 rounded-lg w-6 h-6 flex items-center justify-center mr-2 font-bold transition-all duration-300">+</span>
          إضافة شهادة جديدة
        </button>
      </motion.div>

      {/* شريط البحث */}
      <div className="px-4 mt-4 mb-6">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="text-blue-400 w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهوية أو رقم الشهادة أو نوعها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-4 pr-10 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white/95 transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      {/* جدول البيانات */}
      <main className="flex-grow flex justify-center px-4 pb-8">
        <div className="w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 overflow-x-auto border border-white/30">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-5 text-lg font-bold border-b border-blue-100 pb-4 mb-4 text-center text-blue-800 font-cairo">
              <div>#</div>
              <div>الاسم</div>
              <div>رقم الهوية</div>
              <div>رقم الشهادة الطبية</div>
              <div>نوع الشهادة</div>
            </div>

            {/* Rows */}
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((c, index) => (
                <motion.div
                  key={index}
                  className="grid grid-cols-5 items-center text-center py-4 border-b border-blue-50/60 text-blue-900 hover:bg-blue-50/40 transition-all duration-300 rounded-xl my-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="font-extrabold text-lg text-blue-700">{index + 1}</span>
                  <p className="font-cairo font-semibold">{c.name}</p>
                  <p className="font-cairo font-semibold">{c.idNumber}</p>
                  <p className="font-cairo font-semibold">{c.healthCertificateNumber}</p>
                  <p className="font-cairo font-semibold">{c.certificateType}</p>

                  <div className="flex justify-center gap-3 col-span-5 mt-3">
                    <button
                      onClick={() => router.push(`/newLeave?certificateNumber=${encodeURIComponent(c.healthCertificateNumber)}`)}
                      className="p-2 bg-amber-100/80 hover:bg-amber-200/70 text-amber-700 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-1"
                      title="تعديل"
                    >
                      <Pencil size={18} />
                      <span className="font-cairo text-sm font-medium">تعديل</span>
                    </button>
                    {/* <button
                      onClick={() => handleDelete(c.healthCertificateNumber)}
                      className="p-2 bg-rose-100/80 hover:bg-rose-200/70 text-rose-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-1"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                      <span className="font-cairo text-sm font-medium">حذف</span>
                    </button> */}
                    <button
                      onClick={() => {
                        const printUrl = `/health-certificate?certificateNumber=${encodeURIComponent(c.healthCertificateNumber)}`;
                        window.open(printUrl, '_blank');
                      }}
                      className="p-2 bg-blue-100/80 hover:bg-blue-200/70 text-blue-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-1"
                      title="طباعة"
                    >
                      <Printer size={18} />
                      <span className="font-cairo text-sm font-medium">طباعة</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-blue-700/70 font-cairo">
                {searchQuery ? "لم يتم العثور على نتائج" : "لا توجد شهادات مسجلة بعد"}
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}