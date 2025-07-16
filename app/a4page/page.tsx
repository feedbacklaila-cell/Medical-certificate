"use client";
import { useEffect, useState } from "react";
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
  leaveDurationDays: number;
}

export default function A4Page() {
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
    leaveDurationDays,
  } = data;
  function toHijriDateFormatted(gregorianDateStr: string) {
    const date = new Date(gregorianDateStr);
    const formatter = new Intl.DateTimeFormat('en-SA-u-ca-islamic', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    let formatted = formatter.format(date);
    formatted = formatted
      .replace(/\u200f/g, '')
      .replace(/\s?AH/, '');

    return convertArabicNumbersToEnglish(formatted);
  }

  function convertArabicNumbersToEnglish(str: string) {
    return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  }

  const getTitleClass = () => "font-[700] text-[14px] font-[MondoArabic] text-right";
  const getValueClass = () => "font-[400] text-[12px] font-[Arial] text-right";

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
          width: 65%;
        }
        .merged-columns {
          width: 130% !important;
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
          padding-right: 17px;
        }
        .footer-right {
          text-align: left;
          flex: 1;
          padding-left: 17px;
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
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[-5px] z-50">
          <img src="/m3.png" alt="m3" className="w-[160px] h-[260px] object-contain" />
        </div>
        <div className="absolute top-10 right-10">
          <img src="/m5.png" alt="m5" className="w-[220px] h-[110px]" />
        </div>
      </div>

      <div className="translate-y-[85px]">
        <div className="p-6">
          <table className="medical-table border-collapse border border-gray-400 w-full text-right" dir="rtl">
            <tbody>
              <tr>
                <th className={getTitleClass()}>رمز الإجازة</th>
                <td className={getValueClass()} colSpan={2}>{leaveCode}</td>
                <th className={getTitleClass()}>Leave ID</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>
                  <img src="/s2.png" alt="logo" className="w-[50px] h-[15px]" />
                </th>
                <td className={getValueClass()}>
                  {convertArabicNumbersToEnglish(
                    `${leaveDurationDays} يوم (${toHijriDateFormatted(leaveStartGregorian)} الى ${toHijriDateFormatted(leaveEndGregorian)})`
                  )}
                </td>
                <td className={getValueClass()}>
                  {`Days ${leaveDurationDays} (${leaveStartGregorian} to ${leaveEndGregorian})`}
                </td>
                <th className={getTitleClass()}>Leave Duration</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>تاريخ الدخول</th>
                <td className={getValueClass()} dir="ltr">{toHijriDateFormatted(leaveStartGregorian)}</td>
                <td className={getValueClass()}>{leaveStartGregorian}</td>
                <th className={getTitleClass()}>Admission Date</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>تاريخ الخروج</th>
                <td className={getValueClass()} dir="ltr">{toHijriDateFormatted(leaveEndGregorian)}</td>
                <td className={getValueClass()}>{leaveEndGregorian}</td>
                <th className={getTitleClass()}>Discharge Date</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>تاريخ إصدار التقرير</th>
                <td className={getValueClass()} colSpan={2}>{reportDate}</td>
                <th className={getTitleClass()}>Issue Date</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>الاسم</th>
                <td className={getValueClass()}>{name}</td>
                <td className={getValueClass()}>{nameEn}</td>
                <th className={getTitleClass()}>Name</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>رقم الهوية الإقامة</th>
                <td className={getValueClass()} colSpan={2}>{idNumber}</td>
                <th className={getTitleClass()}>National ID / Iqama</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>الجنسية</th>
                <td className={getValueClass()}>{nationality}</td>
                <td className={getValueClass()}>{nationalityEn}</td>
                <th className={getTitleClass()}>Nationality</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>جهة العمل</th>
                <td className={getValueClass()}>{workPlaceEn}</td>
                <td className={getValueClass()}>{workPlace}</td>
                <th className={getTitleClass()}>Employer</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>اسم الطبيب</th>
                <td className={getValueClass()}>{doctorName}</td>
                <td className={getValueClass()}>{doctorNameEn}</td>
                <th className={getTitleClass()}>Physician Name</th>
              </tr>
              <tr>
                <th className={getTitleClass()}>المعالج</th>
                <td className={getValueClass()}>{jobTitleEn}</td>
                <td className={getValueClass()}>{jobTitle}</td>
                <th className={getTitleClass()}>Position</th>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="footer-container" style={{ marginTop: '-5px', paddingTop: '0' }}>
          <div className="vertical-line"></div>

          <div className="footer-left" style={{ width: '100%', paddingRight: '100px', textAlign: 'right' }}>
            <div className="footer-title">التحقق من البيانات</div>
            <div className="footer-text">يرجى التأكد من زيارة موقع منصة صحة الرسمي</div>
            <div className="footer-text">
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'blue', textDecoration: 'underline' }}
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
              display: "flex",
              flexDirection: "column",
            }}
          >
            <img src="/m8.png" alt="logo" className="w-[100px] h-[90px]" />
            <div className="dually" style={{ fontFamily: "Cairo, sans-serif", fontSize: "14px", fontWeight: 400 }}>
              {hospital}
            </div>
            <div className="dually" style={{ fontFamily: "Cairo, sans-serif", fontSize: "14px", fontWeight: 400 }}>
              {hospitalEn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
