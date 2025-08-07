fetch('/.netlify/functions/getFirebaseConfig')
  .then(response => response.json())
  .then(config => {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
const auth = firebase.auth();
const db = firebase.firestore();
  })
  .catch(error => console.error("Error loading Firebase config:", error));