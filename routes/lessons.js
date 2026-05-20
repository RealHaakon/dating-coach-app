const express = require('express');
const router = express.Router();

module.exports = (loadLessons, completedLessons) => {
  router.get('/leksjoner', (req, res) => {
    const lessons = loadLessons();
    res.render('lessons', { lessons, completedLessons, title: 'Alle leksjoner' });
  });

  router.get('/leksjon/:slug', (req, res) => {
    const lessons = loadLessons();
    const lesson = lessons.find(l => l.slug === req.params.slug);

    if (!lesson) {
      return res.status(404).render('index', {
        lessons,
        completedLessons,
        title: '404 — Leksjon ikke funnet',
        error: 'Denne leksjonen finnes ikke.'
      });
    }

    const currentIndex = lessons.findIndex(l => l.slug === req.params.slug);
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    const isCompleted = completedLessons.has(lesson.slug);

    res.render('lesson', {
      lesson,
      lessons,
      prevLesson,
      nextLesson,
      isCompleted,
      completedLessons,
      title: lesson.title
    });
  });

  router.post('/leksjon/:slug/complete', (req, res) => {
    const lessons = loadLessons();
    const lesson = lessons.find(l => l.slug === req.params.slug);

    if (lesson) {
      if (completedLessons.has(lesson.slug)) {
        completedLessons.delete(lesson.slug);
      } else {
        completedLessons.add(lesson.slug);
      }
    }

    res.redirect(`/leksjon/${req.params.slug}`);
  });

  return router;
};
