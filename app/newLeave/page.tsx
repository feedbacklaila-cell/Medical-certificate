"use client";

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";

import { useSearchParams } from "next/navigation";

type FormData = {
  amana: string;
  baladia: string;
  name: string;
  idNumber: string;
  gender: string;
  nationality: string;
  healthCertificateNumber: string;
  jobTitle: string;
  programType: string;
  licenseNumber: string;
  establishmentName: string;
  establishmentNumber: string;

  certificateIssueDate: string;
  healthCertificateIssueDate: string;
  programEndDate: string;
};

const generateCertificateNumber = (): string => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `255${new Date().getFullYear()}${randomNum}`;
};

export default function HealthCertificateForm() {
  const [formData, setFormData] = useState<FormData>({
    amana: "",
    baladia: "",
    name: "",
    idNumber: "",
    gender: "",
    nationality: "السعودية",
    healthCertificateNumber: generateCertificateNumber(),
    jobTitle: "",
    programType: "",
    licenseNumber: "",
    establishmentName: "",
    establishmentNumber: "",
    certificateIssueDate: "",
    healthCertificateIssueDate: "",
    programEndDate: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.idNumber || !formData.establishmentName) {
      alert("الرجاء إدخال البيانات المطلوبة (الاسم، رقم الهوية، اسم المنشأة)");
      return;
    }

    try {
      const certificateData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing && editingDocId) {
        await updateDoc(doc(db, "healthCertificates", editingDocId), certificateData);
        alert("تم تحديث البيانات بنجاح");
      } else {
        const idQuery = query(collection(db, "healthCertificates"), 
          where("idNumber", "==", formData.idNumber));
        const snapshot = await getDocs(idQuery);

        if (!snapshot.empty && !isEditing) {
          alert("رقم الهوية مسجل مسبقاً");
          return;
        }

        await addDoc(collection(db, "healthCertificates"), certificateData);
        alert("تم حفظ البيانات بنجاح");
        resetForm();
      }
    } catch (error) {
      console.error("حدث خطأ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const resetForm = () => {
    setFormData({
      amana: "",
      baladia: "",
      name: "",
      idNumber: "",
      gender: "",
      nationality: "السعودية",
      healthCertificateNumber: generateCertificateNumber(),
      jobTitle: "",
      programType: "",
      licenseNumber: "",
      establishmentName: "",
      establishmentNumber: "",
      certificateIssueDate: "",
      healthCertificateIssueDate: "",
      programEndDate: ""
    });
    setIsEditing(false);
    setEditingDocId(null);
  };

  useEffect(() => {
    const fetchData = async (idNumber: string) => {
      try {
        const q = query(collection(db, "healthCertificates"), 
          where("idNumber", "==", idNumber));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert("لا يوجد بيانات مسجلة بهذا الرقم");
          return;
        }

        const docData = querySnapshot.docs[0].data() as FormData;
        setEditingDocId(querySnapshot.docs[0].id);
        setFormData(docData);
        setIsEditing(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("حدث خطأ أثناء جلب البيانات");
      }
    };

    const idNumber = searchParams.get("id");
    if (idNumber) {
      fetchData(idNumber);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 py-4 px-6">
          <h1 className="text-xl font-bold text-white">نموذج الشهادة الصحية</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* معلومات الشهادة */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-800">رقم الشهادة:</span>
              <span className="font-mono text-lg">{formData.healthCertificateNumber}</span>
            </div>
            
            {/* حقول التواريخ الجديدة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ إصدار الشهادة</label>
                <input
                  type="date"
                  name="certificateIssueDate"
                  value={formData.certificateIssueDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتها الشهادة الصحية</label>
                <input
                  type="date"
                  name="healthCertificateIssueDate"
                  value={formData.healthCertificateIssueDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء البرنامج التثقيفي</label>
                <input
                  type="date"
                  name="programEndDate"
                  value={formData.programEndDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          {/* المعلومات الشخصية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الأمانة</label>
              <input
                type="text"
                name="amana"
                value={formData.amana}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البلدية</label>
              <input
                type="text"
                name="baladia"
                value={formData.baladia}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية/الإقامة *</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر الجنس</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الجنسية</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المهنة</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع البرنامج التثقيفي</label>
              <input
                type="text"
                name="programType"
                value={formData.programType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الرخصة</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنشأة *</label>
              <input
                type="text"
                name="establishmentName"
                value={formData.establishmentName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم المنشأة</label>
              <input
                type="text"
                name="establishmentNumber"
                value={formData.establishmentNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {/* <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium"
            >
              {isEditing ? "تحديث البيانات" : "حفظ البيانات"}
            </button>

            {isEditing && (
              <button
                type="button"
                // onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium"
              >
                نموذج جديد
              </button>
            )} */}

            
              <button
                type="button"
                className="w- bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
              >
                العودة للرئيسية
              </button>
            
          </div>
        </form>
      </div>
    </div>
  );
}