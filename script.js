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

/* ---------- Quizzes (answers come from the lesson content) ---------- */

var quizzes = {
  'lesson-1': [
    {
      question: 'Which class of airspace allows IFR flights only?',
      options: ['Class A', 'Class B', 'Class C'],
      answer: 0,
      explain: 'Class A is IFR only. Classes B and C allow both IFR and VFR.'
    },
    {
      question: 'In Class C, a VFR flight is separated from which traffic?',
      options: ['All aircraft', 'IFR traffic only', 'No one'],
      answer: 1,
      explain: 'In Class C, VFR flights are separated from IFR traffic only.'
    }
  ],
  'lesson-2': [
    {
      question: 'Which service do flights receive in Class G?',
      options: ['Air Traffic Control Service', 'Air Traffic Advisory Service', 'Flight Information Service'],
      answer: 2,
      explain: 'Class G flights, IFR and VFR, receive the Flight Information Service.'
    },
    {
      question: 'In which classes are VFR flights not separated from other traffic?',
      options: ['Only F and G', 'D, E, F and G', 'Only G'],
      answer: 1,
      explain: 'VFR flights get no separation in classes D, E, F and G.'
    }
  ],
  'lesson-3': [
    {
      question: 'What is the minimum flight visibility at and above 10,000 ft AMSL?',
      options: ['5 km', '1.5 km', '8 km'],
      answer: 2,
      explain: 'At and above 10,000 ft AMSL you need 8 km of flight visibility.'
    },
    {
      question: 'At and below 3,000 ft AMSL in Class G, what is required about cloud?',
      options: [
        'Stay clear of cloud with the surface in sight',
        'Stay 1,500 m horizontally and 300 m vertically from cloud',
        'Stay at least 5 km from cloud'
      ],
      answer: 0,
      explain: 'In classes F and G at this height you need to be clear of cloud with the surface in sight.'
    }
  ],
  'lesson-4': [
    {
      question: 'VFR can operate at an aerodrome when the cloud ceiling is more than:',
      options: ['3,000 ft', '1,500 ft', '1,000 ft'],
      answer: 1,
      explain: 'The cloud ceiling must be more than 1,500 ft.'
    },
    {
      question: 'Which of these is a step to take after VFR is suspended?',
      options: [
        'Let VFR departures carry on',
        'Cancel all IFR flights',
        'Hold all VFR departures'
      ],
      answer: 2,
      explain: 'You hold all VFR departures, recall local VFR flights (or get special VFR approval), and notify the right units and operators.'
    }
  ],
  'lesson-5': [
    {
      question: 'What is the minimum ground visibility for a special VFR flight?',
      options: ['1,500 m', '5 km', '8 km'],
      answer: 0,
      explain: 'Ground visibility must not be less than 1,500 m.'
    },
    {
      question: 'Which is a condition for special VFR?',
      options: [
        'The pilot does not need air traffic control approval',
        'Two-way communication is maintained',
        'Ground visibility is below 1,500 m'
      ],
      answer: 1,
      explain: 'Air traffic control must approve the request, and two-way communication must be maintained.'
    }
  ]
};

function markLessonComplete(lessonId) {
  if (completed.indexOf(lessonId) === -1) {
    completed.push(lessonId);
    saveCompleted();
  }
  updateProgress();
}

function buildQuiz(container) {
  var lessonId = container.getAttribute('data-lesson');
  var questions = quizzes[lessonId];
  var correctCount = 0;

  var heading = document.createElement('h3');
  heading.textContent = 'Try it: quick quiz';
  container.appendChild(heading);

  var doneMessage = document.createElement('p');
  doneMessage.className = 'quiz-done';
  doneMessage.hidden = true;
  doneMessage.textContent = 'Lesson complete. Nice work!';

  questions.forEach(function (q, qi) {
    var wrap = document.createElement('div');
    wrap.className = 'question';

    var text = document.createElement('p');
    text.textContent = (qi + 1) + '. ' + q.question;
    wrap.appendChild(text);

    var options = document.createElement('div');
    options.className = 'options';

    var feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('aria-live', 'polite');

    q.options.forEach(function (label, oi) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', function () {
        if (oi === q.answer) {
          button.classList.add('correct');
          feedback.className = 'feedback good';
          feedback.textContent = 'Correct! ' + q.explain;
          Array.prototype.forEach.call(options.children, function (b) {
            b.disabled = true;
          });
          correctCount += 1;
          if (correctCount === questions.length) {
            doneMessage.hidden = false;
            markLessonComplete(lessonId);
          }
        } else {
          button.classList.add('wrong');
          button.disabled = true;
          feedback.className = 'feedback bad';
          feedback.textContent = 'Not quite. Have another go.';
        }
      });
      options.appendChild(button);
    });

    wrap.appendChild(options);
    wrap.appendChild(feedback);
    container.appendChild(wrap);
  });

  container.appendChild(doneMessage);
}

Array.prototype.forEach.call(document.querySelectorAll('.quiz'), buildQuiz);

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
    buildQuiz(container);
  });
});

updateProgress();

var startIndex = lessons.findIndex(function (lesson) {
  return '#' + lesson.id === window.location.hash;
});
showLesson(startIndex === -1 ? 0 : startIndex);
