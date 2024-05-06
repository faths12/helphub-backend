const { initializeApp } = require("firebase/app");
const { getAuth } =  require("firebase/auth");
const { createUserWithEmailAndPassword } = require("firebase/auth")
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const firebaseConfig = {
*
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

function create_account_email(email, password, name) {
  createUserWithEmailAndPassword(auth, email=email, password=password)
  .then(response=>{
    return "Account Created";
  })
  .catch(error=>{
    return "Error:" + String(error.code)
  })
}


module.exports = { auth };