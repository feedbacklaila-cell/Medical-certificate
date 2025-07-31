"use client";
import { toHijri } from 'hijri-converter';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

interface LeaveData {
  leaveCode: string;
  leaveStartGregorian: string;
  leaveEndGregorian: string;
  reportDate: string;
  name: string;
  nameEn: string;
  idNumber: string;
  nationality: string;
  nationalityEn: string;
  workPlace: string;
  workPlaceEn: string;
  doctorName: string;
  doctorNameEn: string;
  jobTitle: string;
  jobTitleEn: string;
  hospital: string;
  hospitalEn: string;
  timeDisplay: string;
  leaveDurationDays: number;
  licenseNumber: string;
}

function toHijriDateFormatted(gregorianDateStr: string): string {
  if (!gregorianDateStr) return '';
  
  try {
    const date = new Date(gregorianDateStr);
    if (isNaN(date.getTime())) return '';

    // تحويل التاريخ الميلادي إلى هجري
    const hijriDate = toHijri(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );

    const day = hijriDate.hd.toString().padStart(2, '0');
    const month = hijriDate.hm.toString().padStart(2, '0');
    const year = hijriDate.hy.toString();

    return `${day}-${month}-${year}`; // ✅ أصبحت "DD-MM-YYYY" (هجري)
  } catch (error) {
    console.error('Error converting to Hijri date:', error);
    return '';
  }
}




// للصيغة القديمة DD-MM-YYYY (للعنصر الثاني)
function toHijriDateFormattedOld(gregorianDateStr: string): string {
  if (!gregorianDateStr) return '';
  try {
    const date = new Date(gregorianDateStr);
    if (isNaN(date.getTime())) return '';

    const hijriDate = toHijri(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );

   const day = hijriDate.hd.toString().padStart(2, '0');
    const month = hijriDate.hm.toString().padStart(2, '0');
    const year = hijriDate.hy.toString();

    return `${year}-${month}-${day}`; // الآن يعيد "YYYY-MM-DD"
  } catch (error) {
    console.error('Error converting to Hijri date:', error);
    return '';
  }
}

function convertArabicNumbersToEnglish(str: string) {
  if (!str) return '';
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}


export default function A4Page() {
  return (
    <Suspense fallback={<div className="p-4">جاري تحميل البيانات...</div>}>
      <A4PageContent />
    </Suspense>
  );
}

function A4PageContent() {
  const searchParams = useSearchParams();
  const leaveCodeget = searchParams.get("leaveCode");

  const [data, setData] = useState<LeaveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let q;
        if (leaveCodeget) {
          q = query(collection(db, "users"), where("leaveCode", "==", leaveCodeget));
        } else {
          q = query(collection(db, "users"), orderBy("reportDate", "desc"), limit(1));
        }

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data() as LeaveData;
          setData(docData);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [leaveCodeget]);

  if (loading) return <div className="p-4">جاري تحميل البيانات...</div>;
  if (!data) return <div className="p-4">لا توجد بيانات لعرضها</div>;

  const {
    leaveCode,
    leaveStartGregorian,
    leaveEndGregorian,
    reportDate,
    name,
    nameEn,
    idNumber,
    nationality,
    nationalityEn,
    workPlace,
    workPlaceEn,
    doctorName,
    doctorNameEn,
    jobTitle,
    jobTitleEn,
    hospital,
    hospitalEn,
    timeDisplay,
    leaveDurationDays,
    licenseNumber,
  } = data;

const getTitleClass = () =>
  `font-tajawal font-medium font-light text-base text-[14px] text-right text-[#2b3d77]`;


const getTitleClassff = () =>
  `font-tajawal font-medium font-light text-base text-[12px] text-right text-[#fff]`;
const getValueClass = () =>
  `font-notoserif font-medium text-base text-[12px] text-right text-[#fff]`;
