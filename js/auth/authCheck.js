// authCheck.js
firebase.auth().onAuthStateChanged((user) => {
  if (!user) window.location.href = '/auth/login.html';
});