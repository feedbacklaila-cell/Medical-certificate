"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../firebaseConfig";
import { query, where, getDocs, doc, updateDoc, collection, addDoc } from "firebase/firestore";
import Link from "next/link";
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable @typescript-eslint/no-unused-vars */
type FormData = {
  amana: string;
  baladia: string;
  name: string;
  idNumber: string;
  gender: string;
  nationality: string;
  healthCertificateNumber: string;
  jobTitle: string;
  programType: string;
  licenseNumber: string;
  establishmentName: string;
  establishmentNumber: string;
  certificateIssueDate: string;
  healthCertificateIssueDate: string;
  programEndDate: string;
  amanaImageUrl: string;
  personImageUrl: string;
  certificateType: string;
  certificateId?: string;
  qrCodeImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AmanaData = {
  id: string;
  amanaName: string;
  baladiaName: string;
  imageUrl: string;
};

type PersonData = {
  id: string;
  fullName: string;
  idNumber: string;
  gender: string;
  nationality: string;
  profession: string;
  imageUrl: string;
};

type EducationalProgram = {
  id?: string;
  programType: string;
  endDate: string;
  createdAt: string;
};

type Establishment = {
  id?: string;
  licenseNumber: string;
  establishmentName: string;
  establishmentNumber: string;
  createdAt: string;
};

const generateCertificateNumber = (): string => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `455${new Date().getFullYear()}${randomNum}`;
};

const uploadToCloudinary = async (dataUrl: string): Promise<string> => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await uploadResponse.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

