/* =====================================================================
   PROJECT : ExamHub - Online Examination & Assessment System
   FILE    : login.js   (used by login.html)

   What this file does:
     1. Show / Hide password button
     2. Checks the form before the exam starts
     3. Shows an error message (and shakes the box) if something is wrong
     4. Opens exam.html with the chosen subject
   ===================================================================== */

var loginForm   = document.getElementById("loginForm");
var rollInput   = document.getElementById("roll");
var passInput   = document.getElementById("password");
var subjectBox  = document.getElementById("subject");
var agreeBox    = document.getElementById("agree");
var errorBox    = document.getElementById("loginError");
var toggleBtn   = document.getElementById("togglePass");
var authBox     = document.querySelector(".auth-box");


/* ---------- 1. Show / Hide password ---------- */
toggleBtn.addEventListener("click", function () {
  if (passInput.type === "password") {
    passInput.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    passInput.type = "password";
    toggleBtn.textContent = "Show";
  }
});


/* ---------- helper functions ---------- */
function showError(message, field) {
  errorBox.textContent = message;
  errorBox.classList.add("show");

  if (field) {
    field.classList.add("invalid");
    field.focus();
  }

  // shake animation (remove the class first so it can play again)
  authBox.classList.remove("shake");
  void authBox.offsetWidth;
  authBox.classList.add("shake");
}

function clearErrors() {
  errorBox.classList.remove("show");
  rollInput.classList.remove("invalid");
  passInput.classList.remove("invalid");
  subjectBox.classList.remove("invalid");
}

// remove the red border as soon as the student starts typing again
rollInput.addEventListener("input", clearErrors);
passInput.addEventListener("input", clearErrors);
subjectBox.addEventListener("change", clearErrors);


/* ---------- 2. Check the form when Start exam is clicked ---------- */
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();       // do not submit yet, check first
  clearErrors();

  var roll = rollInput.value.trim();
  var password = passInput.value;
  var subject = subjectBox.value;

  if (roll === "") {
    showError("Please enter your enrollment number.", rollInput);
    return;
  }

  if (roll.length < 5) {
    showError("Enrollment number must be at least 5 characters.", rollInput);
    return;
  }

  if (password === "") {
    showError("Please enter your password.", passInput);
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters.", passInput);
    return;
  }

  if (subject === "") {
    showError("Please select a subject.", subjectBox);
    return;
  }

  if (agreeBox.checked === false) {
    showError("Please tick the box to confirm you have read the exam rules.", agreeBox);
    return;
  }

  /* ---------- 4. All good: open the exam page ---------- */
  sessionStorage.setItem("examhubRoll", roll);
  window.location.href = "exam.html?subject=" + subject + "&roll=" + encodeURIComponent(roll);
});
