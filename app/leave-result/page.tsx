'use client';

import {
  collection,query, where, getDocs,doc, updateDoc,} from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig.js';

export default function LeaveResultPage() {
  const searchParams = useSearchParams();
  const leaveCode = searchParams.get('leaveCode');
  const idNumber = searchParams.get('idNumber');

  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');


  
  const [docId, setDocId] = useState('');
  const [saving, setSaving] = useState(false);

  seEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('leaveCode', '==', leaveCode),
          where('idNumber', '==', idNumber)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const document = querySnapshot.docs[0];
          setUserData(document.data());
          setDocId(document.id); // نحتاج هذا ID للتحديث
        } else {
          setError('لم يتم العثور على بيانات مطابقة.');
        }
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات.');
      }
    };

    if (leaveCode && idNumber) {
      fetchData();
    }
  }, [leaveCode, idNumber]);

  const handleChange = (key: string, value: string) => {
    setUserData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('leaveCode', '==', leaveCode),
          where('idNumber', '==', idNumber)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        } else {
          setError('لم يتم العثور على بيانات مطابقة.');
        }
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات.');
      }
    };

    if (leaveCode && idNumber) {
      fetchData();
    }
  }, [leaveCode, idNumber]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <div className="text-center text-red-700 font-bold text-xl">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">بيانات الإجازة</h2>
        {Object.entries(userData).map(([key, value]) => (
          <div key={key} className="text-lg">
            <strong className="text-gray-700">{key}:</strong> <span className="text-gray-900">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
