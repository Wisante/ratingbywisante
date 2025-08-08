let auth, db;
const firebaseConfig = await fetch('/.netlify/functions/getFirebaseConfig')
  .then(response => response.json());

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
auth = firebase.auth();
db = firebase.firestore();

export { auth, db };