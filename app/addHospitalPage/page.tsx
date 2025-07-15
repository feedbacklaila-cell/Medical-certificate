"use client";

import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { PlusCircle } from "lucide-react";

export default function AddHospitalPage() {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalNameEn, setHospitalNameEn] = useState("");
  const [hospitals, setHospitals] = useState([]);

  const fetchHospitals = async () => {
    const snapshot = await getDocs(collection(db, "hospitals"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHospitals(list);
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleSave = async () => {
    if (!hospitalName.trim() || !hospitalNameEn.trim()) {
      alert("يرجى إدخال اسم المستشفى بالعربي والإنجليزي");
      return;
    }

    await addDoc(collection(db, "hospitals"), {
      name: hospitalName,
      nameEn: hospitalNameEn,
    });

    setHospitalName("");
    setHospitalNameEn("");
    fetchHospitals();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-8 lg:px-24">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center border-b pb-4">📋 إضافة مستشفى</h1>

        <div className="space-y-4">
          <input
            type="text"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="أدخل اسم المستشفى (بالعربي)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm"
          />

          <input
            type="text"
            value={hospitalNameEn}
            onChange={(e) => setHospitalNameEn(e.target.value)}
            placeholder="Enter hospital name (English)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm"
          />

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl flex items-center justify-center gap-2 text-lg font-semibold shadow"
          >
            <PlusCircle className="w-5 h-5" />
            حفظ المستشفى
          </button>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🏥 قائمة المستشفيات</h2>
          {hospitals.length === 0 ? (
            <p className="text-gray-500">لا توجد مستشفيات مضافة بعد.</p>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {hospitals.map((h) => (
                <li
                  key={h.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900 shadow-sm"
                >
                  {h.name}{" "}
                  <span className="text-sm text-gray-500 ltr:ml-2 rtl:mr-2">
                    ({h.nameEn})
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
