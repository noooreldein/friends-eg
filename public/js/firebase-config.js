// Firebase configuration placeholder
// Replace the values below with your Firebase project's settings.
// You can find these in the Firebase console under Project settings > General > Your apps.

const firebaseConfig = {
  apiKey: "AIzaSyDkdpYPH967sDF3aKqEP92Yq8-6yJJ5O5o",
  authDomain: "friends-store-1.firebaseapp.com",
  projectId: "friends-store-1",
  storageBucket: "friends-store-1.firebasestorage.app",
  messagingSenderId: "498292394482",
  appId: "1:498292394482:web:4e000a0aeff6d592b4c36b",
  measurementId: "G-HBGXQLJP5N"
};

// initialize firebase if not already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firebaseAuth = firebase.auth();

// configure recaptcha for phone auth (invisible)
firebaseAuth.useDeviceLanguage();
const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  size: 'invisible',
  callback: (response) => {
    // reCAPTCHA solved - will proceed with submitPhoneNumberAuth.
  }
});

// utility to send verification code to phone number
async function sendPhoneCode(phone) {
  return firebaseAuth.signInWithPhoneNumber(phone, recaptchaVerifier);
}

// verify code and return firebase user
async function verifyPhoneCode(confirmationResult, code) {
  return confirmationResult.confirm(code);
}
