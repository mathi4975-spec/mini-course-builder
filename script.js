document.documentElement.classList.add('js');

var lessons = Array.prototype.slice.call(document.querySelectorAll('.lesson'));
var navButtons = Array.prototype.slice.call(document.querySelectorAll('#lesson-nav button'));
var prevButton = document.getElementById('prev-lesson');
var nextButton = document.getElementById('next-lesson');
var themeButton = document.getElementById('theme-toggle');
var resetButton = document.getElementById('reset-progress');
var progressFill = document.getElementById('progress-fill');
var progressText = document.getElementById('progress-text');
var currentIndex = 0;

/* ---------- Saved progress ---------- */

var completed = [];
try {
  completed = JSON.parse(localStorage.getItem('completed')) || [];
} catch (e) {
  completed = [];
}

function saveCompleted() {
  try {
    localStorage.setItem('completed', JSON.stringify(completed));
  } catch (e) {
    // Saving is optional; progress still shows for this visit.
  }
}

function updateProgress() {
  navButtons.forEach(function (button, i) {
    var done = completed.indexOf(lessons[i].id) !== -1;
    button.setAttribute('data-done', done ? 'true' : 'false');
    button.setAttribute('aria-label', button.textContent.replace(/\s+/g, ' ').trim() + (done ? ' (completed)' : ''));
  });
  progressFill.style.width = (completed.length / lessons.length * 100) + '%';
  progressText.textContent = completed.length + ' of ' + lessons.length + ' lessons complete';
}

/* ---------- Switching lessons ---------- */

function showLesson(index) {
  currentIndex = index;
  lessons.forEach(function (lesson, i) {
    lesson.classList.toggle('active', i === index);
  });
  navButtons.forEach(function (button, i) {
    if (i === index) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
  prevButton.disabled = index === 0;
  nextButton.disabled = index === lessons.length - 1;
  window.scrollTo(0, 0);
  history.replaceState(null, '', '#' + lessons[index].id);
}

navButtons.forEach(function (button, i) {
  button.addEventListener('click', function () {
    showLesson(i);
  });
});
prevButton.addEventListener('click', function () {
  showLesson(currentIndex - 1);
});
nextButton.addEventListener('click', function () {
  showLesson(currentIndex + 1);
});

/* ---------- Theme ---------- */

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeButton.textContent = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    // Saving is optional; the toggle still works without it.
  }
}

themeButton.addEventListener('click', function () {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

var savedTheme = 'light';
try {
  savedTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
} catch (e) {
  // Fall back to the default light theme.
}
setTheme(savedTheme);

/* ---------- Check-in questions (one per lesson, answers come from the lesson content) ---------- */

var checkIns = {
  'lesson-1': {
    question: 'In Class C, a VFR flight is separated from which traffic?',
    options: ['All aircraft', 'IFR traffic only', 'No one'],
    answer: 1,
    explain: 'In Class C, VFR flights are separated from IFR traffic only.'
  },
  'lesson-2': {
    question: 'In which classes are VFR flights not separated from other traffic?',
    options: ['Only F and G', 'D, E, F and G', 'Only G'],
    answer: 1,
    explain: 'VFR flights get no separation in classes D, E, F and G.'
  },
  'lesson-3': {
    question: 'What is the minimum flight visibility at and above 10,000 ft AMSL?',
    options: ['5 km', '1.5 km', '8 km'],
    answer: 2,
    explain: 'At and above 10,000 ft AMSL you need 8 km of flight visibility.'
  },
  'lesson-4': {
    question: 'Which of these is a step to take after VFR is suspended?',
    options: [
      'Let VFR departures carry on',
      'Cancel all IFR flights',
      'Hold all VFR departures'
    ],
    answer: 2,
    explain: 'You hold all VFR departures, recall local VFR flights (or get special VFR approval), and notify the right units and operators.'
  },
  'lesson-5': {
    question: 'What does a pilot need before flying special VFR in a control zone below VMC?',
    options: [
      'Nothing, the pilot decides alone',
      'Air traffic control approval of the request',
      'A cloud ceiling of more than 1,500 ft'
    ],
    answer: 1,
    explain: 'Special VFR is only permitted if air traffic control approves the pilot\'s request (with ground visibility of at least 1,500 m and two-way communication).'
  }
};

function markLessonComplete(lessonId) {
  if (completed.indexOf(lessonId) === -1) {
    completed.push(lessonId);
    saveCompleted();
  }
  updateProgress();
}

function buildCheckIn(container) {
  var lessonId = container.getAttribute('data-lesson');
  var lessonIndex = lessons.findIndex(function (lesson) {
    return lesson.id === lessonId;
  });
  var q = checkIns[lessonId];

  var heading = document.createElement('h3');
  heading.textContent = 'Check-in';
  container.appendChild(heading);

  var text = document.createElement('p');
  text.className = 'question-text';
  text.textContent = q.question;
  container.appendChild(text);

  var options = document.createElement('div');
  options.className = 'options';

  var feedback = document.createElement('p');
  feedback.className = 'feedback';
  feedback.setAttribute('aria-live', 'polite');

  var continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'continue';
  continueButton.hidden = true;
  if (lessonIndex < lessons.length - 1) {
    continueButton.textContent = 'Continue to the next lesson';
    continueButton.addEventListener('click', function () {
      showLesson(lessonIndex + 1);
    });
  } else {
    continueButton.textContent = 'Back to the first lesson';
    continueButton.addEventListener('click', function () {
      showLesson(0);
    });
  }

  var buttons = q.options.map(function (label, oi) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.disabled = true;
      });
      if (oi === q.answer) {
        button.classList.add('correct');
        feedback.className = 'feedback good';
        feedback.textContent = 'Correct! ' + q.explain;
      } else {
        button.classList.add('wrong');
        buttons[q.answer].classList.add('correct');
        feedback.className = 'feedback bad';
        feedback.textContent = 'Not quite. ' + q.explain;
      }
      continueButton.hidden = false;
      markLessonComplete(lessonId);
    });
    options.appendChild(button);
    return button;
  });

  container.appendChild(options);
  container.appendChild(feedback);
  container.appendChild(continueButton);
}

