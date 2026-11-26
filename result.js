/* =====================================================================
   PROJECT : ExamHub - Online Examination & Assessment System
   FILE    : result.js   (used by result.html)

   What this file does:
     1. Reads the saved answers from exam.js
     2. Counts correct / wrong / skipped answers
     3. Fills the score ring and the numbers
     4. Builds the "Review your answers" list
     5. Print button
   ===================================================================== */

var PASS_PERCENT = 40;

var saved = sessionStorage.getItem("examhubResult");

var heading      = document.getElementById("resultHeading");
var subjectName  = document.getElementById("subjectName");
var studentLine  = document.getElementById("studentLine");
var scoreRing    = document.getElementById("scoreRing");
var scorePercent = document.getElementById("scorePercent");
var resultMsg    = document.getElementById("resultMessage");
var resultNote   = document.getElementById("resultNote");
var correctSpan  = document.getElementById("correctCount");
var wrongSpan    = document.getElementById("wrongCount");
var skippedSpan  = document.getElementById("skippedCount");
var reviewBox    = document.getElementById("reviewBox");
var reviewList   = document.getElementById("reviewList");
var printBtn     = document.getElementById("printBtn");


/* ---------- Print button ---------- */
printBtn.addEventListener("click", function () {
  window.print();
});


if (saved === null) {
  /* the student opened result.html directly, there is no data */
  heading.textContent = "No result found";
  resultMsg.textContent = "Please take a test first, then your result will appear here.";
} else {
  showResult(JSON.parse(saved));
}


function showResult(data) {
  var questions = data.questions;
  var answers = data.answers;

  var correct = 0;
  var wrong = 0;
  var skipped = 0;

  /* ---------- 2. Count correct / wrong / skipped ---------- */
  for (var i = 0; i < questions.length; i++) {
    if (answers[i] === null) {
      skipped++;
    } else if (answers[i] === questions[i].answer) {
      correct++;
    } else {
      wrong++;
    }
  }

  var percent = Math.round((correct / questions.length) * 100);
  var passed = percent >= PASS_PERCENT;

  /* ---------- 3. Fill the page ---------- */
  subjectName.textContent = data.subject;
  studentLine.textContent = "Enrollment: " + data.roll;
  correctSpan.textContent = correct;
  wrongSpan.textContent = wrong;
  skippedSpan.textContent = skipped;

  if (passed) {
    heading.textContent = "Test completed!";
    resultMsg.textContent = "Well done! You passed with " + correct + " out of " + questions.length + ".";
  } else {
    heading.textContent = "Test completed";
    resultMsg.textContent = "You need " + PASS_PERCENT + "% to pass. Keep practising, you can do better!";
    scoreRing.style.setProperty("--ring", "var(--rose)");
  }

  // note for auto submit and tab warnings
  var notes = "";
  if (data.autoSubmitted) {
    notes = "Your exam was submitted automatically. ";
  }
  if (data.warnings > 0) {
    notes = notes + "Tab switch warnings: " + data.warnings + ".";
  }
  if (notes !== "") {
    resultNote.textContent = notes;
    resultNote.hidden = false;
  }

  /* ---------- animate the ring from 0 to the final score ---------- */
  var shown = 0;
  var counter = setInterval(function () {
    if (shown >= percent) {
      clearInterval(counter);
    } else {
      shown++;
    }
    scoreRing.style.setProperty("--score", shown);
    scorePercent.textContent = shown + "%";
  }, 15);

  /* ---------- 4. Review your answers ---------- */
  for (var j = 0; j < questions.length; j++) {
    var item = document.createElement("div");
    item.className = "review-item";

    var title = document.createElement("strong");
    title.textContent = "Q" + (j + 1) + ". " + questions[j].q;

    var yourLine = document.createElement("small");
    var correctLine = document.createElement("small");
    correctLine.textContent = "Correct answer: " + questions[j].options[questions[j].answer];

    if (answers[j] === null) {
      item.classList.add("skipped");
      yourLine.textContent = "Your answer: not answered";
    } else if (answers[j] === questions[j].answer) {
      item.classList.add("right");
      yourLine.textContent = "Your answer: " + questions[j].options[answers[j]];
    } else {
      item.classList.add("wrong");
      yourLine.textContent = "Your answer: " + questions[j].options[answers[j]];
    }

    item.appendChild(title);
    item.appendChild(yourLine);
    if (answers[j] !== questions[j].answer) {
      item.appendChild(correctLine);     // show the right answer only if the student missed it
    }
    reviewList.appendChild(item);
  }

  reviewBox.hidden = false;
}
