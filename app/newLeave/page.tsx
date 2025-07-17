"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// تعريف الأنواع
type Doctor = {
  id: string;
  doctorName?: string;
  doctorNameEn?: string;
};

type Hospital = {
  id: string;
  name?: string;
  nameEn?: string;

};

type FormData = {
  leaveCode: string;
  leaveStart: string;
  leaveDuration: number;
  leaveEnd: string;
  reportDate: string;
  entryDate: string;
  name: string;
  idNumber: string;
  nationality: string;
  workPlace: string;
  doctorName: string;
  jobTitle: string;
  nameEn: string;
  idNumberEn: string;
  nationalityEn: string;
  workPlaceEn: string;
  doctorNameEn: string;
  jobTitleEn: string;
  hospital: string;
  hospitalEn: string;
};

const generateLeaveCode = (): string => {
  return `GLS250763${Math.floor(10000 + Math.random() * 90000)}`;
};

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editSearch, setEditSearch] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [showHospitalList, setShowHospitalList] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const hospitalListRef = useRef<HTMLUListElement>(null);
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const doctorListRef = useRef<HTMLUListElement>(null);
  const searchParams = useSearchParams();

  const initialFormData: FormData = {
    leaveCode: generateLeaveCode(),
    leaveStart: "",
    leaveDuration: 1,
    leaveEnd: "",
    reportDate: "",
    entryDate: "",
    name: "",
    idNumber: "",
    nationality: "السعودية",
    workPlace: "",
    doctorName: "",
    jobTitle: "",
    nameEn: "",
    idNumberEn: "",
    nationalityEn: "Saudi Arabia",
    workPlaceEn: "",
    doctorNameEn: "",
    jobTitleEn: "",
    hospital: "",
    hospitalEn: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // جلب المستشفيات
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "hospitals"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Hospital[];
      setHospitals(list);
    });
    return () => unsubscribe();
  }, []);

  // جلب الأطباء
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "doctors"), (snapshot) => {
      const docsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Doctor[];
      setDoctors(docsData);
    });
    return () => unsubscribe();
  }, []);

  // إخفاء القوائم عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (hospitalListRef.current && !hospitalListRef.current.contains(event.target as Node)) {
        setShowHospitalList(false);
      }
      if (doctorListRef.current && !doctorListRef.current.contains(event.target as Node)) {
        setShowDoctorList(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // التحميل التلقائي عند وجود معلمة URL
  useEffect(() => {
    const param = searchParams.get("editSearch");
    if (param) {
      setEditSearch(param);
      setIsEditing(true);
      fetchUserData(param);
    }
  }, [searchParams]);

  // جلب بيانات المستخدم
  const fetchUserData = async (searchValue = editSearch) => {
    if (!searchValue.trim()) {
      alert("يرجى إدخال الاسم أو رقم الهوية");
      return;
    }

    try {
      const q = query(collection(db, "users"), 
        where("name", "==", searchValue.trim()));
      
      const q2 = query(collection(db, "users"), 
        where("idNumber", "==", searchValue.trim()));
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q),
        getDocs(q2),
      ]);

      const docs = [...snapshot1.docs, ...snapshot2.docs];

      if (docs.length === 0) {
        alert("لم يتم العثور على بيانات لهذا الشخص");
        return;
      }

      const docData = docs[0].data() as FormData;
      setEditingDocId(docs[0].id);

      setFormData({
        ...initialFormData,
        ...docData,
      });

      alert("تم تحميل البيانات. يمكنك الآن تعديلها.");
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      alert("حدث خطأ أثناء جلب البيانات");
    }
  };

  // اختيار مستشفى
  const selectHospital = (hospital: Hospital) => {
    setFormData({
      ...formData,
      hospital: hospital.name || "",
      hospitalEn: hospital.nameEn || "",
    });
    setShowHospitalList(false);
    setHospitalSearch("");
  };

  // اختيار طبيب
  const selectDoctor = (doctor: Doctor) => {
    setFormData({
      ...formData,
      doctorName: doctor.doctorName || "",
      doctorNameEn: doctor.doctorNameEn || "",
    });
    setShowDoctorList(false);
    setDoctorSearch("");
  };

  // معالجة التغييرات
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // معالجة تغيير مدة الإجازة
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const days = parseInt(e.target.value);
    if (!formData.leaveStart) {
      alert("الرجاء اختيار تاريخ بدء الإجازة أولاً");
      return;
    }
    
    const startDate = new Date(formData.leaveStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days - 1);
    
    setFormData({
      ...formData,
      leaveDuration: days,
      leaveEnd: endDate.toISOString().split("T")[0],
      reportDate: startDate.toISOString().split("T")[0],
      entryDate: startDate.toISOString().split("T")[0],
    });
  };

  // حفظ البيانات
  const saveUserData = async () => {
    const userData = {
      leaveDurationGregorian: `${formData.leaveDuration} Days (${formData.entryDate} to ${formData.leaveEnd})`,
      leaveDurationDays: formData.leaveDuration,
      leaveStartGregorian: formData.entryDate,
      reportDate: formData.reportDate,
      name: formData.name,
      nameEn: formData.nameEn,
      idNumber: formData.idNumber,
      nationality: formData.nationality,
      nationalityEn: formData.nationalityEn,
      workPlace: formData.workPlace,
      workPlaceEn: formData.workPlaceEn,
      doctorName: formData.doctorName,
      doctorNameEn: formData.doctorNameEn,
      jobTitle: formData.jobTitle,
      jobTitleEn: formData.jobTitleEn,
      leaveCode: formData.leaveCode,
      hospital: formData.hospital,
      hospitalEn: formData.hospitalEn,
    };

    try {
      if (isEditing && editingDocId) {
        const userDoc = doc(db, "users", editingDocId);
        await updateDoc(userDoc, userData);
        alert("تم تعديل البيانات بنجاح");
      } else {
        const checkCode = query(collection(db, "users"), 
          where("leaveCode", "==", formData.leaveCode));
        const codeDocs = await getDocs(checkCode);

        if (codeDocs.size > 0) {
          alert("رمز الإجازة محجوز مسبقاً، لا يمكن استخدامه مرة أخرى");
          return;
        }

        const checkName = query(collection(db, "users"), 
          where("name", "==", formData.name));
        const checkID = query(collection(db, "users"), 
          where("idNumber", "==", formData.idNumber));
        
        const [nameDocs, idDocs] = await Promise.all([
          getDocs(checkName), 
          getDocs(checkID)
        ]);

        if (nameDocs.size > 0 || idDocs.size > 0) {
          alert("الاسم أو رقم الهوية مسجل مسبقاً، استخدم زر التعديل");
          return;
        }

        await addDoc(collection(db, "users"), userData);
        alert("تم حفظ البيانات بنجاح");
        
        // إعادة تعيين النموذج بعد الحفظ
        setFormData({
          ...initialFormData,
          leaveCode: generateLeaveCode(),
        });
      }
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
      alert("فشل في حفظ البيانات");
    }
  };

  // فلترة المستشفيات
  const filteredHospitals = hospitals.filter(h => 
    h.name?.includes(hospitalSearch)
  );
  
  // فلترة الأطباء
  const filteredDoctors = doctors.filter(doc => 
    doc.doctorName?.includes(doctorSearch)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* العمود العربي */}
        <div className="space-y-6 border-r border-gray-300 pr-8" dir="rtl">
          <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">نموذج إصدار شهادة الإجازة</h1>

          <div>
            <div className="font-semibold mb-1">رمز الإجازة:</div>
            <div className="text-blue-600 text-lg">{formData.leaveCode}</div>
          </div>

          <div>
            <label className="font-semibold mb-1 block">تاريخ بدء الإجازة:</label>
            <input
              type="date"
              name="leaveStart"
              value={formData.leaveStart}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold mb-1 block">اختر مدة الإجازة:</label>
            <select
              value={formData.leaveDuration}
              onChange={handleDurationChange}
              className="w-full border border-gray-300 p-2 rounded-lg"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} يوم
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="font-semibold mb-1">مدة الإجازة:</div>
            {formData.leaveStart && formData.leaveEnd ? (
              <div className="text-gray-700">
                {`${formData.leaveDuration} يوم (${formData.leaveStart} إلى ${formData.leaveEnd})`}
              </div>
            ) : (
              <div className="text-gray-700">الرجاء اختيار تاريخ بدء الإجازة ومدة الإجازة</div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-1">تاريخ الدخول:</div>
            <div className="text-gray-700">{formData.entryDate || "-"}</div>
          </div>

          <div>
            <div className="font-semibold mb-1">تاريخ إصدار التقرير:</div>
            <div>{formData.reportDate || "-"}</div>
          </div>

          {/* الحقول الشخصية */}
          {[
            ["الاسم", "name", "ادخل الاسم", "Name", "nameEn", "Enter your name"],
            ["رقم الهوية / الإقامة", "idNumber", "ادخل رقم الهوية"],
            ["الجنسية", "nationality", "ادخل الجنسية", "Nationality", "nationalityEn", "Enter nationality"],
            ["جهة العمل", "workPlace", "ادخل جهة العمل", "Workplace", "workPlaceEn", "Enter workplace"],
            ["المسمى الوظيفي", "jobTitle", "ادخل المسمى الوظيفي", "Job Title", "jobTitleEn", "Enter job title"],
          ].map(([labelAr, nameAr, placeholderAr, labelEn, nameEn, placeholderEn]) => (
            <div key={nameAr as string}>
              <label className="font-semibold mb-1 block">{labelAr as string}:</label>
              <input
                type="text"
                name={nameAr as string}
                value={formData[nameAr as keyof FormData] as string}
                onChange={handleChange}
                placeholder={placeholderAr as string}
                className="w-full border border-gray-300 p-2 rounded-lg mb-2"
              />
              {labelEn && (
                <>
                  <label className="font-semibold mb-1 block">{labelEn as string}:</label>
                  <input
                    type="text"
                    name={nameEn as string}
                    value={formData[nameEn as keyof FormData] as string}
                    onChange={handleChange}
                    placeholder={placeholderEn as string}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                  />
                </>
              )}
            </div>
          ))}
          
          {/* حقل الطبيب المعالج */}
          <div className="relative">
            <label className="font-semibold mb-1 block">اسم الطبيب المعالج:</label>
            <div className="flex">
              <input
                type="text"
                name="doctorName"
                value={formData.doctorName}
                onChange={(e) => {
                  handleChange(e);
                  setDoctorSearch(e.target.value);
                  setShowDoctorList(true);
                }}
                placeholder="ادخل اسم الطبيب"
                className="w-full border border-gray-300 p-2 rounded-l-lg"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowDoctorList(!showDoctorList)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-lg"
                title="اختيار طبيب"
              >
                ▼
              </button>
            </div>

            {showDoctorList && (
              <ul
                ref={doctorListRef}
                className="absolute z-10 bg-white border border-gray-300 w-full max-h-48 overflow-auto rounded-b-lg shadow-md"
              >
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <li
                      key={doctor.id}
                      onClick={() => selectDoctor(doctor)}
                      className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                    >
                      {doctor.doctorName}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">لا يوجد أطباء</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label className="font-semibold mb-1 block">Doctor Name (English):</label>
            <input
              type="text"
              name="doctorNameEn"
              value={formData.doctorNameEn}
              onChange={handleChange}
              placeholder="Enter doctor name in English"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          {/* حقل المستشفى */}
          <div className="relative mb-4">
            <label className="font-semibold mb-1 block">ادخال مستشفى:</label>
            <div className="flex">
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={(e) => {
                  setFormData({ ...formData, hospital: e.target.value });
                  setHospitalSearch(e.target.value);
                  setShowHospitalList(true);
                }}
                placeholder="ادخل اسم المستشفى"
                className="w-full border border-gray-300 p-2 rounded-l-lg"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowHospitalList(!showHospitalList)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-lg"
                title="اختيار مستشفى"
              >
                ▼
              </button>
            </div>

            {showHospitalList && (
              <ul
                ref={hospitalListRef}
                className="absolute z-10 bg-white border border-gray-300 w-full max-h-48 overflow-auto rounded-b-lg shadow-md"
              >
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map(hospital => (
                    <li
                      key={hospital.id}
                      onClick={() => selectHospital(hospital)}
                      className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                    >
                      {hospital.name}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">لا توجد مستشفيات</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label className="font-semibold mb-1 block">Hospital Name (English):</label>
            <input
              type="text"
              name="hospitalEn"
              value={formData.hospitalEn || ""}
              onChange={(e) => setFormData({ ...formData, hospitalEn: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-lg text-gray-700"
              placeholder="اكتب أو سيتم تعبئته تلقائيًا"
            />
          </div>

          {/* الأزرار */}
          <div className="flex flex-col gap-4 mt-6">
            <button
              onClick={saveUserData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              حفظ البيانات
            </button>

            <Link href="/a4page">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full">
                طباعه تقرير
              </button>
            </Link>

            <Link href="/checkleavepage">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                التحقق من الإجازة
              </button>
            </Link>
          </div>
        </div>

        {/* قسم التعديل */}
        <div className="space-y-6">
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg w-full"
            >
              {isEditing ? "إغلاق التعديل" : "تعديل البيانات"}
            </button>

            {isEditing && (
              <div className="mt-4">
                <label className="block font-semibold mb-1">ابحث بالاسم أو رقم الهوية:</label>
                <input
                  type="text"
                  value={editSearch}
                  onChange={(e) => setEditSearch(e.target.value)}
                  placeholder="ادخل الاسم أو رقم الهوية"
                  className="w-full border border-gray-300 p-2 rounded-lg mb-2"
                />
                <button
                  onClick={() => fetchUserData()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
                >
                  جلب البيانات
                </button>
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">معلومات الإجازة</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">تاريخ بدء الإجازة:</span>
                <span> {formData.leaveStart || "غير محدد"}</span>
              </div>
              <div>
                <span className="font-medium">تاريخ نهاية الإجازة:</span>
                <span> {formData.leaveEnd || "غير محدد"}</span>
              </div>
              <div>
                <span className="font-medium">المستشفى:</span>
                <span> {formData.hospital || "غير محدد"}</span>
              </div>
              <div>
                <span className="font-medium">الطبيب المعالج:</span>
                <span> {formData.doctorName || "غير محدد"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}