"use client";

import { useCallback,useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, Pencil, Trash2, Printer, Search } from "lucide-react";
import { FaUserMd, FaCalendarPlus, FaFileAlt,FaStethoscope,FaUserFriends, FaClipboardCheck,FaHospital,} from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";


export default function HomePage() {

   type User = {
  name?: string;
  idNumber?: string;
  leaveCode?: string;
};
  const [open, setOpen] = useState(false);
const [users, setUsers] = useState<User[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
 const sidebarRef = useRef(null);
 

 const actions = [
  {
    title: "إضافة طبيب",
   
    icon: <FaUserMd className="text-blue-600 text-3xl" />,
    path: "/adddoctor",
  },
  {
    title: "إجازة جديدة",
    
    icon: <FaCalendarPlus className="text-blue-600 text-3xl" />,
    path: "/newLeave",
  },
  {
    title: "تقرير",
    icon: <FaFileAlt className="text-blue-600 text-3xl" />,
    path: "/a4page",
  },
  {
    title: "إضافة مستشفى",
    icon: <FaHospital className="text-blue-600 text-3xl" />,
    path: "/addHospitalPage",
  },
  {
    title: "تقرير طبي",
  
    icon: <FaStethoscope className="text-blue-600 text-3xl" />,
    path: "/medicalreport",
  },
  {
    title: "مرافق مريض",
   
    icon: <FaUserFriends className="text-blue-600 text-3xl" />,
    path: "/companion",
  },
  {
    title: "مشهد مراجعة",
    icon: <FaClipboardCheck className="text-blue-600 text-3xl" />,
    path: "/reviewnote",
  },
];

 const fetchUsers = useCallback(async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    
const data = snapshot.docs.map((doc) => doc.data() as User);

    setUsers(data); 
  } catch (error) {
    console.error("حدث خطأ أثناء جلب المستخدمين:", error);
  }
}, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) =>
    user.name?.includes(searchQuery) || user.idNumber?.includes(searchQuery)
  );



    useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* Header */}
      <header className="mx-4 mt-4 rounded-xl flex items-center justify-between bg-white px-6 py-4 shadow-md">
        <div className="flex items-center space-x-2">
          <img src="/m11.png" alt="logo" style={{ width: "70px", height: "60px" }} />
        </div>
        <button
          className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar */}
      {open && (
        <div
          ref={sidebarRef}
          className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 p-6 transition-all"
        >
          <h2 className="text-xl font-bold text-blue-700 mb-6 text-right">القائمة</h2>
          <ul className="space-y-4 text-right">
            {actions.map((action, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    router.push(action.path);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-100"
                >
                  <div className="text-right flex-1 mr-4 truncate">
                    <p className="text-blue-800 font-medium text-sm truncate">
                      {action.title} - <span className="text-gray-500 font-normal">{action.subtitle}</span>
                    </p>
                  </div>
                  <div className="text-7xl text-blue-600">{action.icon}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Title & Search */}
<div
  style={{
    position: "relative",
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {/* العنوان في الوسط */}
  <h1
    style={{
      fontFamily: "Cairo, sans-serif",
      fontSize: "20px",
      fontWeight: 700,
      padding: "6px 16px",
      borderRadius: "15px",
      border: "2px solid #2563EB",
      color: "#1E3A8A",
      lineHeight: "1.6",
    }}
  >
    Register users
  </h1>
</div>
  {/* أيقونة البحث ومربع البحث يمين العنوان، لكن لا تؤثر على تمركزه */}
  
      {/* Table */}


     {/* أيقونة البحث فوق الجدول مباشرة بدون دفعه للأسفل */}

  {/* زر البحث */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "40px",
    marginTop: "30px",  // نزّل الحاوية كلها 8 بكسل تحت
  }}
>
  {/* زر الإضافة جهة الشمال */}
  <button
    onClick={() => router.push("/newLeave")}
    style={{
      display: "flex",
      alignItems: "center",
      backgroundColor: "#fffff",
      color: "#2563EB",
      borderRadius: "999px",
      padding: "6px 10px",
      fontFamily: "Cairo, sans-serif",
      fontWeight: "bold",
      fontSize: "14px",
      width: "120px",
      justifyContent: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      height: "100%",
    }}
  >
    <div
      style={{
        backgroundColor: "#2563EB",
        color: "#fff",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "8px",
        fontSize: "14px",
        fontWeight: "bold",
      }}
    > +
    </div>
    إضافة جديد
  </button>

  {/* زر البحث مع مربع البحث جهة اليمين */}
  <div
  style={{
    display: "flex",
    alignItems: "center",
    border: "2px solid #2563EB",
    borderRadius: "12px",
    padding: "2px 6px",
    backgroundColor: "#fff",
    gap: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    zIndex: 10,
    height: "40px",
  }}
>
  <button
    onClick={() => setSearchVisible(!searchVisible)}  // تقدر تخلي الزر ينفذ حاجة ثانية لو تحب
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      marginRight: "10px",
      display: "flex",
      alignItems: "center",
      height: "100%",
    }}
    aria-label="Toggle search"
  >
    <Search color="#2563EB" size={22} />
  </button>

  {/* هذا هو مربع البحث دايمًا ظاهر */}
<input
  type="text"
  placeholder="Search table "
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  style={{
    fontFamily: "Cairo, sans-serif",
    fontSize: "14px",
    padding: "4px 8px",       // قللت البادينج شوي
    border: "none",
    outline: "none",
    width: "100px",           // صغرت العرض من 140px إلى 100px
    height: "100%",
    marginRight: "6px",       // مسافة صغيرة من الحافة اليمنى
  }}
 className="custom-placeholder"
/>

<style jsx>{`
  .custom-placeholder::placeholder {
    color: #2563EB;
    opacity: 1;
  }
`}</style>
</div>

</div>

      <main className="flex-grow flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Table Header */}
             <div
  className="grid grid-cols-5 text-sm font-bold border-b pb-3 mb-4 text-center text-black"
  style={{ fontFamily: "Cairo2, sans-serif", fontSize: "20px", fontWeight: 700 }}
>
  <div className="flex items-center justify-center gap-1 whitespace-nowrap">
    <span>#</span>
    <span className="text-gray-400 text-base">▲▼</span>
  </div>
  <div className="flex items-center justify-center gap-1 whitespace-nowrap">
    <span>الاسم</span>
    <span className="text-base">▲▼</span>
  </div>
  <div className="flex items-center justify-center gap-1 whitespace-nowrap">
    <span>رقم الهوية</span>
    <span className="text-base">▲▼</span>
  </div>
  <div className="flex items-center justify-center gap-1 whitespace-nowrap">
    <span>رمز الإجازة</span>
    <span className="text-base">▲▼</span>
  </div>
  <div className="flex items-center justify-center gap-1 whitespace-nowrap">
    <span>الإجراءات</span>
    <span className="text-base">▲▼</span>
  </div>

              </div>

              {/* Table Rows */}
              {filteredUsers.map((user, index) => (
                <div
                  key={index}
                      className="grid grid-cols-5 items-center text-center text-sm py-3 border-b text-black"  >
                  <span className="font-extrabold text-lg whitespace-nowrap">{index + 1}</span>
                  <p className="whitespace-nowrap" style={{ fontFamily: "Cairo, sans-serif", fontSize: "14px", fontWeight: 700 }}>{user.name || "—"}</p>
                  <p className="whitespace-nowrap" style={{ fontFamily: "Cairo, sans-serif", fontSize: "14px", fontWeight: 700 }}>{user.idNumber || "—"}</p>
                  <p className="whitespace-nowrap" style={{ fontFamily: "Cairo, sans-serif", fontSize: "14px", fontWeight: 700 }}>{user.leaveCode || "—"}</p>
                  <div className="flex justify-center gap-2 whitespace-nowrap">
                  <button
  onClick={() => {
    const idOrName = user.idNumber || user.name;
    router.push(`/newLeave?editSearch=${encodeURIComponent(idOrName)}`); // ← هذا هو سطر التنقل
  }}
  className="p-1.5 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
  title="تعديل"
>
  <Pencil size={20} />
</button>
                    <button className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200" title="حذف">
                      <Trash2 size={20} />
                    </button>
                    <button
  onClick={() => router.push(`/a4page?leaveCode=${encodeURIComponent(user.leaveCode)}`)}
  className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
  title="طباعة"
>
  <Printer size={20} />
</button>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
