import admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : undefined;

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin Initialized successfully");
        } else {
            console.warn(
                "FIREBASE_SERVICE_ACCOUNT not found. Firebase Admin not initialized properly."
            );
            // Fallback for development if ADC is set up, or just let it fail later if not
            admin.initializeApp();
        }
    } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error);
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