const getValueClassF = () =>
  `font-notoserif font-medium text-base text-[12px] text-right `;
  return (
    <div className="">
      <style jsx global>{`
        /* تعريف خطوط جديدة */
              @font-face {
  font-family: 'Tajawal';
  src: url('/fonts/Tajawal-Regular.woff2') format('woff2');
  font-weight: 400; /* وزن خفيف */
  font-style: normal;
  font-display: swap;
}
 
        @font-face {
          font-family: 'NotoSerif';
          src: url('/fonts/NotoSerif-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Cairo';
          src: url('/fonts/Cairo-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        /* تطبيق الخطوط على العناصر */
        body {
          margin: 0;
          font-family: 'Tajawal', 'NotoSerif', 'Cairo', Arial, sans-serif;
          background-color: #fff;
        }
        
        .font-tajawal {
          font-family: 'Tajawal', Cairo, sans-serif !important;
        }
        
        .font-notoserif {
          font-family: 'NotoSerif', Times, serif !important;
        }
        
        .font-cairo {
          font-family: 'Cairo', Arial, sans-serif !important;
        }
      `}</style>
      
      <style jsx>{`
        body {
          margin: 0;
          background-color: #fff;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #2B3D77;
        }
        .header-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
        }
        .logo-left {
          margin-right: auto;
        }
        .logo-center {
          margin: 0 auto;
        }
        .logo-right {
          margin-left: auto;
        }
        .report-title {
          text-align: center;
          margin: 25px 0;
        }
      
        .report-title h2 {
          color: #366ED5;
          font-size: 14px;
          font-weight: 400;
          font-style: italic;
        }

        
        .medical-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
          font-size: 14px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 0 1px solid rgba(204, 204, 204, 0.5) !important;
            border-left: 1px solid rgba(204, 204, 204, 0.5);
  border-right: 1px solid rgba(204, 204, 204, 0.5);
   border-top: 1px solid rgba(204, 204, 204, 0.5);
  border-bottom: 1px solid rgba(204, 204, 204, 0.5);
          margin-bottom: 5px;
          transform: scaleX(1.0);
        }
        .medical-table th, 
        .medical-table td {
          padding: 10px 8px;
          vertical-align: middle;
          height: 30px;
          box-sizing: border-box;
          border: 1px solid rgba(204, 204, 204, 0.5) !important;
          text-align: center;
        }
        .medical-table th {
          font-weight: bold;
          width: 20%;
          color: #366EB5;
        }
        .medical-table td:nth-child(2),
        .medical-table td:nth-child(3) {
          color: #2B3D77;
        }
        .medical-table th:nth-child(4) {
          color: #366ED5;
          font-weight: normal;
        }
        .medical-table tr:nth-child(2) {
          background-color: #2B3D77 !important;
        }
        .medical-table tr:nth-child(2) th,
        .medical-table tr:nth-child(2) td {
          color: #FFFFFF !important;
          font-weight: normal;
        }
        .medical-table tr:nth-child(odd) {
          background-color: #FFFFFF;
        }
        .medical-table tr:nth-child(even):not(:nth-child(2)) {
          background-color: #F7F7F7;
        }
   
        .medical-table td {
          width: 50%;
        }
        .merged-columns {
          width: 100% !important;
        }
        .footer-container {
          width: 100%;
          display: flex;
          position: relative;
          padding-top: 40px;
          padding-bottom: 40px;
        }
        .vertical-line {
          position: absolute;
          top: 0; 
          bottom: 0;
          left: 50%; 
          width: 2px;
           background-color: rgba(204, 204, 204, 0.4);
           height: 80%; 
        }
        .footer-left {
          text-align: right;
          flex: 1;
          padding-right: 20px;
        }
        .footer-right {
          text-align: left;
          flex: 1;
          padding-left: 20px;
        }
        .footer-text {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          line-height: 1.5;
        }
        .footer-title {
          font-weight: 300;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .date-time {
          position: absolute;
          bottom: 0;
          left: 80%;
          transform: translateX(-50%);
          text-align: center;
          font-size: 12px;
          color: #666;
          width: 200px;
          margin-left: 10px;
        }
      `}</style>

      <div className="relative w-full h-[85px]">
        <div className="absolute  left-10 top-10" >
          <img src="/logo.png" alt="logo" className="w-[135px] h-[60px]" />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 top-4 z-50">
          <img src="/m3.png" alt="m3" className="w-[160px] h-[260px] object-contain" />
        </div>
        <div className="absolute  right-10 top-10">
          <img src="/m5.png" alt="m5" className="w-[220px] h-[110px]" />
        </div>
      </div>

      <div className="translate-y-[110px]">
        <div className="p-6">
          <table className="medical-table border-collapse border border-gray-400 w-full text-right" dir="rtl">
            <tbody>
              <tr>
                          <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s1.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "60px", height: "15px" }} />
