// Firebase Configuration
// IMPORTANT: Replace these with your own Firebase project credentials
// Get them from: https://console.firebase.google.com/

var firebaseConfig = {
  apiKey: "AIzaSyAnbLrIfm_MUUzA9V-bvc83n1wUA2Ys0PA",
  authDomain: "sajjad-ayesha-wedding.firebaseapp.com",
  databaseURL: "https://sajjad-ayesha-wedding-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sajjad-ayesha-wedding",
  storageBucket: "sajjad-ayesha-wedding.firebasestorage.app",
  messagingSenderId: "951387094771",
  appId: "1:951387094771:web:dd233c820e672126b4c186"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}
