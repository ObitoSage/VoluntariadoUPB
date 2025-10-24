import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Reemplaza estos valores con tus credenciales de Firebase
// Ve a: Firebase Console > Project Settings > General > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyAwyU_0xHHd_G2tUxXwIx87zAUZk7Ppklo",
  authDomain: "voluntariadoupb-f2091.firebaseapp.com",
  projectId: "voluntariadoupb-f2091",
  storageBucket: "voluntariadoupb-f2091.firebasestorage.app",
  messagingSenderId: "76177715427",
  appId: "1:76177715427:web:b3a501702c33e832d715d6"
};


// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth
const auth = getAuth(app);

// Inicializa Firestore
const db = getFirestore(app);

// Inicializa Storage
const storage = getStorage(app);

export { app, auth, db, storage };
