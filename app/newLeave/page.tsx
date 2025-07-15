"use client";

import { useState, useEffect, useRef } from "react";
import moment from "moment-hijri";
import { db } from "../firebaseConfig";
import { query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { collection, addDoc ,onSnapshot} from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const generateLeaveCode = () => {
  return `GLS250763${Math.floor(10000 + Math.random() * 90000)}`;
};
export default function Home() {
  

  
  const [isEditing, setIsEditing] = useState(false);
const [editSearch, setEditSearch] = useState("");
const [editingDocId, setEditingDocId] = useState(null);

  const [formData, setFormData] = useState({
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
  });


{
  const [hospitals, setHospitals] = useState([]);
  const [showHospitalList, setShowHospitalList] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const hospitalListRef = useRef(null);
const searchParams = useSearchParams();


useEffect(() => {
  if (editSearch.trim() !== "") {
    fetchUserData();
  }
}, [editSearch]);

// تعديل useEffect لاستخلاص الباراميتر فقط وتفعيل التعديل
useEffect(() => {
  const param = searchParams.get("editSearch");
  if (param) {
    setEditSearch(param);
    setIsEditing(true);
  }
}, [searchParams]);
 


[];
  // جلب المستشفيات
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "hospitals"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHospitals(list);
    });
    return () => unsubscribe();
  }, []);

  // إخفاء القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        hospitalListRef.current &&
        !hospitalListRef.current.contains(event.target)
      ) {
        setShowHospitalList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // اختيار مستشفى
  const selectHospital = (hospital) => {
    setFormData({
      ...formData,
      hospital: hospital.name,
      hospitalEn: hospital.nameEn || "",
    });
    setShowHospitalList(false);
    setHospitalSearch("");
  };

  // فلترة حسب البحث
  const filteredHospitals = hospitals.filter(h =>
    h.name.includes(hospitalSearch)
  );
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDurationChange = (e) => {
  const days = parseInt(e.target.value);
  if (!formData.leaveStart) {
    alert("الرجاء اختيار تاريخ بدء الإجازة أولاً");
    return;
  }
  const startDate = new Date(formData.leaveStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + days - 1); // حساب تاريخ نهاية الإجازة بشكل دقيق

  const entryDate = new Date(startDate); // تاريخ الدخول = تاريخ بداية الإجازة
const entryDateREP = new Date(startDate); // تاريخ الدخول = تاريخ بداية الإجازة
  setFormData({
    ...formData,
    reportDate:entryDateREP.toISOString().split("T")[0],
    leaveDuration: days,
    leaveEnd: endDate.toISOString().split("T")[0],
    entryDate: entryDate.toISOString().split("T")[0],
  });
};
  // حالة الأطباء من الفايربيس
  const [doctors, setDoctors] = useState([]);
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const doctorListRef = useRef(null);

  // تحميل قائمة الأطباء من فايربيس
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "doctors"), (snapshot) => {
      const docsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(docsData);
    });
    return () => unsubscribe();
  }, []);

  // إخفاء القائمة عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        doctorListRef.current &&
        !doctorListRef.current.contains(event.target)
      ) {
        setShowDoctorList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // دالة اختيار طبيب من القائمة
  const selectDoctor = (doctor) => {
    setFormData({
      ...formData,
      doctorName: doctor.doctorName,
      doctorNameEn: doctor.doctorNameEn,
    });
    setShowDoctorList(false);
    setDoctorSearch("");
  };

  // فلترة الأطباء حسب البحث
  const filteredDoctors = doctors.filter((doc) =>
    doc.doctorName.includes(doctorSearch)
  );
  const toHijri = (date) => {
    return moment(date, "YYYY-MM-DD").format("iYYYY/iMM/iDD");
  };


  const fetchUserData = async () => {
  if (!editSearch.trim()) {
    alert("يرجى إدخال الاسم أو رقم الهوية");
    return;
  }

  const q = query(
    collection(db, "users"),
    where("name", "==", editSearch.trim())
  );

  const q2 = query(
    collection(db, "users"),
    where("idNumber", "==", editSearch.trim())
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q),
    getDocs(q2),
  ]);

  const docs = [...snapshot1.docs, ...snapshot2.docs];

  if (docs.length === 0) {
    alert("لم يتم العثور على بيانات لهذا الشخص");
    return;
  }

  const docData = docs[0].data();
  setEditingDocId(docs[0].id);

  setFormData({
    ...formData,
    ...docData, // يتم تعبئة كل شيء من البيانات القديمة
  });

  alert("تم تحميل البيانات. يمكنك الآن تعديلها.");
};
 const saveUserData = async () => {
  const userData = {

    leaveDurationHijri: `${formData.leaveDuration} يوم (${toHijri(formData.entryDate)} إلى ${toHijri(formData.leaveEnd)})`,
    leaveDurationGregorian: ` ${formData.leaveDuration} Days  (${formData.entryDate} to ${formData.leaveEnd})`,
    leaveDurationDays: formData.leaveDuration,


    
    leaveStartHijri: toHijri(formData.entryDate),
    leaveStartGregorian: formData.entryDate,
    leaveEndHijri: toHijri(formData.leaveEnd),
    leaveEndGregorian: formData.leaveEnd,
  

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
     hospitalEn:formData.hospitalEn,
  };

  try {
    if (isEditing && editingDocId) {
      // تعديل البيانات الحالية
      const userDoc = doc(db, "users", editingDocId);
      await updateDoc(userDoc, userData);
      alert("تم تعديل البيانات بنجاح");
    } else {
    const checkCode = query(collection(db, "users"), where("leaveCode", "==", formData.leaveCode));
const codeDocs = await getDocs(checkCode);

if (codeDocs.size > 0) {
  alert("رمز الإجازة محجوز مسبقاً، لا يمكن استخدامه مرة أخرى");
  return;
}

// تحقق من الاسم أو الهوية المكررة
const checkName = query(collection(db, "users"), where("name", "==", formData.name));
const checkID = query(collection(db, "users"), where("idNumber", "==", formData.idNumber));
const [nameDocs, idDocs] = await Promise.all([getDocs(checkName), getDocs(checkID)]);

if (nameDocs.size > 0 || idDocs.size > 0) {
  alert("الاسم أو رقم الهوية مسجل مسبقاً، استخدم زر التعديل");
  return;
}


// إنشاء رمز جديد

      await addDoc(collection(db, "users"), userData);
      alert("تم حفظ البيانات بنجاح");
      setFormData({
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
    hospitalEn:"",
});
    }
  } catch (error) {
    console.error("خطأ في حفظ البيانات:", error);
    alert("فشل في حفظ البيانات");
  }
};

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
              <>
                <div className="text-gray-700">
                  {`${formData.leaveDuration} يوم`} ( {toHijri(formData.leaveStart)} إلى {toHijri(formData.leaveEnd)} )
                </div>
                <div className="text-gray-700">
                  {`${formData.leaveDuration} Days`} ( {formData.leaveStart} to {formData.leaveEnd} )
                </div>
              </>
            ) : (
              <div className="text-gray-700">الرجاء اختيار تاريخ بدء الإجازة ومدة الإجازة</div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-1">تاريخ الدخول:</div>
            {formData.entryDate ? (
              <>
                <div className="text-gray-700">{toHijri(formData.entryDate)}</div>
                <div className="text-gray-700">{formData.entryDate}</div>
              </>
            ) : (
              <div className="text-gray-700">-</div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-1">تاريخ نهاية الإجازة:</div>
            {formData.leaveEnd ? (
              <>
                <div className="text-gray-700">{toHijri(formData.leaveEnd)}</div>
                <div className="text-gray-700">{formData.leaveEnd}</div>
              </>
            ) : (
              <div className="text-gray-700">-</div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-1">تاريخ إصدار التقرير:</div>
            <div>{formData.reportDate || "-"}</div>
          </div>

          {/* الحقول الشخصية */}
          {/* ... الحقول الشخصية مع تعديل doctorName و doctorNameEn ... */}
          {[
            ["الاسم", "name", "ادخل الاسم", "Name", "nameEn", "Enter your name"],
            ["رقم الهوية / الإقامة", "idNumber", "ادخل رقم الهوية", ],
            ["الجنسية", "nationality", "ادخل الجنسية", "Nationality", "nationalityEn", "Enter nationality"],
            ["جهة العمل", "workPlace", "ادخل جهة العمل", "Workplace", "workPlaceEn", "Enter workplace"],
            // نحذف doctorName و doctorNameEn من هنا لأنه سنضيفهم بشكل منفصل أدناه
            ["المسمى الوظيفي", "jobTitle", "ادخل المسمى الوظيفي", "Job Title", "jobTitleEn", "Enter job title"],
          ].map(([labelAr, nameAr, placeholderAr, labelEn, nameEn, placeholderEn]) => (
           <div key={nameAr}>
              <label className="font-semibold mb-1 block">{labelAr}:</label>
              <input
                type="text"
                name={nameAr}
                value={formData[nameAr]}
                onChange={handleChange}
                placeholder={placeholderAr}
                className="w-full border border-gray-300 p-2 rounded-lg mb-2"
              />
              <label className="font-semibold mb-1 block">{labelEn}:</label>
              <input
                type="text"
                name={nameEn}
                value={formData[nameEn]}
                onChange={handleChange}
                placeholder={placeholderEn}
                className="w-full border border-gray-300 p-2 rounded-lg"
              />
            </div>
          ))}
          
 {/* الآن حقل الطبيب المعالج مع زر اختيار */}
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

            {/* قائمة الأطباء */}
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

          {/* حقل اسم الطبيب بالإنجليزي (مُعبأ تلقائي) */}
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
<div>
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

        {/* القائمة */}
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

      {/* الاسم الإنجليزي (يظهر تلقائيًا بعد اختيار المستشفى) */}
     <div className="mb-4">
  <label className="font-semibold mb-1 block">Hospital Name (English):</label>
  <input
    type="text"
    name="hospitalEn"
    value={formData.hospitalEn || ""}
    onChange={(e) =>
      setFormData({ ...formData, hospitalEn: e.target.value })
    }
    className="w-full border border-gray-300 p-2 rounded-lg text-gray-700"
    placeholder="اكتب أو سيتم تعبئته تلقائيًا"
  />
</div>
    
</div>
          <button
            onClick={saveUserData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-4 w-full"
          >
            حفظ البيانات
          </button>

          <Link href="/a4page">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4 w-full">
              طباعه تقرير
            </button>
          </Link>
        </div>

        {/* زر التحقق من الإجازة في العمود الثاني */}
        <div className="flex items-start justify-center md:justify-end">
          <Link href="/checkleavepage">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              التحقق من الإجازة
            </button>
          </Link>
        </div>
        <div className="mt-6">
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
        onClick={fetchUserData}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
      >
        جلب البيانات
      </button>
    </div>
  )}
</div>
      </div>
    </div>
  );
}
}