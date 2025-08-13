// js/auth/authConfig.js
let auth, db, googleProvider;

// Función para inicializar Firebase
async function initFirebase() {
  try {
    const response = await fetch('/.netlify/functions/getFirebaseConfig');
    const config = await response.json();
    
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    
    return { auth, db, googleProvider };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

// Exportamos tanto la función de inicialización como las instancias
export { initFirebase, auth, db, googleProvider };