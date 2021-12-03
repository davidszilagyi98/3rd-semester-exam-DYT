import { navigateTo } from "./router.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWNJxrySODY31PNS-L3wNl4B4LauSO2E0",
  authDomain: "first-project-4c2ab.firebaseapp.com",
  projectId: "first-project-4c2ab",
  storageBucket: "first-project-4c2ab.appspot.com",
  messagingSenderId: "159919462975",
  appId: "1:159919462975:web:e4d8784c611f135d1af68a",
  measurementId: "G-TQWPSVDB8V",
};
// Initialize Firebase (modular)
initializeApp(firebaseConfig);
const _auth = getAuth();

// Initialize Firebase UI (non modular)
firebase.initializeApp(firebaseConfig);
let _firebaseUI;

// ========== FIREBASE AUTH ========== //
// Listen on authentication state change

onAuthStateChanged(_auth, (user) => {
  console.log(user);
  if (user) {
    userAuthenticated(user);
  } else {
    // User is signed out
    userNotAuthenticated();
  }
});

function userAuthenticated(user) {
  appendUserData(user);
  navigateTo("#/");
  showLoader(false);
}

function userNotAuthenticated() {
  navigateTo("#/login");

  // Firebase UI configuration
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
    signInSuccessUrl: "#/",
  };
  // Init Firebase UI Authentication
  if (!_firebaseUI) {
    _firebaseUI = new firebaseui.auth.AuthUI(firebase.auth());
  }
  _firebaseUI.start("#firebaseui-auth-container", uiConfig);
  showLoader(false);
}

function appendUserData(user) {
  console.log(user);
  document.querySelector("#user-data").innerHTML = /*html*/ `
    <img class="profile-img" src="${user.photoURL || "img/placeholder.jpg"}">
    <h3>${user.displayName}</h3>
    <p>${user.email}</p>
  `;
}

function logout() {
  signOut(_auth);
}

function showLoader(show) {
  let loader = document.querySelector("#loader");
  if (show) {
    loader.classList.remove("hide");
  } else {
    loader.classList.add("hide");
  }
}

// =========== reading from collection (modular v9) =========== //

// reference to database
const _db = getFirestore();
// reference to the announcements in the database
const _announcementsRef = collection(_db, "announcements");
let _announcements = [];
// reference to users collection in database
const _usersRef = collection(_db, "users");
let _users = [];

// ========== READ ==========
// onSnapshot: listen for realtime updates from announcements
onSnapshot(_announcementsRef, (snapshot) => {
  _announcements = snapshot.docs.map((doc) => {
    const announcement = doc.data();
    announcement.id = doc.id;
    return announcement;
  });
  appendAnnouncements(_announcements);
  // showLoader(false);
});

// ========== Append announcements to the DOM ========== //
function appendAnnouncements(announcements) {
  let html = "";
  for (const announcement of announcements) {
    html += `
      <div class="card">
        <div class="card-name">
          <img src=${announcement.image} alt='author image' />
          <h2 class="announcement-author">${announcement.author}</h2>
        </div>
        <p class="announcement-text">${announcement.text}</p>
        <button class="card-button">Comment</button>
      </div>
    `;
  }
  document.querySelector(".announcements").innerHTML = html;
}

// ========== CREATE NEW USER ========== //
const createPostButton = document.querySelector(".create-post");
const announcementForm = document.querySelector(".create-announcement");
const confirmPost = document.querySelector(".create-post-button");
createPostButton.addEventListener("click", () => {
  announcementForm.classList.toggle("form-active");
});
const cancelFormButton = document.querySelector(".cancel-post");
cancelFormButton.addEventListener("click", () => {
  announcementForm.classList.toggle("form-active");
});

function createAnnouncement() {
  let authorInput = document.querySelector("#name");
  let textInput = document.querySelector("#announcement");

  const newAnnouncement = {
    author: authorInput.value,
    text: textInput.value,
  };

  addDoc(_announcementsRef, newAnnouncement);
  confirmPost.addEventListener("click", () => {
    announcementForm.classList.add("form-active");
  });
}

document.querySelector(".create-post-button").onclick = () =>
  createAnnouncement();

// onSnapshot: listen for realtime updates from users
onSnapshot(_usersRef, (snapshot) => {
  // mapping snapshot data from firebase in to user objects
  _users = snapshot.docs.map((doc) => {
    const user = doc.data();
    user.id = doc.id;
    return user;
  });
  console.log(_users);
  appendUsers(_users);
  showLoader(false);
});

// append users to the DOM
function appendUsers(users) {
  let htmlTemplate = "";
  for (const user of users) {
    htmlTemplate += /*html*/ `
    <article>
		<img src="${user.image}">
      <h3>${user.name}</h3>
      <p><a href="mailto:${user.email}">${user.email}</a></p>
    </article>
    `;
  }
  document.querySelector("#grid-users").innerHTML = htmlTemplate;
}

// =========== attach events =========== //
document.querySelector("#btn-logout").onclick = () => logout();
