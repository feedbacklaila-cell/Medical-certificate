"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

type MedicalCertificate = {
  id?: string;
  fullName: string;
  idNumber: string;
  gender: string;
  nationality: string;
  profession: string;
  imageUrl: string;
  createdAt: string;
};

export default function MedicalCertificatePage() {
  const [formData, setFormData] = useState<Omit<MedicalCertificate, 'createdAt'>>({
    fullName: "",
    idNumber: "",
    gender: "",
    nationality: "",
    profession: "",
    imageUrl: "",
  });

  const [certificatesList, setCertificatesList] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // عرض معاينة الصورة
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // رفع الصورة إلى Cloudinary
    // setLoading(true);
    // try {
    //   const formData = new FormData();
    //   formData.append('file', file);
    //   formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    //   const response = await fetch(
    //     `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    //     {
    //       method: 'POST',
    //       body: formData,
    //     }
    //   );

    //   const data = await response.json();
    //   setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
    // } catch (error) {
    //   console.error("Error uploading image:", error);
    //   alert("حدث خطأ أثناء رفع الصورة");
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.fullName || !formData.idNumber || !formData.gender) {
      alert("الرجاء إدخال الحقول المطلوبة (الاسم، رقم الهوية، الجنس)");
      setLoading(false);
      return;
    }

    try {
      // Check if certificate already exists with same ID number
      const certificateQuery = query(
        collection(db, "medicalCertificates"),
        where("idNumber", "==", formData.idNumber)
      );
      const snapshot = await getDocs(certificateQuery);

      if (!snapshot.empty) {
        alert("هذا الرقم مسجل مسبقاً");
        setLoading(false);
        return;
      }

      // Add new certificate to Firestore
      await addDoc(collection(db, "medicalCertificates"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      alert("تم حفظ البيانات بنجاح");
      resetForm();
      fetchCertificates(); // Refresh the list
    } catch (error) {
      console.error("حدث خطأ أثناء الحفظ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      idNumber: "",
      gender: "",
      nationality: "",
      profession: "",
      imageUrl: "",
    });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fetchCertificates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "medicalCertificates"));
      const data: MedicalCertificate[] = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          fullName: docData.fullName || "",
          idNumber: docData.idNumber || "",
          gender: docData.gender || "",
          nationality: docData.nationality || "",
          profession: docData.profession || "",
          imageUrl: docData.imageUrl || "",
          createdAt: docData.createdAt || "",
        };
      });
      setCertificatesList(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-blue-600 py-4 px-6">
            <h1 className="text-xl font-bold text-white">إدارة الشهادات الطبية</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهوية/الإقامة *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الجنس *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">اختر الجنس</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الجنسية
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المهنة
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  صورة الشهادة الطبية *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">معاينة الصورة:</p>
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة" 
                      className="h-40 object-cover rounded-md border border-gray-200"
                    />
                  </div>
                )}

                {formData.imageUrl && !imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">الصورة المحفوظة:</p>
                    <img 
                      src={formData.imageUrl} 
                      alt="الصورة المحفوظة" 
                      className="h-40 object-cover rounded-md border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-white ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "جاري الحفظ..." : "حفظ البيانات"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium"
              >
                مسح النموذج
              </button>

              <Link href="/" passHref>
                <button
                  type="button"
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-md font-medium"
                >
                  العودة للرئيسية
                </button>
              </Link>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 py-4 px-6">
            <h2 className="text-lg font-bold text-white">قائمة الشهادات الطبية</h2>
          </div>

          <div className="p-6">
            {certificatesList.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد شهادات مسجلة بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الاسم الكامل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الهوية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الجنس
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الجنسية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الصورة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certificatesList.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.idNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.nationality}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={`صورة ${item.fullName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">لا يوجد صورة</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}