"use client";

import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

type Establishment = {
  id?: string;
  licenseNumber: string;
  establishmentName: string;
  establishmentNumber: string;
  createdAt: string;
};

export default function EstablishmentsPage() {
  const [formData, setFormData] = useState<Omit<Establishment, 'createdAt'>>({
    licenseNumber: "",
    establishmentName: "",
    establishmentNumber: "",
  });

  const [establishmentsList, setEstablishmentsList] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.licenseNumber || !formData.establishmentName || !formData.establishmentNumber) {
      alert("الرجاء إدخال جميع البيانات المطلوبة");
      setLoading(false);
      return;
    }

    try {
      // التحقق من عدم تكرار رقم الرخصة
      const licenseQuery = query(
        collection(db, "establishments"),
        where("licenseNumber", "==", formData.licenseNumber)
      );
      const snapshot = await getDocs(licenseQuery);

      if (!snapshot.empty) {
        alert("هذا رقم الرخصة مسجل مسبقاً");
        setLoading(false);
        return;
      }

      // إضافة المنشأة إلى Firestore
      await addDoc(collection(db, "establishments"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      alert("تم حفظ البيانات بنجاح");
      resetForm();
      fetchEstablishments();
    } catch (error) {
      console.error("حدث خطأ أثناء الحفظ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      licenseNumber: "",
      establishmentName: "",
      establishmentNumber: "",
    });
  };

  const fetchEstablishments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "establishments"));
      const data: Establishment[] = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          licenseNumber: docData.licenseNumber || "",
          establishmentName: docData.establishmentName || "",
          establishmentNumber: docData.establishmentNumber || "",
          createdAt: docData.createdAt || "",
        };
      });
      setEstablishmentsList(data);
    } catch (error) {
      console.error("Error fetching establishments:", error);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-blue-600 py-4 px-6">
            <h1 className="text-xl font-bold text-white">إدارة المنشآت</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الرخصة *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المنشأة *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم المنشأة *
                </label>
                <input
                  type="text"
                  name="establishmentNumber"
                  value={formData.establishmentNumber}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
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
            <h2 className="text-lg font-bold text-white">قائمة المنشآت المسجلة</h2>
          </div>

          <div className="p-6">
            {establishmentsList.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد منشآت مسجلة بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الرخصة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اسم المنشأة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم المنشأة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {establishmentsList.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.licenseNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.establishmentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.establishmentNumber}
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