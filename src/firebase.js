// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

import 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJkKUiSUwMhSxwvrPFWNgoDWiM1A6jq3g",
  authDomain: "invoice-form-vue.firebaseapp.com",
  projectId: "invoice-form-vue",
  storageBucket: "invoice-form-vue.appspot.com",
  messagingSenderId: "6899410544",
  appId: "1:6899410544:web:fec008b35737b902dbf6b5",
  measurementId: "G-NJNNEDXN88"
};

// Initialize Firebase
initializeApp(firebaseConfig);
// getAnalytics(app);
// const analytics = getAnalytics(app);

export const db = getFirestore(); //app.firestore();

