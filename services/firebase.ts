import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase Configuration for Tour App
const firebaseConfig = {
    apiKey: "AIzaSyC5P0uZsCo5H54TlEP8wkxzk3lWjP0jTQI",
    authDomain: "tour-app-670ca.firebaseapp.com",
    projectId: "tour-app-670ca",
    storageBucket: "tour-app-670ca.firebasestorage.app",
    messagingSenderId: "957704330334",
    appId: "1:957704330334:web:bd49a8e7fd2faeef1668cf",
    measurementId: "G-65X3P4G9YW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider } from 'firebase/auth';

// Enable offline persistence
// wrap in try-catch as it can fail if multiple tabs are open
try {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
        } else if (err.code == 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence');
        }
    });
} catch (e) {
    console.warn('Firestore persistence init error', e);
}
