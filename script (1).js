/* =====================================================================
   PROJECT : ExamHub - Online Examination & Assessment System
   FILE    : script.js   (used by index.html)

   What this file does:
     1. Shows the current year in the footer
     2. Counts up the numbers in the stats section
     3. Back to top button
     4. Highlights the nav link of the section on screen
     5. Fade-in effect while scrolling
     6. Registration form message
   ===================================================================== */


/* ---------- 1. Current year in footer ---------- */
var yearSpan = document.getElementById("year");
yearSpan.textContent = new Date().getFullYear();


/* ---------- 2. Counting numbers (12,400 / 340 / 96% / 28) ---------- */
var counters = document.querySelectorAll("[data-count]");

function runCounter(element) {
  var target = Number(element.getAttribute("data-count"));
  var suffix = element.getAttribute("data-suffix") || "";
  var current = 0;
  var step = target / 60;            // reach the target in about 60 steps

  var timer = setInterval(function () {
    current = current + step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString("en-IN") + suffix;
  }, 25);
}

// start counting only when the stats come on screen
var counterObserver = new IntersectionObserver(function (entries) {
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].isIntersecting) {
      runCounter(entries[i].target);
      counterObserver.unobserve(entries[i].target);   // run only once
    }
  }
});

for (var c = 0; c < counters.length; c++) {
  counterObserver.observe(counters[c]);
}


/* ---------- 3. Back to top button ---------- */
var toTop = document.getElementById("toTop");

toTop.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


/* ---------- 4. Active nav link ---------- */
var sections = document.querySelectorAll("main section[id]");
var navLinks = document.querySelectorAll(".nav-links a");

function updateActiveLink() {
  var scrollPosition = window.scrollY + 120;
  var currentId = "";

  for (var i = 0; i < sections.length; i++) {
    if (scrollPosition >= sections[i].offsetTop) {
      currentId = sections[i].id;
    }
  }

  for (var j = 0; j < navLinks.length; j++) {
    navLinks[j].classList.remove("active");
    if (navLinks[j].getAttribute("href") === "#" + currentId) {
      navLinks[j].classList.add("active");
    }
  }
}


/* ---------- one scroll event for back-to-top and nav ---------- */
window.addEventListener("scroll", function () {
  if (window.scrollY > 400) {
    toTop.classList.add("show");
  } else {
    toTop.classList.remove("show");
  }
  updateActiveLink();
});


/* ---------- 5. Fade-in while scrolling ---------- */
var revealItems = document.querySelectorAll("main section .section-head, .table-wrap, .quote, .cta-band, .form-box");

var revealObserver = new IntersectionObserver(function (entries) {
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].isIntersecting) {
      entries[i].target.classList.add("visible");
      revealObserver.unobserve(entries[i].target);
    }
  }
}, { threshold: 0.15 });

for (var r = 0; r < revealItems.length; r++) {
  revealItems[r].classList.add("reveal");
  revealObserver.observe(revealItems[r]);
}


/* ---------- 6. Registration form ---------- */
var registerForm = document.querySelector("#register form");
var registerMessage = document.getElementById("registerMessage");

if (registerForm && registerMessage) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();                 // stop the page from reloading

    var name = document.getElementById("fname").value.trim();
    var subject = document.getElementById("subject");
    var subjectName = subject.options[subject.selectedIndex].text;
    var mode = registerForm.elements["mode"].value;

    registerMessage.textContent =
      "Thank you, " + name + "! You are registered for " + subjectName +
      " (" + mode + " mode). A confirmation will be sent to your email.";
    registerMessage.classList.add("show");
    registerMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });   // make sure the message is visible

    registerForm.reset();
  });
}