</th>
                <td className={getValueClassF()} colSpan={2}>{leaveCode}</td>
                <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e1.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "60px", height: "15px" }} />
</th>
              </tr>
              <tr>
                <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s2.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "65px", height: "16px" }} />
</th>
              <td className="text-right">
  <>
    <span className={getValueClassF()}>
      {convertArabicNumbersToEnglish(`${leaveDurationDays}`)}
    </span>
    <span className={getTitleClassff()}> يوم </span>
    <span className={getValueClassF()} style={{ whiteSpace: 'nowrap' }}>
      (
      {toHijriDateFormattedOld(leaveStartGregorian)}
      <span className={getTitleClassff()}> الى </span>
      {convertArabicNumbersToEnglish(toHijriDateFormattedOld(leaveEndGregorian))}
      )
    </span>
  </>
</td>

<td className={getValueClassF()}>
  <span>
    (
    <span style={{ display: 'inline-flex', alignItems: 'center', margin: 0 }}>
        <span>{leaveEndGregorian ? leaveEndGregorian.split('-').reverse().join('-') : ''}</span>
      <span style={{ margin: '0 2px' }}>to</span>
    <span>{leaveStartGregorian ? leaveStartGregorian.split('-').reverse().join('-') : ''}</span>
    </span>
    )
  </span>
  {' '}
  <span className={getValueClassF()} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
    <span>day</span>
    <span>{leaveDurationDays}</span>
  </span>
</td>


                       <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e2.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "90px", height: "14px" }} />
</th>
              </tr>
              <tr>
                                  <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s3.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "80px", height: "15px" }} />
</th>
                <td className={getValueClassF()} dir="ltr">{toHijriDateFormatted(leaveStartGregorian)}</td>
                <td className={getValueClassF()}>
  {leaveStartGregorian ? leaveStartGregorian.split('-').reverse().join('-') : ''}
</td>
                 <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e3.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>
              </tr>
              <tr>
                                          <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/ss4.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "140px", height: "15px" }} />
</th>
                <td className={getValueClassF()} dir="ltr">{toHijriDateFormatted(leaveStartGregorian)}</td>
       <td className={getValueClassF()}>
  {leaveStartGregorian ? leaveStartGregorian.split('-').reverse().join('-') : ''}
</td>
                         <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e4.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>
              </tr>
              <tr>
                                                       <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s5.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "125px", height: "17px" }} />
</th>
                <td className={getValueClassF()} colSpan={2}>{reportDate ? reportDate.split('-').reverse().join('/') : ''}</td>
                     <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e5.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>              </tr>
              <tr>
                                      <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s6.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "140px", height: "17px" }} />
</th>               <td className={getTitleClass()}>{name}</td>
                <td className={getValueClass()}>{nameEn}</td>
                                    <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e6.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>
              </tr>
              <tr>
                                  <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s7.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "125px", height: "17px" }} />
</th>                   <td className={getValueClass()} colSpan={2}>{idNumber}</td>
                                    <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e7.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>
              </tr>
              <tr>
                                  <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s8.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "140px", height: "17px" }} />
</th>                   <td className={getTitleClass()}>{nationality}</td>
                <td className={getValueClass()}>{nationalityEn}</td>
                     <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e8.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>
              </tr>
              <tr>
                              <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s9.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "140px", height: "17px" }} />