Array.prototype.forEach.call(document.querySelectorAll('.quiz'), buildCheckIn);

/* ---------- Class lookup (lesson 2) ---------- */

var lookupData = {
  A: {
    IFR: { sep: 'All aircraft', services: ['Air Traffic Control Service'] },
    VFR: { notAllowed: true }
  },
  B: {
    IFR: { sep: 'All aircraft', services: ['Air Traffic Control Service'] },
    VFR: { sep: 'All aircraft', services: ['Air Traffic Control Service'] }
  },
  C: {
    IFR: { sep: 'IFR from IFR and IFR from VFR', services: ['Air Traffic Control Service'] },
    VFR: {
      sep: 'VFR from IFR',
      services: [
        'Air Traffic Control Service for separation from IFR',
        'VFR/VFR traffic information service (and traffic avoidance advice on request)'
      ]
    }
  },
  D: {
    IFR: {
      sep: 'IFR from IFR',
      services: [
        'Air Traffic Control Service',
        'Traffic information about VFR (and traffic avoidance advice on request)'
      ]
    },
    VFR: {
      sep: 'None',
      services: ['IFR/IFR and VFR/VFR information service (and traffic avoidance advice on request)']
    }
  },
  E: {
    IFR: {
      sep: 'IFR from IFR',
      services: ['Air Traffic Control Service', 'Traffic information about VFR flights']
    },
    VFR: { sep: 'None', services: ['Traffic information'] }
  },
  F: {
    IFR: {
      sep: 'IFR from IFR',
      services: ['Air Traffic Advisory Service', 'Flight Information Service']
    },
    VFR: { sep: 'None', services: ['Flight Information Service'] }
  },
  G: {
    IFR: { sep: 'None', services: ['Flight Information Service'] },
    VFR: { sep: 'None', services: ['Flight Information Service'] }
  }
};

var classBox = document.getElementById('lookup-classes');
var flightBox = document.getElementById('lookup-flights');
var resultBox = document.getElementById('lookup-result');
var chosenClass = null;
var chosenFlight = null;

function showLookup() {
  resultBox.textContent = '';
  if (!chosenClass || !chosenFlight) {
    resultBox.textContent = 'Choose a class and a type of flight.';
    return;
  }
  var info = lookupData[chosenClass][chosenFlight];
  var title = document.createElement('p');
  var strong = document.createElement('strong');
  strong.textContent = 'Class ' + chosenClass + ', ' + chosenFlight;
  title.appendChild(strong);
  resultBox.appendChild(title);

  if (info.notAllowed) {
    var no = document.createElement('p');
    no.textContent = 'Class A is for IFR flights only, so VFR flights are not allowed here.';
    resultBox.appendChild(no);
    return;
  }

  var sep = document.createElement('p');
  sep.textContent = 'Separation provided: ' + info.sep;
  resultBox.appendChild(sep);

  var label = document.createElement('p');
  label.textContent = 'Service provided:';
  resultBox.appendChild(label);

  var list = document.createElement('ul');
  info.services.forEach(function (service) {
    var item = document.createElement('li');
    item.textContent = service;
    list.appendChild(item);
  });
  resultBox.appendChild(list);
}

function pressOnly(container, chosen) {
  Array.prototype.forEach.call(container.querySelectorAll('button'), function (button) {
    button.setAttribute('aria-pressed', button === chosen ? 'true' : 'false');
  });
}

Object.keys(lookupData).forEach(function (letter) {
  var button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Class ' + letter;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', function () {
    chosenClass = letter;
    pressOnly(classBox, button);
    showLookup();
  });
  classBox.appendChild(button);
});

Array.prototype.forEach.call(flightBox.querySelectorAll('button'), function (button) {
  button.addEventListener('click', function () {
    chosenFlight = button.getAttribute('data-flight');
    pressOnly(flightBox, button);
    showLookup();
  });
});

/* ---------- Reset and start-up ---------- */

resetButton.addEventListener('click', function () {
  completed = [];
  saveCompleted();
  updateProgress();
  Array.prototype.forEach.call(document.querySelectorAll('.quiz'), function (container) {
    container.textContent = '';
    buildCheckIn(container);
  });
});

updateProgress();

var startIndex = lessons.findIndex(function (lesson) {
  return '#' + lesson.id === window.location.hash;
});
showLesson(startIndex === -1 ? 0 : startIndex);
