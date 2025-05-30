
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD21X8fqXJ8YtfhelIy22u9HrP4VYziuzo",
  authDomain: "seating-chart-ae2de.firebaseapp.com",
  databaseURL: "https://seating-chart-ae2de-default-rtdb.firebaseio.com",
  projectId: "seating-chart-ae2de",
  storageBucket: "seating-chart-ae2de.appspot.com",
  messagingSenderId: "697557708624",
  appId: "1:697557708624:web:03aef9d9d09856d758c655",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
