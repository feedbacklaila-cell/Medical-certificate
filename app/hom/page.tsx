"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, Pencil, Trash2, Printer, Search } from "lucide-react";
import { FaUserMd, FaCalendarPlus, FaFileAlt, FaStethoscope, FaUserFriends, FaClipboardCheck, FaHospital } from "react-icons/fa";
import { collection, getDocs, doc, deleteDoc, where, query } from "firebase/firestore";
import { db } from "../firebaseConfig";

type User = {
  name?: string;
  idNumber?: string;
  leaveCode?: string;
};

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const actions = [
    { title: "إضافة طبيب", icon: <FaUserMd className="text-blue-600 text-3xl" />, path: "/adddoctor" },
    { title: "إجازة جديدة", icon: <FaCalendarPlus className="text-blue-600 text-3xl" />, path: "/newLeave" },
    { title: "تقرير", icon: <FaFileAlt className="text-blue-600 text-3xl" />, path: "/a4page" },
    { title: "إضافة مستشفى", icon: <FaHospital className="text-blue-600 text-3xl" />, path: "/addHospitalPage" },
    { title: "تقرير طبي", icon: <FaStethoscope className="text-blue-600 text-3xl" />, path: "/medicalreport" },
    { title: "مرافق مريض", icon: <FaUserFriends className="text-blue-600 text-3xl" />, path: "/companion" },
    { title: "مشهد مراجعة", icon: <FaClipboardCheck className="text-blue-600 text-3xl" />, path: "/reviewnote" },
  ];

   const handleDeleteUser = async (leaveCode: string) => {
  if (confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) {
    try {
      const q = query(
        collection(db, "users"),
        where("leaveCode", "==", leaveCode)
      );
      
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "users", document.id));
      });
      
      await fetchUsers();
      alert("تم حذف المستخدم بنجاح");
    } catch (error) {
      console.error("حدث خطأ أثناء الحذف:", error);
      alert("فشل في حذف المستخدم");
    }
  }
};
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

  const filteredUsers = users.filter((user) => {
    const name = user.name?.toLowerCase() || "";
    const idNumber = user.idNumber?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || idNumber.includes(query);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
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
          <img 
            src="/m11.png" 
            alt="logo" 
            width={70} 
            height={60}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/default-logo.png';
            }}
          />
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
                      {action.title}
                    </p>
                  </div>
                  <div className="text-3xl text-blue-600">{action.icon}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Title & Search */}
      <div className="relative mt-10 flex justify-center items-center">
        <h1 className="font-cairo font-bold text-xl px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-900">
          Register users
        </h1>
      </div>
      
      {/* Search and Add Button */}
      <div className="flex justify-between items-center h-12 mt-8 px-4">
        <button
          onClick={() => router.push("/newLeave")}
          className="flex items-center bg-white text-blue-600 rounded-full px-4 py-2 font-cairo font-bold text-sm shadow-md transition-all hover:shadow-lg"
        >
          <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2">+</span>
          إضافة جديد
        </button>

        <div className="flex items-center border-2 border-blue-600 rounded-xl px-3 py-1 bg-white shadow-md">
          <button
            className="mr-2"
            aria-label="Search"
          >
            <Search color="#2563EB" size={22} />
          </button>
          <input
            type="text"
            placeholder="Search table"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-cairo text-sm outline-none placeholder-blue-600 w-32"
          />
        </div>
      </div>

      {/* Table */}
      <main className="flex-grow flex justify-center px-4 py-6">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-6 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid grid-cols-5 text-lg font-bold border-b pb-4 mb-4 text-center text-black font-cairo">
              <div className="flex items-center justify-center gap-1">
                <span>#</span>
                <span className="text-gray-400">▲▼</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>الاسم</span>
                <span>▲▼</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>رقم الهوية</span>
                <span>▲▼</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>رمز الإجازة</span>
                <span>▲▼</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>الإجراءات</span>
                <span>▲▼</span>
              </div>
            </div>

            {/* Table Rows */}
            {filteredUsers.map((user, index) => (
              <div
                key={index}
                className="grid grid-cols-5 items-center text-center py-4 border-b text-black"
              >
                <span className="font-extrabold text-lg">{index + 1}</span>
                <p className="font-cairo font-bold">{user.name || "—"}</p>
                <p className="font-cairo font-bold">{user.idNumber || "—"}</p>
                <p className="font-cairo font-bold">{user.leaveCode || "—"}</p>
                <div className="flex justify-center gap-3">
                  <button
                   onClick={() => {
  const leaveCode = user.leaveCode || "";
  router.push(`/newLeave?editSearch=${encodeURIComponent(leaveCode)}`);
}}
                    className="p-1.5 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                    title="تعديل"
                  >
                    <Pencil size={20} />
                  </button>
                <button 
  onClick={() => user.leaveCode && handleDeleteUser(user.leaveCode)}
  className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200" 
  title="حذف"
>
  <Trash2 size={20} />
</button>
                  <button
                    onClick={() => router.push(`/a4page?leaveCode=${encodeURIComponent(user.leaveCode || "")}`)}
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
      </main>
    </div>
  );
}