// src/firebase.js

// Import Firebase SDK functions you need
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/database'
// Firestore imports
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, setDoc, getDoc, increment, where, Timestamp } from 'firebase/firestore'
// Firebase Auth
import { getAuth,signInWithEmailAndPassword } from 'firebase/auth'

// Your Firebase config object (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyClfSJ3GtET3CvlwYRMQ0zfQw-gnVChUf0",
  authDomain: "aquaaligned-d767a.firebaseapp.com",
  databaseURL: "https://aquaaligned-d767a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aquaaligned-d767a",
  storageBucket: "aquaaligned-d767a.firebasestorage.app",
  messagingSenderId: "914664296179",
  appId: "1:914664296179:web:7c2f79a6476f3ffeb5f186",
  measurementId: "G-5MGD1MM5M9"
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database and export it
const db = getDatabase(app)
const firestore = getFirestore(app)

// ✅ Initialize and export Firebase Auth
const auth = getAuth(app)
// Export the database and functions you need
export { db, ref, onValue, set, firestore, collection, addDoc, getDocs, query, orderBy, doc, setDoc, getDoc, increment, where, Timestamp, signInWithEmailAndPassword, auth }
