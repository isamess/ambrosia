// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXRbzOPRWD0dyY3iJ2Egnerwm5fd6pJEc",
  authDomain: "ambrosia-f0273.firebaseapp.com",
  projectId: "ambrosia-f0273",
  storageBucket: "ambrosia-f0273.firebasestorage.app",
  messagingSenderId: "89969957466",
  appId: "1:89969957466:web:62997723e08b6a691c5663",
  measurementId: "G-P3LFJEKKM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);

// Sesión del admin atada a la pestaña: al cerrarla se pierde el login.
// (sessionStorage es por pestaña; rige para próximos inicios de sesión,
// la sesión actual guardada en local pasa a sesión en el próximo login.)
setPersistence(auth, browserSessionPersistence).catch((e) =>
    console.error("No se pudo fijar persistencia de sesión:", e)
);


 
  