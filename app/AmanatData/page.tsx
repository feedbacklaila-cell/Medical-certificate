"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

type AmanatData = {
    id?: string;
  amanaName: string;
  baladiaName: string;
  imageUrl: string;
  createdAt: string;
};

export default function AmanatPage() {
  const [formData, setFormData] = useState<Omit<AmanatData, 'createdAt'>>({
    amanaName: "",
    baladiaName: "",
    imageUrl: "",
  });

  const [amanatList, setAmanatList] = useState<AmanatData[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.amanaName || !formData.baladiaName) {
      alert("الرجاء إدخال اسم الأمانة والبلدية");
      setLoading(false);
      return;
    }

    try {
      // Check if amana already exists
      const amanaQuery = query(
        collection(db, "amanat"),
        where("amanaName", "==", formData.amanaName),
        where("baladiaName", "==", formData.baladiaName)
      );
      const snapshot = await getDocs(amanaQuery);

      if (!snapshot.empty) {
        alert("هذه الأمانة والبلدية مسجلة مسبقاً");
        setLoading(false);
        return;
      }

      // Add new amana to Firestore
      await addDoc(collection(db, "amanat"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      alert("تم حفظ البيانات بنجاح");
      resetForm();
      fetchAmanat(); // Refresh the list
    } catch (error) {
      console.error("حدث خطأ أثناء الحفظ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amanaName: "",
      baladiaName: "",
      imageUrl: "",
    });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fetchAmanat = async () => {
    try {
  const querySnapshot = await getDocs(collection(db, "amanat"));
const data: AmanatData[] = querySnapshot.docs.map(doc => {
  const docData = doc.data();
  return {
    id: doc.id,
    amanaName: docData.amanaName || "",
    baladiaName: docData.baladiaName || "",
    imageUrl: docData.imageUrl || "",
    createdAt: docData.createdAt || "",
  };
});
setAmanatList(data);


    } catch (error) {
      console.error("Error fetching amanat:", error);
    }
  };

  useEffect(() => {
    fetchAmanat();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-blue-600 py-4 px-6">
            <h1 className="text-xl font-bold text-white">إدارة الأمانات والبلديات</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الأمانة *
                </label>
                <input
                  type="text"
                  name="amanaName"
                  value={formData.amanaName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم البلدية *
                </label>
                <input
                  type="text"
                  name="baladiaName"
                  value={formData.baladiaName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  صورة المنطقه (اختياري)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
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
            <h2 className="text-lg font-bold text-white">قائمة الأمانات والبلديات</h2>
          </div>

          <div className="p-6">
            {amanatList.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد أمانات مسجلة بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الصورة
                      </th> */}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اسم الأمانة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اسم البلدية
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {amanatList.map((item, index) => (
                      <tr key={index}>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={`صورة ${item.amanaName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">لا يوجد صورة</span>
                            </div>
                          )}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.amanaName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.baladiaName}
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