"use client";

import { useState, useEffect, Suspense } from "react";
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

function HealthCertificateForm() {
  const searchParams = useSearchParams();
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
  const [isLoading, setIsLoading] = useState(true);

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

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data() as FormData;
          setEditingDocId(querySnapshot.docs[0].id);
          setFormData(docData);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("حدث خطأ أثناء جلب البيانات");
      } finally {
        setIsLoading(false);
      }
    };

    const idNumber = searchParams.get("id");
    if (idNumber) {
      fetchData(idNumber);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 py-4 px-6">
          <h1 className="text-xl font-bold text-white">نموذج الشهادة الصحية</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ... (نفس محتوى النموذج السابق) ... */}
        </form>
      </div>
    </div>
  );
}

export default function NewLeavePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-xl font-semibold text-blue-600">
              جاري تحميل بيانات النموذج، الرجاء الانتظار...
            </p>
          </div>
        </div>
      }>
        <HealthCertificateForm />
      </Suspense>
    </div>
  );
}