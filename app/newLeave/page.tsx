'use client';

import { Suspense } from 'react';
import HealthCertificateForm from './HealthCertificateForm';

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