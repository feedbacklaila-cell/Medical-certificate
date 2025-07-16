"use client";

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Stethoscope } from "lucide-react";

// ✅ تعريف نوع الطبيب
type Doctor = {
  id: string;
  doctorName: string;
  doctorNameEn: string;
};

export default function AddDoctorPage() {
  const [doctorName, setDoctorName] = useState("");
  const [doctorNameEn, setDoctorNameEn] = useState("");
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]); // ✅ تم تحديد النوع

  // ✅ تعريف دالة جلب الأطباء
  const fetchDoctors = async () => {
    try {
      const snapshot = await getDocs(collection(db, "doctors"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Doctor[]; // ✅ تأكيد النوع
      setDoctors(list);
    } catch (error) {
      console.error("فشل في تحميل الأطباء:", error);
    }
  };

  // ✅ جلب الأطباء عند التحميل الأول
  useEffect(() => {
    fetchDoctors();
  }, []);

  // ✅ حفظ بيانات الطبيب
  const saveDoctor = async () => {
    if (!doctorName.trim() || !doctorNameEn.trim()) {
      alert("يرجى إدخال اسمي الطبيب بالعربي والإنجليزي");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "doctors"), {
        doctorName: doctorName.trim(),
        doctorNameEn: doctorNameEn.trim(),
      });

      alert("✅ تم حفظ الطبيب بنجاح");

      setDoctorName("");
      setDoctorNameEn("");
      fetchDoctors(); // تحديث القائمة
    } catch (error) {
      console.error("❌ خطأ في حفظ الطبيب:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-8 lg:px-24">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center border-b pb-4">
          🩺 إضافة طبيب جديد
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="ادخل اسم الطبيب (بالعربي)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm"
          />

          <input
            type="text"
            value={doctorNameEn}
            onChange={(e) => setDoctorNameEn(e.target.value)}
            placeholder="Enter doctor name (English)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm"
          />

          <button
            onClick={saveDoctor}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl flex items-center justify-center gap-2 text-lg font-semibold shadow disabled:opacity-50"
          >
            <Stethoscope className="w-5 h-5" />
            {loading ? "جارٍ الحفظ..." : "حفظ الطبيب"}
          </button>
        </div>

        {/* قائمة الأطباء */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            👨‍⚕️ قائمة الأطباء
          </h2>

          {doctors.length === 0 ? (
            <p className="text-gray-500">لا يوجد أطباء مضافين بعد.</p>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {doctors.map((doc) => (
                <li
                  key={doc.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900 shadow-sm"
                >
                  {doc.doctorName}
                  <span className="text-sm text-gray-500 ltr:ml-2 rtl:mr-2">
                    ({doc.doctorNameEn})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
