import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCgQ_uJjGzjLqG-_vd-ObBqClYj3CoIYc",
  authDomain: "pathpilot-app-de2d3.firebaseapp.com",
  projectId: "pathpilot-app-de2d3",
  storageBucket: "pathpilot-app-de2d3.firebasestorage.app",
  messagingSenderId: "516405108713",
  appId: "1:516405108713:web:4ae84cf4244211b78d3578"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;