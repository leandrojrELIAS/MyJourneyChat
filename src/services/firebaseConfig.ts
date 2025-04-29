import { initializeApp } from 'firebase/app';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD73AjGP6FmY3BLNNTMcrtM1iL-Zyb0lFc",
  authDomain: "myjourneychat.firebaseapp.com",
  projectId: "myjourneychat",
  storageBucket: "myjourneychat.firebasestorage.app",
  messagingSenderId: "814789046926",
  appId: "1:814789046926:web:bb24c33c556b54b25d4fdf",
  measurementId: "G-79XZQK0LQ7",
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = getFirestore(app);

export { auth, db };