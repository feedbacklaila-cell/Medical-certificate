"use client";

import { useState, useEffect,} from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

type EducationalProgram = {
  id?: string;
  programType: string;
  endDate: string;
  createdAt: string;
};

export default function EducationalProgramsPage() {
  const [formData, setFormData] = useState<Omit<EducationalProgram, 'createdAt'>>({
    programType: "",
    endDate: "",
  });

  const [programsList, setProgramsList] = useState<EducationalProgram[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.programType || !formData.endDate) {
      alert("الرجاء إدخال نوع البرنامج وتاريخ الانتهاء");
      setLoading(false);
      return;
    }

    try {
      // Check if program already exists with same type and end date
      const programQuery = query(
        collection(db, "educationalPrograms"),
        where("programType", "==", formData.programType),
        where("endDate", "==", formData.endDate)
      );
      const snapshot = await getDocs(programQuery);

      if (!snapshot.empty) {
        alert("هذا البرنامج مسجل مسبقاً بنفس التاريخ");
        setLoading(false);
        return;
      }

      // Add new program to Firestore
      await addDoc(collection(db, "educationalPrograms"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      alert("تم حفظ البيانات بنجاح");
      resetForm();
      fetchPrograms(); // Refresh the list
    } catch (error) {
      console.error("حدث خطأ أثناء الحفظ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      programType: "",
      endDate: "",
    });
  };

  const fetchPrograms = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "educationalPrograms"));
      const data: EducationalProgram[] = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          programType: docData.programType || "",
          endDate: docData.endDate || "",
          createdAt: docData.createdAt || "",
        };
      });
      setProgramsList(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-blue-600 py-4 px-6">
            <h1 className="text-xl font-bold text-white">إدارة البرامج التثقيفية</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع البرنامج التثقيفي *
                </label>
                <input
                  type="text"
                  name="programType"
                  value={formData.programType}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ انتهاء البرنامج *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
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

              <Link href="/Medical" passHref>
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
            <h2 className="text-lg font-bold text-white">قائمة البرامج التثقيفية</h2>
          </div>

          <div className="p-6">
            {programsList.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد برامج مسجلة بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع البرنامج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الانتهاء
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {programsList.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.programType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.endDate).toLocaleDateString()}
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