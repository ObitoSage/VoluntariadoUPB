import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Inicializa Auth con persistencia para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
