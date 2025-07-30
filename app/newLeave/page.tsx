"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { db } from "../firebaseConfig";
import { query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// تعريف الأنواع الآمنة مع إضافة حقل رقم الترخيص للمستشفى
type Doctor = {
  id: string;
  doctorName?: string;
  doctorNameEn?: string;
};

type Hospital = {
  id: string;
  name?: string;
  nameEn?: string;
  licenseNumber?: string;
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
  selectedTime: string;
  timeDisplay: string;
  licenseNumber: string;
};

const generateLeaveCode = (prefix: string = "GSL"): string => {
  return `${prefix}250763${Math.floor(10000 + Math.random() * 90000)}`;
};

const convertNumbersToEnglish = (value: string): string => {
  const arabicToEnglishMap: { [key: string]: string } = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    '٫': '.'
  };
  
  return value
    .split('')
    .map(char => arabicToEnglishMap[char] || char)
    .join('');
};

function MainContent() {
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
  const [prefix, setPrefix] = useState<"GSL" | "PSL">("GSL");
  const [customDuration, setCustomDuration] = useState<string>("");
  const [savedCustomDuration, setSavedCustomDuration] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('savedCustomDuration') || "";
    }
    return "";
  });

  const initialFormData: FormData = {
    leaveCode: generateLeaveCode(prefix),
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
    selectedTime: "12:00",
    timeDisplay: "12:00 مساءً",
    licenseNumber: ""
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const togglePrefix = () => {
    const newPrefix = prefix === "GSL" ? "PSL" : "GSL";
    setPrefix(newPrefix);
    const newCode = generateLeaveCode(newPrefix);
    setFormData(prev => ({
      ...prev,
      leaveCode: newCode,
      licenseNumber: newPrefix === "GSL" ? "" : prev.licenseNumber
    }));
  };

  const handleAddCustomDuration = () => {
    const num = parseInt(customDuration);
    if (!isNaN(num) && num > 0) {
      setSavedCustomDuration(customDuration);
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedCustomDuration', customDuration);
      }
      
      if (formData.leaveStart) {
        const startDate = new Date(formData.leaveStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + num - 1);
        
        setFormData({
          ...formData,
          leaveDuration: num,
          leaveEnd: endDate.toISOString().split("T")[0],
          reportDate: startDate.toISOString().split("T")[0],
          entryDate: startDate.toISOString().split("T")[0],
        });
      }
      setCustomDuration("");
    } else {
      alert("الرجاء إدخال رقم صحيح أكبر من الصفر");
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "hospitals"), (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          nameEn: data.nameEn || "",
          licenseNumber: data.licenseNumber || ""
        } as Hospital;
      });
      setHospitals(list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "doctors"), (snapshot) => {
      const docsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          doctorName: data.doctorName || "",
          doctorNameEn: data.doctorNameEn || ""
        } as Doctor;
      });
      setDoctors(docsData);
    });
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    const param = searchParams.get("editSearch");
    if (param) {
      setEditSearch(param);
      setIsEditing(true);
      fetchUserData(param);
    }
  }, [searchParams]);

  const fetchUserData = async (searchValue = editSearch) => {
    if (!searchValue.trim()) {
      alert("يرجى إدخال الاسم أو رقم الهوية");
      return;
    }

    try {
      const q = query(collection(db, "users"), 
        where("name", "==", searchValue.trim()));
      
      const q2 = query(collection(db, "users"), 
        where("leaveCode", "==", searchValue.trim()));
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q),
        getDocs(q2),
      ]);

      const docs = [...snapshot1.docs, ...snapshot2.docs];

      if (docs.length === 0) {
        alert("لم يتم العثور على بيانات لهذا الشخص");
        return;
      }

      const docData = docs[0].data() as Partial<FormData>;
      setEditingDocId(docs[0].id);

      setFormData({
        ...initialFormData,
        ...docData,
      } as FormData);

      if (docData.leaveCode?.startsWith("PSL")) {
        setPrefix("PSL");
      } else {
        setPrefix("GSL");
      }

      alert("تم تحميل البيانات. يمكنك الآن تعديلها.");
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      alert("حدث خطأ أثناء جلب البيانات");
    }
  };

  const selectHospital = (hospital: Hospital) => {
    setFormData({
      ...formData,
      hospital: hospital.name || "",
      hospitalEn: hospital.nameEn || "",
      licenseNumber: hospital.licenseNumber || "",
    });
    setShowHospitalList(false);
    setHospitalSearch("");
  };

  const selectDoctor = (doctor: Doctor) => {
    setFormData({
      ...formData,
      doctorName: doctor.doctorName || "",
      doctorNameEn: doctor.doctorNameEn || "",
    });
    setShowDoctorList(false);
    setDoctorSearch("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "selectedTime") {
      const formattedTime = formatTimeForDisplay(value);
      setFormData(prev => ({
        ...prev, 
        [name]: value,
        timeDisplay: formattedTime
      } as FormData));
    } else {
      setFormData(prev => ({ ...prev, [name]: value } as FormData));
    }
  };

  const handleEnglishFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as FormData));
  };

  const formatTimeForDisplay = (time: string): string => {
    if (!time) return "";
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

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

  const saveUserData = async () => {
    if (prefix === "PSL" && !formData.licenseNumber.trim()) {
      alert("يرجى إدخال رقم الترخيص لشهادة PSL");
      return;
    }
    
    const processedData = {
      ...formData,
      name: convertNumbersToEnglish(formData.name),
      idNumber: convertNumbersToEnglish(formData.idNumber),
      nameEn: formData.nameEn,
      idNumberEn: formData.idNumberEn,
      nationality: convertNumbersToEnglish(formData.nationality),
      nationalityEn: formData.nationalityEn,
      workPlace: convertNumbersToEnglish(formData.workPlace),
      workPlaceEn: formData.workPlaceEn,
      doctorName: convertNumbersToEnglish(formData.doctorName),
      doctorNameEn: formData.doctorNameEn,
      jobTitle: convertNumbersToEnglish(formData.jobTitle),
      jobTitleEn: formData.jobTitleEn,
      hospital: convertNumbersToEnglish(formData.hospital),
      hospitalEn: formData.hospitalEn,
      leaveCode: convertNumbersToEnglish(formData.leaveCode),
      licenseNumber: prefix === "PSL" ? `${convertNumbersToEnglish(formData.licenseNumber)}` : ""
    };

    const userData = {
      leaveDurationGregorian: `${processedData.leaveDuration} Days (${processedData.entryDate} to ${processedData.leaveEnd})`,
      leaveDurationDays: processedData.leaveDuration,
      leaveStartGregorian: processedData.entryDate,
      reportDate: processedData.reportDate,
      leaveEndGregorian: processedData.leaveEnd,
      name: processedData.name,
      nameEn: processedData.nameEn,
      idNumber: processedData.idNumber,
      nationality: processedData.nationality,
      nationalityEn: processedData.nationalityEn,
      workPlace: processedData.workPlace,
      workPlaceEn: processedData.workPlaceEn,
      doctorName: processedData.doctorName,
      doctorNameEn: processedData.doctorNameEn,
      jobTitle: processedData.jobTitle,
      jobTitleEn: processedData.jobTitleEn,
      leaveCode: processedData.leaveCode,
      hospital: processedData.hospital,
      hospitalEn: processedData.hospitalEn,
      selectedTime: processedData.selectedTime,
      timeDisplay: processedData.timeDisplay,
      licenseNumber: processedData.licenseNumber
    };

    try {
      if (isEditing && editingDocId) {
        const userDoc = doc(db, "users", editingDocId);
        await updateDoc(userDoc, userData);
        alert("تم تعديل البيانات بنجاح");
      } else {
        const checkCode = query(collection(db, "users"), 
          where("leaveCode", "==", processedData.leaveCode));
        const codeDocs = await getDocs(checkCode);

        if (codeDocs.size > 0) {
          alert("رمز الإجازة محجوز مسبقاً، لا يمكن استخدامه مرة أخرى");
          return;
        }

        await addDoc(collection(db, "users"), userData);
        alert("تم حفظ البيانات بنجاح");
        
        setFormData({
          ...initialFormData,
          leaveCode: generateLeaveCode(prefix),
          licenseNumber: prefix === "PSL" ? formData.licenseNumber : ""
        });
      }
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
      alert("فشل في حفظ البيانات");
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    (h.name || "").toLowerCase().includes(hospitalSearch.toLowerCase())
  );
  
  const filteredDoctors = doctors.filter(doc => 
    (doc.doctorName || "").toLowerCase().includes(doctorSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* العمود العربي */}
        <div className="space-y-6 border-r border-gray-300 pr-8" dir="rtl">
          <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">نموذج إصدار شهادة الإجازة</h1>

          <div>
            <div className="font-semibold mb-1 flex items-center gap-2">
              <span>رمز الإجازة:</span>
              <button
                onClick={togglePrefix}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
              >
                {prefix === "GSL" ? "PSL" : "GSL"}
              </button>
            </div>
            <div className="text-blue-600 text-lg flex items-center gap-2">
              {formData.leaveCode}
              <span className="text-xs text-gray-500">(اضغط على الزر للتبديل)</span>
            </div>
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
            <label className="font-semibold mb-1 block">اختر الوقت:</label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                name="selectedTime"
                value={formData.selectedTime}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg"
              />
              <div className="bg-blue-50 px-4 py-2 rounded-lg min-w-[120px]">
                {formData.timeDisplay}
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold mb-1 block">اختر مدة الإجازة:</label>
            <div className="flex gap-2 mb-2">
              <select
                value={formData.leaveDuration}
                onChange={handleDurationChange}
                className="flex-1 border border-gray-300 p-2 rounded-lg"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} يوم
                  </option>
                ))}
                {savedCustomDuration && (
                  <option value={parseInt(savedCustomDuration)}>
                    {savedCustomDuration} يوم (مخصص)
                  </option>
                )}
              </select>
              
              <div className="flex gap-2" style={{ width: '200px' }}>
                <input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="أيام"
                  className="flex-1 border border-gray-300 p-2 rounded-lg w-16"
                  min="1"
                />
                <button
                  onClick={handleAddCustomDuration}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  تأكيد
                </button>
              </div>
            </div>
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
                    onChange={handleEnglishFieldChange}
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
                      <div className="font-medium">{doctor.doctorName || "غير معروف"}</div>
                      {doctor.doctorNameEn && (
                        <div className="text-xs text-gray-500">({doctor.doctorNameEn})</div>
                      )}
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
              onChange={handleEnglishFieldChange}
              placeholder="Enter doctor name in English"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          {/* حقل المستشفى المعدل */}
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
                      <div className="font-medium">{hospital.name || "غير معروف"}</div>
                      {hospital.nameEn && (
                        <div className="text-xs text-gray-500">({hospital.nameEn})</div>
                      )}
                      {hospital.licenseNumber && (
                        <div className="text-xs text-green-600 mt-1">{hospital.licenseNumber}</div>
                      )}
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
              value={formData.hospitalEn}
              onChange={handleEnglishFieldChange}
              className="w-full border border-gray-300 p-2 rounded-lg text-gray-700"
              placeholder="اكتب أو سيتم تعبئته تلقائيًا"
            />
          </div>

          {/* حقل رقم الترخيص - يظهر فقط عند اختيار PSL */}
          {prefix === "PSL" && (
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <span className="bg-gray-100 px-4 py-3 text-gray-700 border-r border-gray-300">
                رقم الترخيص:
              </span>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                placeholder="أدخل رقم الترخيص"
                className="flex-1 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
          )}

          {/* الأزرار */}
          <div className="flex flex-col gap-4 mt-6">
            <button
              onClick={saveUserData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              حفظ البيانات
            </button>

            <Link href="/a4page">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full" >
                طباعه تقرير 
              </button>
            </Link>

            <Link href="/hom">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
              رجوع
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

          {/* معلومات إضافية مع عرض الوقت */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">معلومات الإجازة</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">تاريخ بدء الإجازة:</span>
                <span> {formData.leaveStart || "غير محدد"}</span>
              </div>
              <div>
                <span className="font-medium">الوقت المحدد:</span>
                <span> {formData.timeDisplay || "غير محدد"}</span>
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
              <div>
                <span className="font-medium">بادئة رمز الإجازة:</span>
                <span className="font-bold text-blue-700"> {prefix}</span>
              </div>
              
              {prefix === "PSL" && (
                <div>
                  <span className="font-medium">رقم الترخيص:</span>
                  <span className="text-green-700"> {formData.licenseNumber || "غير محدد"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-2xl text-purple-700">جاري التحميل...</div>}>
      <MainContent />
    </Suspense>
  );
}