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
  getDoc,
  setDoc,
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
  navigateTo("#/splash-screen");
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
    signInSuccessUrl: "#/splash-screen",
  };
  // Init Firebase UI Authentication
  if (!_firebaseUI) {
    _firebaseUI = new firebaseui.auth.AuthUI(firebase.auth());
  }
  _firebaseUI.start("#firebaseui-auth-container", uiConfig);
  showLoader(false);
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

// reference to database
const _db = getFirestore();
// reference to the announcements in the database
const _announcementsRef = collection(_db, "announcements");
let _announcements = [];
// reference to the events in the database
const _eventsRef = collection(_db, "events");
let _events = [];
// reference to users collection in database
const _usersRef = collection(_db, "users");
let _users = [];
let _detailedProfileId;
let _filteredUsers = [];

async function getUserData() {
  const authUser = _auth.currentUser;
  const docRef = doc(_usersRef, authUser.uid);
  const docSnap = await getDoc(docRef);
  const userData = docSnap.data();

  return {
    ...authUser,
    ...userData,
  };
}

// profile read from database
async function appendUserData() {
  const user = await getUserData();
  document.querySelector("#user-data").innerHTML = /*html*/ `
    <img class="profile-img" src="${user.image || "img/>Logo DYT.png"}">
    <h2 class="displayName">${user.name}</h2>
    <div class="profile-info">
    <div class="profile-container">
    <div class="profile-icon-text">
     <h3>Bio </h3>
     <svg xmlns="http://www.w3.org/2000/svg" width="20.254" height="18" viewBox="0 0 20.254 18">
  <path id="Icon_awesome-edit" data-name="Icon awesome-edit" d="M14.157,2.929,17.328,6.1a.344.344,0,0,1,0,.485l-7.68,7.68-3.263.362a.684.684,0,0,1-.756-.756l.362-3.263,7.68-7.68A.344.344,0,0,1,14.157,2.929Zm5.7-.805L18.137.408a1.375,1.375,0,0,0-1.941,0L14.951,1.653a.344.344,0,0,0,0,.485L18.123,5.31a.344.344,0,0,0,.485,0l1.245-1.245A1.375,1.375,0,0,0,19.853,2.124ZM13.5,12.177v3.58H2.25V4.5h8.08a.432.432,0,0,0,.3-.123l1.407-1.407a.422.422,0,0,0-.3-.721H1.688A1.688,1.688,0,0,0,0,3.942V16.319a1.688,1.688,0,0,0,1.688,1.688H14.065a1.688,1.688,0,0,0,1.688-1.688V10.77a.423.423,0,0,0-.721-.3l-1.407,1.407A.432.432,0,0,0,13.5,12.177Z" transform="translate(0 -0.007)" fill="#b2b2b2"/>
</svg>
</div>
    <p class="bio">${user.bio}</p>
    </div>
    <div class="profile-container">
    <div class="profile-icon-text">
    <h3>Contact info </h3>
    <svg xmlns="http://www.w3.org/2000/svg" width="20.254" height="18" viewBox="0 0 20.254 18">
  <path id="Icon_awesome-edit" data-name="Icon awesome-edit" d="M14.157,2.929,17.328,6.1a.344.344,0,0,1,0,.485l-7.68,7.68-3.263.362a.684.684,0,0,1-.756-.756l.362-3.263,7.68-7.68A.344.344,0,0,1,14.157,2.929Zm5.7-.805L18.137.408a1.375,1.375,0,0,0-1.941,0L14.951,1.653a.344.344,0,0,0,0,.485L18.123,5.31a.344.344,0,0,0,.485,0l1.245-1.245A1.375,1.375,0,0,0,19.853,2.124ZM13.5,12.177v3.58H2.25V4.5h8.08a.432.432,0,0,0,.3-.123l1.407-1.407a.422.422,0,0,0-.3-.721H1.688A1.688,1.688,0,0,0,0,3.942V16.319a1.688,1.688,0,0,0,1.688,1.688H14.065a1.688,1.688,0,0,0,1.688-1.688V10.77a.423.423,0,0,0-.721-.3l-1.407,1.407A.432.432,0,0,0,13.5,12.177Z" transform="translate(0 -0.007)" fill="#b2b2b2"/>
</svg>
</div>
    <p class="profile-phone">${user.phone}</p>
    <p class="profile-email">${user.email}</p>
    </div>
  </div>
  `;
}


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
async function appendAnnouncements(announcements) {
  const user = await getUserData();
  document.querySelector(".announcements-container .welcome").textContent =
    "Welcome, " + user.name;
  let html = "";
  for (const announcement of announcements) {
    html += /*html*/ `
      <div class="card">
        <div class="card-name">
          <img src="${announcement.image}"
          <h2 class="announcement-subject">${announcement.name}</h2>
        </div>
        <div class="text-container">
        <h4>${announcement.subject}</h4>
        <p class="announcement-text">${announcement.text}</p>
        </div>
        <button class="card-button">Comment</button>
      </div>
    `;
  }
  document.querySelector(".announcements").innerHTML = html;
}

