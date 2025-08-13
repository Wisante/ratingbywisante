let firebasePromise = null;

/**
 * Initializes Firebase and returns a promise that resolves with the services.
 * This ensures Firebase is only initialized once.
 * @returns {Promise<{auth: firebase.auth.Auth, db: firebase.firestore.Firestore, googleProvider: firebase.auth.GoogleAuthProvider}>}
 */
export function initializeFirebase() {
    if (firebasePromise) {
        return firebasePromise;
    }

    firebasePromise = new Promise((resolve, reject) => {
        fetch('/.netlify/functions/getFirebaseConfig')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(config => {
                if (!firebase.apps.length) {
                    firebase.initializeApp(config);
                }

                const auth = firebase.auth();
                const db = firebase.firestore();
                const googleProvider = new firebase.auth.GoogleAuthProvider();

                resolve({ auth, db, googleProvider });
            })
            .catch(error => {
                console.error("Error initializing Firebase:", error);
                reject(error);
            });
    });

    return firebasePromise;
}