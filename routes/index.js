const express = require('express');
const router = express.Router();

module.exports = (loadLessons, completedLessons) => {
  router.get('/', (req, res) => {
    const lessons = loadLessons();
    res.render('index', { lessons, completedLessons, title: 'Dating Coach Norge' });
  });

  return router;
};