// ========== CREATE NEW POST ========== //
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

async function createAnnouncement() {
  const user = await getUserData();
  let subjectInput = document.querySelector("#subject");
  let textInput = document.querySelector("#announcement");

  const newAnnouncement = {
    image: user.image,
    name: user.name,
    subject: subjectInput.value,
    text: textInput.value,
  };

  addDoc(_announcementsRef, newAnnouncement);
  confirmPost.addEventListener("click", () => {
    announcementForm.classList.remove("form-active");
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
  appendUsers(_users);
  showLoader(false);
});

// DETAILED VIEW OF PEOPLE
/**
 * Finds a display selected user by given.
 * @param id
 */
function selectUserProfile(id) {
  _detailedProfileId = id;
  const user = _users.find((user) => user.id == _detailedProfileId);
  // get the user details
  let profileImage = document.querySelector("#detailed-profile .profile-image");
  let profileName = document.querySelector("#detailed-profile .displayName");
  let profileBio = document.querySelector("#detailed-profile .bio");
  let profilePhone = document.querySelector(
    "#detailed-profile .detailed-phone"
  );
  let profileEmail = document.querySelector(
    "#detailed-profile .detailed-email"
  );
  profileName.textContent = user.name;
  profileBio.textContent = user.bio;
  profilePhone.textContent = user.phone;
  profileEmail.textContent = user.email;
  profileImage.src = user.image;
  navigateTo("#/detailedProfileView");
}

// append users to the DOM
function appendUsers(users) {
  let htmlTemplate = "";
  for (const user of users) {
    htmlTemplate += /*html*/ `
    <article class="team-list" data-id="${user.id}">
      <img class="profile-picture-team" src="${user.image}">
      <h3 class="team-displayname">${user.name}</h3>
    </article>
    `;
  }
  document.querySelector("#grid-users").innerHTML = htmlTemplate;
  document.querySelectorAll(".team-list").forEach((article) => {
    article.onclick = () => selectUserProfile(article.getAttribute("data-id"));
  });
}

// =========== attach events =========== //
document.querySelector("#btn-logout").onclick = () => logout();

// ========== READ ==========
// onSnapshot: listen for realtime updates from events
onSnapshot(_eventsRef, (snapshot) => {
  _events = snapshot.docs.map((doc) => {
    const event = doc.data();
    event.id = doc.id;
    return event;
  });
  appendEvents(_events);
  // showLoader(false);
});

// ========== Append events to the DOM ========== //
async function appendEvents(events) {
  let html = "";
  for (const event of events) {
    html += `
      <div class="card">
        <div class="card-name">
          <img src="${event.image}"
          <h2 class="event-subject">${event.name}</h2>
        </div>
        <p class="event-titel">${event.titel}</p>
        <div class="card-icon-container">
        <img src="./img/date.png">
         <p class="event-date">${event.date}</p>
        </div>
        <div class="card-icon-container">
        <img src="./img/time.png">
        <p class="event-time">${event.time}</p>
        </div>
        <div class="card-icon-container">
        <img src="./img/place.png">
        <p class="event-place">${event.place}</p>
        </div>
        <p class="event-detailes">${event.event}</p>
        <div class="reaction-buttons">
        <button class="card-button2">Skip :/</button>
        <button class="card-button">Coming :)</button>
        </div>
      </div>
    `;
  }
  document.querySelector(".events").innerHTML = html;
}

// ========== CREATE NEW Event ========== //
const createEventButton = document.querySelector(".create-event");
const eventForm = document.querySelector(".create-event-form");
const confirmEvent = document.querySelector(".create-event-button");
createEventButton.addEventListener("click", () => {
  eventForm.classList.toggle("form-active");
});
const cancelFormButtonEvent = document.querySelector(".cancel-post");
cancelFormButtonEvent.addEventListener("click", () => {
  eventForm.classList.toggle("form-active");
});

async function createEvent() {
  const user = await getUserData();
  let titelInput = document.querySelector("#event-subject");
  let eventDate = document.querySelector("#event-date");
  let eventTime = document.querySelector("#event-time");
  let eventplace = document.querySelector("#event-place");
  let detailInput = document.querySelector("#event-detailes");

  const newEvent = {
    image: user.image,
    name: user.name,
    titel: titelInput.value,
    date: eventDate.value,
    time: eventTime.value,
    place: eventplace.value,
    event: detailInput.value,
  };

  addDoc(_eventsRef, newEvent);
  confirmEvent.addEventListener("click", () => {
    eventForm.classList.remove("form-active");
  });
}

document.querySelector(".create-event-button").onclick = () => createEvent();
