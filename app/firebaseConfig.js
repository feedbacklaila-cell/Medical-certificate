import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8yhQzLkKdZT9xWxDhstPYtTIaOwMBL-8",
  authDomain: "medical-certificate-9deab.firebaseapp.com",
  projectId: "medical-certificate-9deab",
  storageBucket: "medical-certificate-9deab.firebasestorage.app",
  messagingSenderId: "803463932988",
  appId: "1:803463932988:web:f1fe69d8dab36b8d7aa739",
  measurementId: "G-PT6ZVG7F8T",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
