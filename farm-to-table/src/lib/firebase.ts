import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
    apiKey: "AIzaSyCOGg_ZkhcDzxqeHKPbzCbpYbYsqPDa_Q4",
    authDomain: "farm-to-table-supply-chain.firebaseapp.com",
    databaseURL: "https://farm-to-table-supply-chain-default-rtdb.firebaseio.com",
    projectId: "farm-to-table-supply-chain",
    storageBucket: "farm-to-table-supply-chain.appspot.com",
    messagingSenderId: "478293561174",
    appId: "1:478293561174:web:56ec86cc46fa426f8790f7",
  };
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)