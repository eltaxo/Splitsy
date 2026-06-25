import admin from 'firebase-admin';

// Firebase Admin SDK (Server-side only)
let adminApp: admin.app.App | null = null;

if (typeof window === 'undefined' && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log('Firebase Admin: Iniciando con service account key...');

    const serviceAccount = JSON.parse(serviceAccountKey);
    console.log('Firebase Admin: Service account parsed successfully');

    if (!admin.apps.length) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      console.log('Firebase Admin: App initialized successfully');
    } else {
      adminApp = admin.apps[0] || null;
      console.log('Firebase Admin: Using existing app');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
} else {
  console.log('Firebase Admin: No initialization needed (client-side or missing env vars)');
  if (typeof window !== 'undefined') {
    console.log('Firebase Admin: Running on client-side');
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY not set');
  }
}

export const adminDb = adminApp ? admin.firestore() : null;
export const adminAuth = adminApp ? admin.auth() : null;
