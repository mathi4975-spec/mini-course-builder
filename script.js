document.documentElement.classList.add('js');

var lessons = Array.prototype.slice.call(document.querySelectorAll('.lesson'));
var navButtons = Array.prototype.slice.call(document.querySelectorAll('#lesson-nav button'));
var prevButton = document.getElementById('prev-lesson');
var nextButton = document.getElementById('next-lesson');
var themeButton = document.getElementById('theme-toggle');
var currentIndex = 0;

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

var startIndex = lessons.findIndex(function (lesson) {
  return '#' + lesson.id === window.location.hash;
});
showLesson(startIndex === -1 ? 0 : startIndex);
window.scrollTo(0, 0);
