import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDBZtpmiN3WMhY3LPSnKkpkZz__EPjy6U4",
  authDomain: "dashboard-cca53.firebaseapp.com",
  projectId: "dashboard-cca53",
  storageBucket: "dashboard-cca53.firebasestorage.app",
  messagingSenderId: "641859927599",
  appId: "1:641859927599:web:92521dd049058cb41590da",
  measurementId: "G-4CKDPX0HL2"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