</th>                   <td className={getTitleClass()}>{workPlace}</td>

                        <td className={getValueClass()}>{workPlaceEn}</td>
            
                     <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e9.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>              </tr>
            <tr style={{ height: "75px" }}>
  <th
    className={getTitleClass()}
    style={{
      textAlign: "center",
      verticalAlign: "middle",
      padding: 0,
    }}
  >
    <img
      src="/s10.png"
      alt="logo"
      style={{
        width: "140px",
        height: "45px",
        objectFit: "contain",
        display: "block",
        margin: "0 auto",
      }}
    />
  </th>

  <td className={getTitleClass()} style={{ verticalAlign: "middle" }}>
    {doctorName}
  </td>

  <td className={getValueClass()} style={{ verticalAlign: "middle" }}>
    {doctorNameEn}
  </td>

                     <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e11.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>
</tr>

              <tr>
                              <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s11.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "140px", height: "17px" }} />
</th>                 <td className={getTitleClass()}>{jobTitle}</td>

                      <td className={getValueClass()}>{jobTitleEn}</td>
                     <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e10.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>              </tr>
            </tbody>
          </table>
        </div>

      <div className="footer-container" style={{ marginTop: '-15px', paddingTop: '0' }}>
  <div className="vertical-line"></div>

  {/* كتلة الصورة والنص مزاحة لليمين */}
  <div
    className="flex flex-col items-center text-center"
    style={{ transform: 'translateX(50px)' }} // ← تحكم هنا بالانزياح
  >
    <img src="/qr.png" alt="m5" className="w-[100px] h-[100px]" />

<div
  style={{
    fontFamily: "Tajawal, sans-serif", // ← تم تغييره
    fontSize: "12px",
     fontWeight: 'bold',
    marginBottom: '5px',
    marginTop: '10px',
  }}
>
  للتحقق من بيانات التقرير يرجى التأكد من زيارة موقع منصة صحة
  <span style={{ display: 'block' }}>الرسمي</span>
</div>

<div
  style={{
    fontSize: '10px',
    marginBottom: '5px',
    fontWeight: 'bold',
    fontFamily: 'Noto Serif, serif', // ← تم تغييره
  }}
>
  To check the report please visit Sehas official website
</div>


    <div className="footer-text">
      <a
        href="https://www.saharatee.com/login"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'blue',
          textDecoration: 'underline',
          fontSize: '12px',
         fontWeight: 'bold',
    fontFamily: 'Noto Serif, serif', 
        }}
      >
        www.seha.sa/#/inquiries/lenguiry
      </a>
    </div>
  </div>





 <div
  className="absolute"
  style={{ left: '440px', transform: 'translateX(50px)' }}
>
  <img src="/m8.png" alt="logo" className="w-[90px] h-[90px] block mx-auto" />

  <div className="text-center font-[700] text-[14px] font-tajawal mt-5">
    {hospital}
  </div>

  <div className="text-center font-[700] text-[14px] font-tajawal mt-3">
    {hospitalEn}
  </div>
  <div className="text-center font-[700] text-[14px] font-tajawal ">
    {licenseNumber}
  </div>
</div>

</div >
 <div className="absolute" style={{ right: '40px', bottom: '-30px' }}>
  <img src="/sh1.png" alt="m5" className="w-[150] h-[80]" />
</div>
 {timeDisplay && (
 <div
  className="font-notoserif font-medium text-base text-[14px] text-right"
  style={{
    position: 'absolute',
    bottom: '25px',
    left: '25px',
    fontWeight: 'bold',
  }}
>
  {timeDisplay}
</div>

)}

<div
  className={getValueClassF()}
  style={{
    position: 'absolute',
    bottom: '4px',
    left: '25px',
    fontWeight: 'bold',
  }}
>
  {
    leaveEndGregorian && !isNaN(new Date(leaveEndGregorian).getTime())
      ? new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(reportDate))
      : 'Invalid date'
  }
</div>


      </div>
    </div>
  );
}