function HealthCertificateForm() {
  const [formData, setFormData] = useState<FormData>({
    amana: "",
    baladia: "",
    name: "",
    idNumber: "",
    gender: "",
    nationality: "السعودية",
    healthCertificateNumber: generateCertificateNumber(),
    jobTitle: "",
    programType: "",
    licenseNumber: "",
    establishmentName: "",
    establishmentNumber: "",
    certificateIssueDate: "",
    healthCertificateIssueDate: "",
    programEndDate: "",
    amanaImageUrl: "",
    personImageUrl: "",
    certificateType: ""
  });

  const [amanatList, setAmanatList] = useState<AmanaData[]>([]);
  const [filteredAmanat, setFilteredAmanat] = useState<AmanaData[]>([]);
  const [showAmanaSuggestions, setShowAmanaSuggestions] = useState(false);
  const [selectedAmana, setSelectedAmana] = useState<AmanaData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [personsList, setPersonsList] = useState<PersonData[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<PersonData[]>([]);
  const [showPersonSuggestions, setShowPersonSuggestions] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null);
  const [showProgramSuggestions, setShowProgramSuggestions] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState<EducationalProgram[]>([]);
  const [programsList, setProgramsList] = useState<EducationalProgram[]>([]);
  const [showLicenseSuggestions, setShowLicenseSuggestions] = useState(false);
  const [filteredLicenses, setFilteredLicenses] = useState<Establishment[]>([]);
  const [establishmentsList, setEstablishmentsList] = useState<Establishment[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const amanaInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAmanat = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "amanat"));
        const data: AmanaData[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          amanaName: doc.data().amanaName,
          baladiaName: doc.data().baladiaName,
          imageUrl: doc.data().imageUrl || ""
        }));
        setAmanatList(data);
      } catch (error) {
        console.error("Error fetching amanat:", error);
      }
    };

    const fetchPersons = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "medicalCertificates"));
        const data: PersonData[] = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            fullName: docData.fullName,
            idNumber: docData.idNumber,
            gender: docData.gender,
            nationality: docData.nationality,
            profession: docData.profession,
            imageUrl: docData.imageUrl || ""
          };
        });
        setPersonsList(data);
      } catch (error) {
        console.error("Error fetching persons:", error);
      }
    };

    const fetchPrograms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "educationalPrograms"));
        const data: EducationalProgram[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          programType: doc.data().programType,
          endDate: doc.data().endDate,
          createdAt: doc.data().createdAt
        }));
        setProgramsList(data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };

    const fetchEstablishments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "establishments"));
        const data: Establishment[] = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            licenseNumber: docData.licenseNumber || "",
            establishmentName: docData.establishmentName || "",
            establishmentNumber: docData.establishmentNumber || "",
            createdAt: docData.createdAt || ""
          };
        });
        setEstablishmentsList(data);
      } catch (error) {
        console.error("Error fetching establishments:", error);
      }
    };

    fetchAmanat();
    fetchPersons();
    fetchPrograms();
    fetchEstablishments();
  }, []);

  const handleAmanaInputFocus = () => {
    setFilteredAmanat(amanatList);
    setShowAmanaSuggestions(true);
  };

  const handleAmanaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, amana: value, baladia: "", amanaImageUrl: "" }));
    setSelectedAmana(null);
    
    if (value.length > 0) {
      const filtered = amanatList.filter(item =>
        item.amanaName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAmanat(filtered);
    }
    setShowAmanaSuggestions(true);
  };

  const selectAmana = (amana: AmanaData) => {
    setFormData(prev => ({
      ...prev,
      amana: amana.amanaName,
      baladia: amana.baladiaName,
      amanaImageUrl: amana.imageUrl
    }));
    setSelectedAmana(amana);
    setShowAmanaSuggestions(false);
  };

  const checkAmanaExists = () => {
    if (!formData.amana) {
      alert("الرجاء إدخال اسم الأمانة أولاً");
      return;
    }

    const exists = amanatList.some(item => 
      item.amanaName.toLowerCase() === formData.amana.toLowerCase()
    );

    if (exists) {
      alert("هذه الأمانة مسجلة بالفعل");
    } else {
      if (confirm("هذه الأمانة غير مسجلة، هل تريد الانتقال لصفحة الأمانات لتسجيلها؟")) {
        sessionStorage.setItem('pendingAmana', formData.amana);
        window.location.href = "/AmanatData";
      }
    }
  };

  const handleNameInputFocus = () => {
    setFilteredPersons(personsList);
    setShowPersonSuggestions(true);
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    setSelectedPerson(null);
    
    if (value.length > 0) {
      const filtered = personsList.filter(person =>
        person.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPersons(filtered);
    } else {
      setFilteredPersons(personsList);
    }
    setShowPersonSuggestions(true);
  };

  const selectPerson = (person: PersonData) => {
    setFormData(prev => ({
      ...prev,
      name: person.fullName,
      idNumber: person.idNumber,
      gender: person.gender,
      nationality: person.nationality,
      jobTitle: person.profession,
      personImageUrl: person.imageUrl
    }));
    setSelectedPerson(person);
    setShowPersonSuggestions(false);
  };

  const handleProgramInputFocus = () => {
    setFilteredPrograms(programsList);
    setShowProgramSuggestions(true);
  };

  const handleProgramInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, programType: value, programEndDate: "" }));
    
    if (value.length > 0) {
      const filtered = programsList.filter(item =>
        item.programType.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(programsList);
    }
    setShowProgramSuggestions(true);
  };

  const selectProgram = (program: EducationalProgram) => {
    setFormData(prev => ({
      ...prev,
      programType: program.programType,
      programEndDate: program.endDate
    }));
    setShowProgramSuggestions(false);
  };

  const handleLicenseInputFocus = () => {
    setFilteredLicenses(establishmentsList);
    setShowLicenseSuggestions(true);
  };

  const handleLicenseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      licenseNumber: value,
      establishmentName: "",
      establishmentNumber: ""
    }));
    
    if (value.length > 0) {
      const filtered = establishmentsList.filter(item =>
        item.licenseNumber.toLowerCase().includes(value.toLowerCase()) ||
        item.establishmentName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLicenses(filtered);
    } else {
      setFilteredLicenses(establishmentsList);
    }
    setShowLicenseSuggestions(true);
  };

  const selectLicense = (establishment: Establishment) => {
    setFormData(prev => ({
      ...prev,
      licenseNumber: establishment.licenseNumber,
      establishmentName: establishment.establishmentName,
      establishmentNumber: establishment.establishmentNumber
    }));
    setShowLicenseSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkCertificateExists = async (certificateNumber: string): Promise<{ exists: boolean; docId?: string }> => {
    try {
      const q = query(collection(db, "healthCertificates"), 
        where("healthCertificateIssueDate", "==", certificateNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { exists: true, docId: querySnapshot.docs[0].id };
      }
      return { exists: false };
    } catch (error) {
      console.error("Error checking certificate existence:", error);
      return { exists: false };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.idNumber || !formData.establishmentName || !formData.certificateType) {
      alert("الرجاء إدخال البيانات المطلوبة (الاسم، رقم الهوية، اسم المنشأة، نوع الشهادة)");
      return;
    }

    setLoading(true);

    try {
      // التحقق من وجود الشهادة بنفس الرقم
      const { exists, docId } = await checkCertificateExists(formData.healthCertificateIssueDate);
      
      if (exists && !isEditing) {
        const shouldEdit = confirm("رقم الشهادة مسجل مسبقاً. هل تريد تعديل البيانات بدلاً من حفظ جديد؟");
        if (shouldEdit) {
          // تحويل إلى وضع التحرير
          setEditingDocId(docId || null);
          setIsEditing(true);
          setLoading(false);
          return;
        } else {
          setLoading(false);
          return;
        }
      }

      // عند التعديل، نحتفظ بمعرف الشهادة والباركود الأصلي
      const certificateId = isEditing ? formData.healthCertificateIssueDate : uuidv4();
      const certificateUrl = `https://www.blady.dev/sa/Eservices/HealthIssue/PrintedLicenses?certificateNumber=${encodeURIComponent(certificateId)}`;
      
      // إنشاء باركود جديد فقط إذا كان تسجيلاً جديداً
      let qrCodeImageUrl = formData.qrCodeImageUrl;
      if (!isEditing) {
        const qrCodeDataUrl = await QRCode.toDataURL(certificateUrl);
        qrCodeImageUrl = await uploadToCloudinary(qrCodeDataUrl);
      }
      
      // حفظ البيانات في Firebase
      const certificateData = {
        ...formData,
        certificateId,
        qrCodeImageUrl,
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing && editingDocId) {
        await updateDoc(doc(db, "healthCertificates", editingDocId), certificateData);
        alert("تم تحديث البيانات بنجاح");
      } else {
        await addDoc(collection(db, "healthCertificates"), certificateData);
        alert("تم حفظ البيانات بنجاح");
        setQrCodeUrl(qrCodeImageUrl || '');
      }

      // تفريغ النموذج بعد الحفظ الناجح
      resetForm();

    } catch (error) {
      console.error("حدث خطأ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amana: "",
      baladia: "",
      name: "",
      idNumber: "",
      gender: "",
      nationality: "السعودية",
      healthCertificateNumber: generateCertificateNumber(),
      jobTitle: "",
      programType: "",
      licenseNumber: "",
      establishmentName: "",
      establishmentNumber: "",
      certificateIssueDate: "",
      healthCertificateIssueDate: "",
      programEndDate: "",
      amanaImageUrl: "",
      personImageUrl: "",
      certificateType: ""
    });
    setSelectedAmana(null);
    setSelectedPerson(null);
    setIsEditing(false);
    setEditingDocId(null);
    setQrCodeUrl(null);
  };

  useEffect(() => {
    const fetchData = async (certificateNumber: string) => {
      try {
        const q = query(collection(db, "healthCertificates"), 
          where("healthCertificateNumber", "==", certificateNumber));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert("لا يوجد بيانات مسجلة بهذا الرقم");
          return;
        }

        const docData = querySnapshot.docs[0].data() as FormData;
        setEditingDocId(querySnapshot.docs[0].id);
        setFormData(docData);
        setQrCodeUrl(docData.qrCodeImageUrl || null);
        
        if (docData.amana) {
          const foundAmana = amanatList.find(
            item => item.amanaName === docData.amana && item.baladiaName === docData.baladia
          );
          if (foundAmana) {
            setSelectedAmana(foundAmana);
          }
        }
        
        if (docData.name) {
          const foundPerson = personsList.find(
            person => person.fullName === docData.name && person.idNumber === docData.idNumber
          );
          if (foundPerson) {
            setSelectedPerson(foundPerson);
          }
        }
        
        setIsEditing(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("حدث خطأ أثناء جلب البيانات");
      }
    };

    const certificateNumber = searchParams.get("certificateNumber");
    if (certificateNumber) {
      fetchData(certificateNumber);
    }
  }, [searchParams, amanatList, personsList]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 py-4 px-6">
          <h1 className="text-xl font-bold text-white">
            {isEditing ? "تعديل الشهادة الصحية" : "نموذج الشهادة الصحية"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-800">رقم الشهادة:</span>
              <span className="font-mono text-lg">{formData.healthCertificateNumber}</span>
            </div>
            
            {/* حقل نوع الشهادة */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الشهادة *</label>
              <input
                type="text"
                name="certificateType"
                value={formData.certificateType}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل نوع الشهادة"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ إصدار الشهادة</label>
                <input
                  type="date"
                  name="certificateIssueDate"
                  value={formData.certificateIssueDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتها الشهادة الصحية *</label>
                <input
                  type="date"
                  name="healthCertificateIssueDate"
                  value={formData.healthCertificateIssueDate}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء البرنامج التثقيفي</label>
                <input
                  type="date"
                  name="programEndDate"
                  value={formData.programEndDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الأمانة *</label>
                  <input
                    type="text"
                    name="amana"
                    value={formData.amana}
                    onChange={handleAmanaInputChange}
                    onFocus={handleAmanaInputFocus}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                    ref={amanaInputRef}
                  />
                  
                  {showAmanaSuggestions && filteredAmanat.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredAmanat.map((item, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectAmana(item)}
                        >
                          <div className="font-medium">{item.amanaName}</div>
                          <div className="text-sm text-gray-500">{item.baladiaName}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={checkAmanaExists}
                  className="mt-6 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                  title="التحقق من وجود الأمانة"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البلدية *</label>
              <input
                type="text"
                name="baladia"
                value={formData.baladia}
                onChange={handleChange}
                required
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameInputChange}
                    onFocus={handleNameInputFocus}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                    ref={nameInputRef}
                  />
                  
                  {showPersonSuggestions && filteredPersons.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredPersons.map((person, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectPerson(person)}
                        >
                          <div className="font-medium">{person.fullName}</div>
                          <div className="text-sm text-gray-500">{person.idNumber}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Link href="/Name" passHref>
                  <button
                    type="button"
                    className="mt-6 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md h-[42px]"
                    title="الانتقال إلى صفحة الأسماء"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية/الإقامة *</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الجنس *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر الجنس</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الجنسية</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المهنة</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* {formData.personImageUrl && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الشخص</label>
                <img 
                  src={formData.personImageUrl} 
                  alt="صورة الشخص" 
                  className="h-24 object-cover rounded-md border border-gray-200"
                />
              </div>
            )} */}

            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع البرنامج التثقيفي</label>
                  <input
                    type="text"
                    name="programType"
                    value={formData.programType}
                    onChange={handleProgramInputChange}
                    onFocus={handleProgramInputFocus}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                  
                  {showProgramSuggestions && filteredPrograms.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredPrograms.map((program, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectProgram(program)}
                        >
                          <div className="font-medium">{program.programType}</div>
                          <div className="text-sm text-gray-500">
                            ينتهي في: {new Date(program.endDate).toLocaleDateString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Link href="/EducationalPrograms" passHref>
                  <button
                    type="button"
                    className="mt-6 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md h-[42px]"
                    title="الانتقال إلى صفحة البرامج التثقيفية"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الرخصة</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleLicenseInputChange}
                    onFocus={handleLicenseInputFocus}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                  
                  {showLicenseSuggestions && filteredLicenses.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredLicenses.map((item, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectLicense(item)}
                        >
                          <div className="font-medium">{item.licenseNumber}</div>
                          <div className="text-sm text-gray-500">{item.establishmentName}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Link href="/EstablishmentsPage" passHref>
                  <button
                    type="button"
                    className="mt-6 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md h-[42px]"
                    title="الانتقال إلى صفحة المنشآت"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنشأة *</label>
              <input
                type="text"
                name="establishmentName"
                value={formData.establishmentName}
                onChange={handleChange}
                required
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم المنشأة</label>
              <input
                type="text"
                name="establishmentNumber"
                value={formData.establishmentNumber}
                onChange={handleChange}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>

          {/* قسم عرض الباركود */}
          {/* {(qrCodeUrl || formData.qrCodeImageUrl) && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold text-center mb-3">باركود الشهادة</h3>
              <img 
                src={qrCodeUrl || formData.qrCodeImageUrl} 
                alt="QR Code" 
                className="w-40 h-40 mx-auto"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                يمكن مسح هذا الباركود للتحقق من صحة الشهادة
              </p>
            </div>
          )} */}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium"
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : (isEditing ? "تحديث البيانات" : "حفظ البيانات")}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium"
              >
                نموذج جديد
              </button>
            )}

            <Link href="/Medical" passHref>
              <button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
              >
                العودة للرئيسية
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">جاري تحميل النموذج...</div>}>
      <HealthCertificateForm />
    </Suspense>
  );
}