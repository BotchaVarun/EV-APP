import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfigStr = import.meta.env.VITE_FIREBASE_CONFIG;

let app;
try {
    if (firebaseConfigStr) {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        app = initializeApp(firebaseConfig);
    } else {
        console.error("VITE_FIREBASE_CONFIG not found.");
        // Dummy init to prevent crash during build, but functionality will fail
        app = initializeApp({ apiKey: "dummy", projectId: "dummy" });
    }
} catch (e) {
    console.error("Error parsing VITE_FIREBASE_CONFIG or initializing app", e);
    app = initializeApp({ apiKey: "dummy", projectId: "dummy" });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
