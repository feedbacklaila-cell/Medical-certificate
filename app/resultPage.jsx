"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const leaveCode = searchParams.get("leaveCode");
  const idNumber = searchParams.get("idNumber");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const q = query(
        collection(db, "users"),
        where("leaveCode", "==", leaveCode),
        where("idNumber", "==", idNumber)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUserData(querySnapshot.docs[0].data());
      }
    };
    fetchUserData();
  }, [leaveCode, idNumber]);

  if (!userData) {
    return <div className="text-center mt-20">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-200 flex flex-col items-center justify-start p-10 space-y-4">
      <h1 className="text-3xl font-bold text-green-700 mb-8">بيانات المستخدم</h1>

      {Object.entries(userData).map(([key, value]) => (
        <div
          key={key}
          className="w-full max-w-2xl bg-white rounded-lg shadow p-4 text-gray-700 text-lg"
        >
          <strong className="block text-purple-700 mb-1">{key}:</strong> {value}
        </div>
      ))}
    </div>
  );
}
