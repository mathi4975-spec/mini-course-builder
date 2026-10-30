document.documentElement.classList.add('js');

function setHash(hash) {
  try {
    history.replaceState(null, '', hash);
  } catch (e) {
    // Some browsers block this for local files; the page works without it.
  }
}

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

/* ---------- Tabs ---------- */

var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]'));
var panels = {
  lesson: document.getElementById('panel-lesson'),
  quiz: document.getElementById('panel-quiz'),
  simulator: document.getElementById('panel-simulator')
};

function showTab(name) {
  tabButtons.forEach(function (tab) {
    var active = tab.getAttribute('data-tab') === name;
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
  });
  Object.keys(panels).forEach(function (key) {
    panels[key].hidden = key !== name;
  });
  if (name !== 'lesson') {
    window.scrollTo(0, 0);
    setHash('#' + name);
  }
}

tabButtons.forEach(function (tab, i) {
  tab.addEventListener('click', function () {
    var name = tab.getAttribute('data-tab');
    if (name === 'lesson') {
      showLesson(currentIndex);
    } else {
      showTab(name);
    }
  });
  tab.addEventListener('keydown', function (event) {
    var next = null;
    if (event.key === 'ArrowRight') {
      next = tabButtons[(i + 1) % tabButtons.length];
    } else if (event.key === 'ArrowLeft') {
      next = tabButtons[(i + tabButtons.length - 1) % tabButtons.length];
    }
    if (next) {
      event.preventDefault();
      next.focus();
      next.click();
    }
  });
});

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
  showTab('lesson');
  window.scrollTo(0, 0);
  setHash('#' + lessons[index].id);
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
    continueButton.textContent = 'Continue to the quiz';
    continueButton.addEventListener('click', function () {
      showTab('quiz');
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

/* ---------- Aerodrome weather simulator ---------- */

var simCeiling = document.getElementById('sim-ceiling');
var simVis = document.getElementById('sim-vis');
var simComms = document.getElementById('sim-comms');
var simTimes = document.querySelectorAll('input[name="sim-time"]');
var simResult = document.getElementById('sim-result');
var simScene = document.getElementById('sim-scene');

var simPresets = {
  clear: { ceiling: 2500, vis: 8, time: 'day', comms: true },
  cloud: { ceiling: 800, vis: 8, time: 'day', comms: true },
  vis: { ceiling: 2500, vis: 3, time: 'day', comms: true },
  night: { ceiling: 2500, vis: 8, time: 'night', comms: true },
  marginal: { ceiling: 1500, vis: 5, time: 'day', comms: true }
};

var suspendSteps = [
  'Hold all VFR departures.',
  'Recall all local flights operating under VFR, or obtain approval for special VFR operations.',
  'Notify the approach control unit or ACC, as appropriate, of the action taken.',
  'Notify all operators, or their designated representatives, of the reason for taking such action, if necessary or if they ask.'
];

function simText(tag, text, className) {
  var node = document.createElement(tag);
  node.textContent = text;
  if (className) {
    node.className = className;
  }
  return node;
}

function simChecklist(items) {
  var list = document.createElement('ul');
  items.forEach(function (item) {
    list.appendChild(simText('li', item.text, item.pass ? 'pass' : 'fail'));
  });
  return list;
}

function formatFeet(n) {
  return n.toLocaleString('en-US') + ' ft';
}

function updateSimulator() {
  var ceiling = Number(simCeiling.value);
  var vis = Number(simVis.value);
  var isDay = document.querySelector('input[name="sim-time"]:checked').value === 'day';

  document.getElementById('sim-ceiling-out').textContent = formatFeet(ceiling);
  document.getElementById('sim-vis-out').textContent = vis.toFixed(1) + ' km';

  simScene.classList.toggle('night', !isDay);
  document.getElementById('sim-cloud').style.bottom = (ceiling / 3000 * 80 + 10) + '%';
  document.querySelector('.sim-limit').style.bottom = (1500 / 3000 * 80 + 10) + '%';
  document.getElementById('sim-haze').style.opacity = (1 - Math.min(vis, 10) / 10) * 0.85;

  var ceilingOk = ceiling > 1500;
  var visOk = vis > 5;
  var vfrOk = ceilingOk && visOk && isDay;

  simResult.textContent = '';
  simResult.appendChild(simText('p', vfrOk ? 'VFR can operate at the aerodrome' : 'VFR must be suspended', 'sim-status ' + (vfrOk ? 'ok' : 'bad')));

  simResult.appendChild(simText('h3', 'Conditions for VFR'));
  simResult.appendChild(simChecklist([
    { pass: ceilingOk, text: 'Cloud ceiling more than 1,500 ft (now ' + formatFeet(ceiling) + ')' },
    { pass: visOk, text: 'Ground visibility more than 5 km (now ' + vis.toFixed(1) + ' km)' },
    { pass: isDay, text: 'Between sunrise and sunset (' + (isDay ? 'yes' : 'no') + ')' }
  ]));

  if (vfrOk) {
    return;
  }

  simResult.appendChild(simText('h3', 'Steps to take now that VFR is suspended'));
  var steps = document.createElement('ol');
  suspendSteps.forEach(function (step) {
    steps.appendChild(simText('li', step));
  });
  simResult.appendChild(steps);

  var visSvfr = vis >= 1.5;
  var commsOk = simComms.checked;
  simResult.appendChild(simText('h3', 'Could special VFR be an option?'));
  simResult.appendChild(simChecklist([
    { pass: visSvfr, text: 'Ground visibility not less than 1,500 m (now ' + Math.round(vis * 1000).toLocaleString('en-US') + ' m)' },
    { pass: commsOk, text: 'Two-way communication is maintained (' + (commsOk ? 'yes' : 'no') + ')' }
  ]));
  if (visSvfr && commsOk) {
    simResult.appendChild(simText('p', 'Both conditions are met, so special VFR may be possible. It is only permitted if air traffic control approves the pilot\'s request.'));
  } else {
    simResult.appendChild(simText('p', 'Special VFR is not permitted while these conditions are not met.'));
  }
}

function applySimPreset(name) {
  var preset = simPresets[name];
  simCeiling.value = preset.ceiling;
  simVis.value = preset.vis;
  simComms.checked = preset.comms;
  Array.prototype.forEach.call(simTimes, function (radio) {
    radio.checked = radio.value === preset.time;
  });
  updateSimulator();
}

[simCeiling, simVis, simComms].forEach(function (input) {
  input.addEventListener('input', updateSimulator);
});
Array.prototype.forEach.call(simTimes, function (radio) {
  radio.addEventListener('change', updateSimulator);
});
Array.prototype.forEach.call(document.querySelectorAll('[data-preset]'), function (button) {
  button.addEventListener('click', function () {
    applySimPreset(button.getAttribute('data-preset'));
  });
});
updateSimulator();

/* ---------- Quiz tab (eight questions across the whole course) ---------- */

var finalQuiz = [
  {
    question: 'Which class of airspace allows IFR flights only?',
    options: ['Class A', 'Class B', 'Class C'],
    answer: 0,
    explain: 'Class A is IFR only. Classes B and C allow both IFR and VFR.'
  },
  {
    question: 'Which statement about Class B is correct?',
    options: [
      'Only IFR flights are allowed',
      'Every aircraft is separated from every other aircraft',
      'VFR flights receive no separation'
    ],
    answer: 1,
    explain: 'In Class B, both IFR and VFR flights are allowed and all aircraft are separated, with Air Traffic Control Service provided.'
  },
  {
    question: 'Which service do flights receive in Class G?',
    options: ['Air Traffic Control Service', 'Air Traffic Advisory Service', 'Flight Information Service'],
    answer: 2,
    explain: 'Class G flights, IFR and VFR, receive the Flight Information Service.'
  },
  {
    question: 'What do VFR flights receive in Class E?',
    options: ['Air Traffic Control Service', 'Traffic information only', 'Air Traffic Advisory Service'],
    answer: 1,
    explain: 'In Class E, VFR flights get no separation, only traffic information.'
  },
  {
    question: 'What is the minimum flight visibility below 10,000 ft AMSL and above 3,000 ft AMSL (or 1,000 ft above terrain, whichever is higher)?',
    options: ['8 km', '5 km', '1.5 km'],
    answer: 1,
    explain: 'In this band you need 5 km of flight visibility. At and above 10,000 ft AMSL it is 8 km.'
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
  },
  {
    question: 'Which set of conditions allows VFR to operate at an aerodrome?',
    options: [
      'Ceiling more than 1,000 ft, visibility more than 8 km, any time of day',
      'Ceiling more than 3,000 ft, visibility more than 1.5 km, daytime only',
      'Ceiling more than 1,500 ft, visibility more than 5 km, between sunrise and sunset'
    ],
    answer: 2,
    explain: 'VFR needs a ceiling above 1,500 ft, ground visibility above 5 km, and daylight between sunrise and sunset.'
  },
  {
    question: 'What is a special VFR flight?',
    options: [
      'A VFR flight that does not need air traffic control',
      'A flight cleared by air traffic control to operate in a control zone in conditions below VMC',
      'An IFR flight in good weather'
    ],
    answer: 1,
    explain: 'A special VFR flight is cleared by air traffic control to operate within a control zone in conditions below VMC, if its request is approved.'
  }
];

var quizList = document.getElementById('quiz-list');
var quizScore = document.getElementById('quiz-score');
var quizStatus = document.getElementById('quiz-status');

function buildFinalQuiz() {
  var answered = 0;
  var correct = 0;
  quizList.textContent = '';
  quizScore.textContent = '';
  quizScore.hidden = true;
  quizStatus.textContent = '0 of ' + finalQuiz.length + ' answered';

  finalQuiz.forEach(function (q, qi) {
    var card = document.createElement('div');
    card.className = 'quiz-q';

    card.appendChild(simText('p', (qi + 1) + '. ' + q.question, 'question-text'));

    var options = document.createElement('div');
    options.className = 'options';

    var feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('aria-live', 'polite');

    var buttons = q.options.map(function (label, oi) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.disabled = true;
        });
        answered += 1;
        if (oi === q.answer) {
          correct += 1;
          button.classList.add('correct');
          feedback.className = 'feedback good';
          feedback.textContent = 'Correct! ' + q.explain;
        } else {
          button.classList.add('wrong');
          buttons[q.answer].classList.add('correct');
          feedback.className = 'feedback bad';
          feedback.textContent = 'Not quite. ' + q.explain;
        }
        quizStatus.textContent = answered + ' of ' + finalQuiz.length + ' answered';
        if (answered === finalQuiz.length) {
          showQuizScore(correct);
        }
      });
      options.appendChild(button);
      return button;
    });

    card.appendChild(options);
    card.appendChild(feedback);
    quizList.appendChild(card);
  });
}

