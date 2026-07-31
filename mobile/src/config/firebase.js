import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMzMfcQjWxvjMg_yB5yyfM3J9rVyS1HRM",
  authDomain: "cashtrack-25822.firebaseapp.com",
  projectId: "cashtrack-25822",
  storageBucket: "cashtrack-25822.firebasestorage.app",
  messagingSenderId: "1059678110484",
  appId: "1:1059678110484:web:8a167f760a5a2fd87df801"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithCredential };
