  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";
  import { getStorage } from "firebase/storage";

  // Required Firebase environment keys
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ] as const;

  const missingKeys = requiredKeys.filter((key) => {
    const val = import.meta.env[key];
    return !val || typeof val !== 'string' || val.trim() === '' || val.includes('placeholder');
  });

  export const isFirebaseConfigured = missingKeys.length === 0;

  if (!isFirebaseConfigured) {
    console.warn(
      `[Firebase Config Check] Missing required Firebase environment variables in frontend/.env:\n` +
      missingKeys.map((k) => `  - ${k}`).join('\n') +
      `\nPlease populate them in frontend/.env.development or frontend/.env.`
    );
  }

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);

  /**
   * Standard user-friendly error mapper for Firebase Auth
   */
  export const formatAuthError = (err: any): string => {
    if (!err) return 'An unexpected error occurred.';
    const code = typeof err === 'object' && err?.code ? err.code : '';
    const message = typeof err === 'object' && err?.message ? err.message : String(err);

    if (
      code === 'auth/invalid-credential' || 
      code === 'auth/wrong-password' ||
      message.includes('auth/invalid-credential') ||
      message.includes('auth/wrong-password') ||
      message.includes('wrong-password')
    ) {
      return 'Invalid email or password';
    }

    if (code === 'auth/user-not-found' || message.includes('auth/user-not-found') || message.includes('user-not-found')) {
      return 'User not found';
    }

    if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use') || message.includes('email-already-in-use')) {
      return 'Email already in use';
    }

    if (code === 'auth/weak-password' || message.includes('auth/weak-password') || message.includes('weak-password')) {
      return 'Weak password. Password should be at least 6 characters.';
    }

    if (code === 'auth/invalid-email' || message.includes('auth/invalid-email') || message.includes('invalid-email')) {
      return 'Invalid email address';
    }

    if (message.includes('awaiting administrator approval') || code === 'auth/account-pending') {
      return 'Your account is awaiting administrator approval.';
    }

    if (message.includes('rejected by the administrator') || code === 'auth/account-rejected') {
      return 'Your account has been rejected by the administrator.';
    }

    if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
      return 'Access temporarily restricted due to repeated attempts. Please try again later.';
    }

    if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
      return 'Network communication failed. Please check your internet connection.';
    }

    if (
      code === 'auth/api-key-not-valid' ||
      code === 'auth/invalid-api-key' ||
      message.includes('api-key-not-valid') ||
      message.includes('invalid-api-key') ||
      message.includes('API key not valid')
    ) {
      return 'Firebase API Key is invalid. Please copy the complete Web API Key from Firebase Console (Project Settings > General).';
    }

    return message || 'Authentication failed. Please verify credentials.';
  };

  export default app;
