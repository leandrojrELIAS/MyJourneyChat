import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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


// auth().setPersistence(auth.Auth.Persistence.LOCAL);
// Persistência local já é padrão no React Native Firebase.

// Exportar instâncias de auth e firestore
export { auth, firestore as db };

