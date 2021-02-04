 import * as firebase from 'firebase';
 //import firebase from 'firebase';

 require('@firebase/firestore');

 // Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyDELatw6n0EPPMk6FlRfRCbH0jgdyZmRDo",
    authDomain: "wireleibrary-c68-72.firebaseapp.com",
    projectId: "wireleibrary-c68-72",
    storageBucket: "wireleibrary-c68-72.appspot.com",
    messagingSenderId: "215352987316",
    appId: "1:215352987316:web:052150feb39cd48b3391e1"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();