import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYkn0D_dgYBjC3TxBVVWidJHkQyH4Hdm0",
  authDomain: "medical-62016.firebaseapp.com",
  projectId: "medical-62016",
  storageBucket: "medical-62016.firebasestorage.app",
  messagingSenderId: "488006149686",
  appId: "1:488006149686:web:869d37346907e857eada97",
  measurementId: "G-4GV2LHHT8H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
