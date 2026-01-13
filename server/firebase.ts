import admin from "firebase-admin";

// Initialize Firebase Admin
try {
    if (!admin.apps.length) {
        const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountStr) {
            try {
                const serviceAccount = JSON.parse(serviceAccountStr);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log("Firebase Admin initialized with service account");
            } catch (parseError) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Falling back to default init.", parseError);
                admin.initializeApp();
            }
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT not set. initializing with default credentials (ADC).");
            admin.initializeApp();
        }
    }
} catch (error) {
    console.error("Firebase Admin initialization failed completely:", error);
    // Prevent crash, but functionality will break
}

// Export safe accessors or initialized instances
// If initialization failed, these might throw, but hopefully the try-catch above caught the init error.
export const db = admin.firestore();
export const auth = admin.auth();
