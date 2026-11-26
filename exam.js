/* =====================================================================
   PROJECT : ExamHub - Online Examination & Assessment System
   FILE    : exam.js   (used by exam.html)

   What this file does:
     1. Stores the questions of every subject
     2. Shows one question at a time with 4 options
     3. Question number buttons (1, 2, 3 ...) to jump around
     4. Countdown timer (auto submit at 00:00)
     5. Warns if the student switches tab
     6. Keyboard shortcuts
     7. Saves the answers and opens result.html
   ===================================================================== */


/* ---------- 1. QUESTIONS ----------
   answer = index of the correct option (0 = first option) */
var allExams = {
  web: {
    title: "Web Development",
    questions: [
      { q: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Link"],
        answer: 0 },
      { q: "Which CSS property changes the text colour?",
        options: ["font-style", "color", "background", "text-size"],
        answer: 1 },
      { q: "Which tag is used to create a hyperlink?",
        options: ["<link>", "<href>", "<a>", "<url>"],
        answer: 2 },
      { q: "Which symbol is used for an id selector in CSS?",
        options: [".", "*", "&", "#"],
        answer: 3 },
      { q: "Which language makes a web page interactive?",
        options: ["JavaScript", "HTML", "CSS", "XML"],
        answer: 0 }
    ]
  },
  ds: {
    title: "Data Structures",
    questions: [
      { q: "Which data structure works on the LIFO principle?",
        options: ["Queue", "Stack", "Array", "Tree"],
        answer: 1 },
      { q: "Which data structure works on the FIFO principle?",
        options: ["Stack", "Graph", "Queue", "Heap"],
        answer: 2 },
      { q: "What is the time complexity of binary search?",
        options: ["O(n)", "O(n^2)", "O(1)", "O(log n)"],
        answer: 3 },
      { q: "Which data structure is used in BFS (breadth first search)?",
        options: ["Queue", "Stack", "Tree", "Array"],
        answer: 0 },
      { q: "A linked list node contains data and a ...",
        options: ["index", "pointer to the next node", "size", "loop"],
        answer: 1 }
    ]
  },
  dbms: {
    title: "Database Management",
    questions: [
      { q: "What does SQL stand for?",
        options: ["Simple Query Logic", "Sorted Question List", "Structured Query Language", "System Query Layer"],
        answer: 2 },
      { q: "Which command is used to get data from a table?",
        options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
        answer: 1 },
      { q: "Which key uniquely identifies every row in a table?",
        options: ["Primary key", "Foreign key", "Candidate row", "Super table"],
        answer: 0 },
      { q: "Which command removes a table completely?",
        options: ["REMOVE", "CLEAR", "DELETE ROW", "DROP"],
        answer: 3 },
      { q: "Which normal form removes repeating groups?",
        options: ["First normal form", "Second normal form", "Third normal form", "BCNF"],
        answer: 0 }
    ]
  },
  os: {
    title: "Operating System",
    questions: [
      { q: "Which of these is an operating system?",
        options: ["Chrome", "Linux", "Python", "MySQL"],
        answer: 1 },
      { q: "What is a process?",
        options: ["A file on disk", "A type of memory", "A program in execution", "A hardware device"],
        answer: 2 },
      { q: "Which scheduling algorithm gives the CPU to the process that comes first?",
        options: ["Round Robin", "Priority", "SJF", "FCFS"],
        answer: 3 },
      { q: "A deadlock happens when processes ...",
        options: ["wait for each other forever", "finish very fast", "use too little memory", "are deleted"],
        answer: 0 },
      { q: "Which memory is the fastest?",
        options: ["Hard disk", "RAM", "Cache", "Pen drive"],
        answer: 2 }
    ]
  }
};


/* ---------- find which subject the student chose (from the URL) ---------- */
var params = new URLSearchParams(window.location.search);
var subjectKey = params.get("subject");
var roll = params.get("roll") || sessionStorage.getItem("examhubRoll") || "Student";

// if the subject is missing or wrong, use Web Development
if (allExams[subjectKey] === undefined) {
  subjectKey = "web";
}

var exam = allExams[subjectKey];
var questions = exam.questions;


/* ---------- page elements ---------- */
var examTitle    = document.getElementById("examTitle");
var examMeta     = document.getElementById("examMeta");
var timeLeftSpan = document.getElementById("timeLeft");
var timerBadge   = document.getElementById("timerBadge");
var progressFill = document.getElementById("progressFill");
var warningBox   = document.getElementById("warningBox");
var tracker      = document.getElementById("tracker");
var questionText = document.getElementById("questionText");
var optionsBox   = document.getElementById("options");
var prevBtn      = document.getElementById("prevBtn");
var nextBtn      = document.getElementById("nextBtn");


/* ---------- variables that change while the exam runs ---------- */
var currentIndex = 0;                       // which question is on screen
var answers = [];                           // answers[0] = option chosen for Q1
var secondsLeft = 10 * 60;                  // 10 minutes
var tabWarnings = 0;
var finished = false;

// no answer yet = null
for (var i = 0; i < questions.length; i++) {
  answers.push(null);
}

