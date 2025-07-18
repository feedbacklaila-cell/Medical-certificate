"use client";
import { Tajawal } from "next/font/google";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";


import { Noto_Serif } from "next/font/google";

export const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});


export const MondoArabic = Noto_Serif({
   subsets: ["latin"],
  weight: ["400"],
  display: "swap"
});


const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "700"],
  display: "swap",
});
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
}

function toHijriDateFormatted(gregorianDateStr: string) {
  // التحقق من صحة السلسلة التاريخية
  if (!gregorianDateStr) return '';
  
  const date = new Date(gregorianDateStr);
  
  // التحقق من صحة كائن التاريخ
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-SA-u-ca-islamic', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  let formatted = formatter.format(date);

  // تنظيف شامل لأي حروف غير رقمية أو فاصلة أو شرطة
  formatted = formatted
    .replace(/\u200f/g, '')         // remove RTL marker
    .replace(/\s?AH/, '')           // remove "AH"
    .replace(/[^\d/.-]/g, '');      // ← remove anything that's not number, slash, dot, or dash

  return convertArabicNumbersToEnglish(formatted);
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
  } = data;


const getTitleClass = () => `${tajawal.className}  font-medium text-base text-[12px] text-right text-[#2b3d77]`;
const getTitleClassf = () => `${tajawal.className}  font-medium text-base text-[12px] text-right text-[#fff]`;

 
 const getValueClass = () =>
  `${MondoArabic.className} font-medium text-base text-[12px] text-right text-[#fff]`;
  
  // الدالة الجديدة للإنجليزية
  const getValueClass1 = () => "font-normal text-[12px] text-[#2b3d77] text-right font-noto-serif";
  return (
    <div className="">
      <style jsx>{`
        body {
          margin: 0;
          font-family: "Arial", sans-serif;
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
        .report-title h1 {
          font-size: 14px;
          color: #2B3D77;
          margin-bottom: 10px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .report-title h2 {
          color: #366ED5;
          font-size: 14px;
          font-family: 'UntypeMondoNews', Georgia, serif;
          font-weight: 700;
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
          box-shadow: 0 0 0 1px #CCCCCC;
          margin-bottom: 5px;
          transform: scaleX(1.0);
        }
        .medical-table th, 
        .medical-table td {
          padding: 12px 8px;
          vertical-align: middle;
          height: 48px;
          box-sizing: border-box;
          border: 1px solid #CCCCCC;
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
        .medical-table tr:first-child th:first-child {
          border-top-right-radius: 8px;
        }
        .medical-table tr:first-child th:last-child {
          border-top-left-radius: 8px;
        }
        .medical-table tr:last-child td:first-child {
          border-bottom-right-radius: 8px;
        }
        .medical-table tr:last-child td:last-child {
          border-bottom-left-radius: 8px;
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
          background-color: #CCCCCC;
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
          font-weight: bold;
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
        <div className="absolute top-10 left-10">
          <img src="/logo.png" alt="logo" className="w-[135px] h-[60px]" />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[0px] z-50">
          <img src="/m3.png" alt="m3" className="w-[160px] h-[260px] object-contain" />
        </div>
        <div className="absolute top-10 right-10">
          <img src="/m5.png" alt="m5" className="w-[220px] h-[110px]" />
        </div>
      </div>

      <div className="translate-y-[95px]">
        <div className="p-6">
          <table className="medical-table border-collapse border border-gray-400 w-full text-right" dir="rtl">
            <tbody>
              <tr>
                          <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s1.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "60px", height: "15px" }} />
</th>
                <td className={getValueClass()} colSpan={2}>{leaveCode}</td>
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
    <span className={getValueClass()}>
      {convertArabicNumbersToEnglish(`${leaveDurationDays}`)}
    </span>
    <span className={getTitleClassf()}> يوم (</span>
    <span className={getValueClass()}>
      {convertArabicNumbersToEnglish(toHijriDateFormatted(leaveStartGregorian))}
    </span>
    <span className={getTitleClassf()}> الى </span>
    <span className={getValueClass()}>
      {convertArabicNumbersToEnglish(toHijriDateFormatted(leaveEndGregorian))}
    </span>
    <span className={getTitleClassf()}>)</span>
  </>
</td>
                <td className={getValueClass()}>
                  {`Days ${leaveDurationDays} (${leaveStartGregorian} to ${leaveEndGregorian})`}
                </td>
                       <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e2.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "90px", height: "14px" }} />
</th>
              </tr>
              <tr>
                                  <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s3.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "80px", height: "15px" }} />
</th>
                <td className={getValueClass()} dir="ltr">{toHijriDateFormatted(leaveStartGregorian)}</td>
                <td className={getValueClass()}>{leaveStartGregorian}</td>
                <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e3.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "12px" }} />
</th>
              </tr>
              <tr>
                                          <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/ss4.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "140px", height: "15px" }} />
</th>
                <td className={getValueClass()} dir="ltr">{toHijriDateFormatted(leaveEndGregorian)}</td>
                <td className={getValueClass()}>{leaveEndGregorian}</td>
                         <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/e4.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "210px", height: "15px" }} />
</th>
              </tr>
              <tr>
                                                       <th className={getTitleClass()} style={{ textAlign: "center", verticalAlign: "middle" }}>
  <img src="/s5.png" alt="logo" style={{ display: "inline-block", verticalAlign: "middle", width: "125px", height: "17px" }} />
</th>
                <td className={getValueClass()} colSpan={2}>{reportDate}</td>
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
            <tr style={{ height: "75px" /* ← تحكم بارتفاع الصف من هنا */ }}>
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
        height: "45px", // ← تحكم بحجم الصورة هنا
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

        <div className="footer-container" style={{ marginTop: '-5px', paddingTop: '0' }}>
  <div className="vertical-line"></div>

  <div
    className="footer-left"
    style={{
      width: '100%',
      paddingRight: '100px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <img src="/qr.png" alt="m5" className="w-[100px] h-[100px]" />

    <div
      style={{
        fontFamily: "Cairo, sans-serif",
        fontSize: "12px",
        fontWeight: 300,
        marginBottom: '5px',
      }}
    >
      للتحقق من بيانات التقرير يرجى التأكد من زيارة موقع منصة صحة الرسمي
    </div>

    <div
      style={{
        fontSize: '12px',
        marginBottom: '5px',
        fontFamily: 'MondoArabic',
      }}
    >
      To check the report please visit Sehas official website
    </div>

    <div className="footer-text">
      <a
        href="https://seha-as-com-qj61.vercel.app/verify-leave"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'blue',
          textDecoration: 'underline',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        www.seha.sa/#/inquiries/lenguiry
      </a>
    </div>
  </div>

  <div
    className="footer-right"
    style={{
      width: "150%",
      paddingLeft: "115px",
    }}
  >
    <img src="/m8.png" alt="logo" className="w-[100px] h-[90px] block mx-auto" />

    <div className="text-center font-[400] text-[14px] font-[Cairo,sans-serif] mt-1">
      {hospital}
    </div>

    <div className="text-center font-[400] text-[14px] font-[Cairo,sans-serif]">
      {hospitalEn}
    </div>
  </div>
</div>
 <div className="absolute" style={{ right: '50px', }}>
  <img src="/sh1.png" alt="m5" className="w-[150] h-[80]" />
</div>
  {timeDisplay && (
          <div className="text-xs font-bold font-sans">
            {timeDisplay}
          </div>
        )}
 <div
  style={{
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  }}
>
  {
    leaveEndGregorian && !isNaN(new Date(leaveEndGregorian).getTime())
      ? new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(leaveEndGregorian))
      : 'Invalid date'
  }
</div>
      </div>
    </div>
  );
}