function showQuizScore(correct) {
  var total = finalQuiz.length;
  var message;
  if (correct === total) {
    message = 'Perfect score! You know this course well.';
  } else if (correct >= total * 0.75) {
    message = 'Well done. Review the questions you missed, then try again for a perfect score.';
  } else {
    message = 'Keep practising. Go back through the lessons and try the quiz again.';
  }
  quizScore.textContent = '';
  quizScore.appendChild(simText('p', correct + ' out of ' + total, 'score-number'));
  quizScore.appendChild(simText('p', message));

  var retake = document.createElement('button');
  retake.type = 'button';
  retake.textContent = 'Retake the quiz';
  retake.addEventListener('click', function () {
    buildFinalQuiz();
    window.scrollTo(0, 0);
  });
  quizScore.appendChild(retake);
  quizScore.hidden = false;
  quizScore.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

buildFinalQuiz();

/* ---------- Reset and start-up ---------- */

resetButton.addEventListener('click', function () {
  completed = [];
  saveCompleted();
  updateProgress();
  Array.prototype.forEach.call(document.querySelectorAll('.quiz'), function (container) {
    container.textContent = '';
    buildCheckIn(container);
  });
  buildFinalQuiz();
});

updateProgress();

var startHash = window.location.hash;
var startIndex = lessons.findIndex(function (lesson) {
  return '#' + lesson.id === startHash;
});
showLesson(startIndex === -1 ? 0 : startIndex);
if (startHash === '#quiz' || startHash === '#simulator') {
  showTab(startHash.slice(1));
}