examTitle.textContent = exam.title + " - Unit Test";


/* ---------- 3. Question number buttons ---------- */
function buildTracker() {
  tracker.innerHTML = "";

  for (var i = 0; i < questions.length; i++) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "q-num";
    btn.textContent = i + 1;
    btn.setAttribute("data-index", i);

    btn.addEventListener("click", function () {
      currentIndex = Number(this.getAttribute("data-index"));
      showQuestion();
    });

    tracker.appendChild(btn);
  }
}

function updateTracker() {
  var buttons = tracker.querySelectorAll(".q-num");

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("current");
    buttons[i].classList.remove("answered");

    if (answers[i] !== null) {
      buttons[i].classList.add("answered");
    }
    if (i === currentIndex) {
      buttons[i].classList.add("current");
    }
  }
}


/* ---------- count answered questions ---------- */
function countAnswered() {
  var count = 0;
  for (var i = 0; i < answers.length; i++) {
    if (answers[i] !== null) {
      count++;
    }
  }
  return count;
}

function updateProgress() {
  var percent = (countAnswered() / questions.length) * 100;
  progressFill.style.width = percent + "%";
  examMeta.textContent = "Question " + (currentIndex + 1) + " of " + questions.length +
                         "  |  Answered: " + countAnswered();
}


/* ---------- 2. Show one question ---------- */
function showQuestion() {
  var q = questions[currentIndex];

  questionText.textContent = (currentIndex + 1) + ". " + q.q;
  optionsBox.innerHTML = "";

  for (var i = 0; i < q.options.length; i++) {
    var label = document.createElement("label");
    label.className = "option";

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = i;

    var text = document.createElement("span");
    text.textContent = q.options[i];

    // already answered before? show it as selected
    if (answers[currentIndex] === i) {
      radio.checked = true;
      label.classList.add("selected");
    }

    radio.addEventListener("change", function () {
      chooseOption(Number(this.value));
    });

    label.appendChild(radio);
    label.appendChild(text);
    optionsBox.appendChild(label);
  }

  // Previous button is disabled on the first question
  prevBtn.disabled = (currentIndex === 0);

  // last question: Next button becomes Submit
  if (currentIndex === questions.length - 1) {
    nextBtn.innerHTML = "Submit exam";
  } else {
    nextBtn.innerHTML = "Next question &rarr;";
  }

  updateTracker();
  updateProgress();
}

function chooseOption(index) {
  answers[currentIndex] = index;
  showQuestion();
}


/* ---------- Previous / Next buttons ---------- */
function goNext() {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    submitExam(false);
  }
}

function goPrevious() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

prevBtn.addEventListener("click", goPrevious);
nextBtn.addEventListener("click", goNext);


/* ---------- 4. Timer ---------- */
function showTime() {
  var minutes = Math.floor(secondsLeft / 60);
  var seconds = secondsLeft % 60;

  // add a zero in front: 5 becomes 05
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }

  timeLeftSpan.textContent = minutes + ":" + seconds;

  // last minute: badge turns red
  if (secondsLeft <= 60) {
    timerBadge.classList.remove("badge-soon");
    timerBadge.classList.add("badge-danger");
  }
}

var timer = setInterval(function () {
  secondsLeft--;
  showTime();

  if (secondsLeft <= 0) {
    submitExam(true);       // time is over
  }
}, 1000);


/* ---------- 5. Tab switch warning ---------- */
document.addEventListener("visibilitychange", function () {
  if (document.hidden && finished === false) {
    tabWarnings++;
    warningBox.textContent = "Warning " + tabWarnings + " of 3: you left the exam tab. " +
                             "After 3 warnings the exam will be submitted automatically.";
    warningBox.classList.add("show");

    if (tabWarnings >= 3) {
      submitExam(true);
    }
  }
});


/* ---------- 6. Keyboard shortcuts ---------- */
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    goNext();
  } else if (event.key === "ArrowLeft") {
    goPrevious();
  } else if (event.key >= "1" && event.key <= "4") {
    var optionNumber = Number(event.key) - 1;
    if (optionNumber < questions[currentIndex].options.length) {
      chooseOption(optionNumber);
    }
  }
});


/* ---------- 7. Submit the exam ---------- */
function submitExam(automatic) {
  if (finished) {
    return;
  }

  // ask for confirmation only when the student clicked Submit himself
  if (automatic === false) {
    var left = questions.length - countAnswered();
    var message = "Do you want to submit the exam?";
    if (left > 0) {
      message = "You have " + left + " unanswered question(s). Submit anyway?";
    }
    if (confirm(message) === false) {
      return;
    }
  }

  finished = true;
  clearInterval(timer);

  // save everything for result.html
  var result = {
    subject: exam.title,
    roll: roll,
    questions: questions,
    answers: answers,
    warnings: tabWarnings,
    autoSubmitted: automatic
  };
  sessionStorage.setItem("examhubResult", JSON.stringify(result));

  window.location.href = "result.html";
}


/* ---------- start the exam ---------- */
buildTracker();
showQuestion();
showTime();
