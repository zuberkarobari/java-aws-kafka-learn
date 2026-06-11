import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Default placeholder configuration to satisfy security scanners.
// For local development, copy firebase-config.example.js to firebase-config.local.js and fill in your keys.
let firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER_AUTH_DOMAIN",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_STORAGE_BUCKET",
  messagingSenderId: "PLACEHOLDER_MESSAGING_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID",
  measurementId: "PLACEHOLDER_MEASUREMENT_ID"
};

// Try to load local configuration if available
try {
  const localConfig = await import("./firebase-config.local.js");
  if (localConfig && localConfig.default) {
    firebaseConfig = { ...firebaseConfig, ...localConfig.default };
  }
} catch (error) {
  // It is expected to fail in production unless using a local config file.
  console.warn("Using fallback/placeholder Firebase configuration. Create js/firebase-config.local.js for local development.");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
