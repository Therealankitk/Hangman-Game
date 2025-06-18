import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyCcMMbHKvpTxyyjIjMI4aDTGLlq6bWUQe8",
  authDomain: "hangman-game-b9fff.firebaseapp.com",
  databaseURL: "https://hangman-game-b9fff-default-rtdb.firebaseio.com",
  projectId: "hangman-game-b9fff",
  storageBucket: "hangman-game-b9fff.firebasestorage.app",
  messagingSenderId: "529170446091",
  appId: "1:529170446091:web:5d9a4838f5db27c4f1540e",
  measurementId: "G-V5W967XLXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, get, set };