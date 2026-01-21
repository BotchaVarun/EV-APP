import admin from "firebase-admin";
import { readFileSync } from "fs";

// Initialize Firebase Admin
try {
    if (!admin.apps.length) {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccountPath) {
            try {
                let serviceAccount;
                // If the env var contains the JSON content directly
                if (serviceAccountPath.trim().startsWith('{')) {
                    serviceAccount = JSON.parse(serviceAccountPath);
                } else {
                    // Otherwise treat it as a file path
                    const serviceAccountJson = readFileSync(serviceAccountPath, 'utf8');
                    serviceAccount = JSON.parse(serviceAccountJson);
                }

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.error("Firebase Admin initialized with service account");
            } catch (parseError) {
                console.error("Failed to read or parse FIREBASE_SERVICE_ACCOUNT file. Falling back to default init.", parseError);
                admin.initializeApp();
            }
        } else {
            console.error("FIREBASE_SERVICE_ACCOUNT not set. initializing with default credentials (ADC).");
            admin.initializeApp();
        }
    }
} catch (error) {
    console.error("Firebase Admin initialization failed completely:", error);
    // Prevent crash, but functionality will break
}

// Export safe accessors or initialized instances
export const db = admin.firestore();
export const auth = admin.auth();