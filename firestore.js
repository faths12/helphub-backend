const fs = require('firebase-admin');
const serviceAccount = require('./creads.json');

fs.initializeApp({
 credential: fs.credential.cert(serviceAccount)
});

const db = fs.firestore(); 

async function get_data(uid) {
    const user = await fs.auth().getUser(uid);
    return user;
}

module.exports = {fs, db, get_data}
