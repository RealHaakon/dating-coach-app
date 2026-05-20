(function () {
  let completedLessons = window.__COMPLETED_LESSONS__ || [];
  let totalLessons = window.__TOTAL_LESSONS__ || 0;

  function updateProgress() {
    const pct = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '% fullført';

    if (pct === 100 && completedLessons.length > 0) {
      launchConfetti();
    }
  }

  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
  }

  function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', toggleTheme);
  }

  function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.lesson-card[data-difficulty]');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-difficulty') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  function launchConfetti() {
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    var colors = ['#1a8a7d', '#2ec4b6', '#ffb74d', '#ef9a9a', '#81c784', '#f06292', '#64b5f6'];

    for (var i = 0; i < 80; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }

    setTimeout(function () {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 5000);
  }

  function markLessonCompleted(slug) {
    if (completedLessons.indexOf(slug) === -1) {
      completedLessons.push(slug);
    }
    updateProgress();
  }

  function markLessonUncompleted(slug) {
    var idx = completedLessons.indexOf(slug);
    if (idx > -1) {
      completedLessons.splice(idx, 1);
    }
    updateProgress();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupThemeToggle();
    setupFilters();
    updateProgress();
  });

  window.__markCompleted = markLessonCompleted;
  window.__markUncompleted = markLessonUncompleted;
})();
