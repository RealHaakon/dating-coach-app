const express = require('express');
const router = express.Router();
const { generateReadme, publishToGitHub } = require('../modules/githubPublisher');

module.exports = () => {
  router.get('/admin/publish', (req, res) => {
    try {
      generateReadme();
      const url = publishToGitHub();
      res.render('index', {
        lessons: [],
        completedLessons: new Set(),
        title: 'Publisert!',
        publishStatus: `Prosjektet er publisert til ${url}`
      });
    } catch (err) {
      res.render('index', {
        lessons: [],
        completedLessons: new Set(),
        title: 'Publiseringsfeil',
        error: `Kunne ikke publisere: ${err.message}`
      });
    }
  });

  return router;
};
