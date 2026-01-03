// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_5zd5M8Mc0G_qJ_ys67QxQt8jH_dn8jQ",
  authDomain: "auth-38efa.firebaseapp.com",
  projectId: "auth-38efa",
  storageBucket: "auth-38efa.firebasestorage.app",
  messagingSenderId: "474843809472",
  appId: "1:474843809472:web:3ef5f69f562ef3213fcf25",
  measurementId: "G-RHKWV724L9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Optional: Configure Google provider settings
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider, analytics };
export default app;
