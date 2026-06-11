import { auth, db, googleProvider } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Keep track of current user
let currentUser = null;

// Auth Functions
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const listenToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
};

export const getCurrentUser = () => currentUser;

// Firestore Database Functions

/**
 * Fetch all user data from Firestore
 */
export const getUserData = async () => {
  if (!currentUser) return null;
  
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // User doc doesn't exist yet, return empty default state
      return {};
    }
  } catch (error) {
    console.error("Error fetching user data", error);
    return null;
  }
};

/**
 * Save user data to Firestore
 * We use merge: true so we don't overwrite fields we aren't passing.
 */
export const saveUserData = async (data) => {
  if (!currentUser) return;
  
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    await setDoc(userDocRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving user data", error);
  }
};
