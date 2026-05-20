require('dotenv').config();

const express = require('express');
const path = require('path');
const { loadLessons } = require('./modules/lessonLoader');
const { downloadLessonImages } = require('./modules/imageDownloader');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const completedLessons = new Set();

const indexRoutes = require('./routes/index')(loadLessons, completedLessons);
const lessonRoutes = require('./routes/lessons')(loadLessons, completedLessons);
const adminRoutes = require('./routes/admin')();

app.use('/', indexRoutes);
app.use('/', lessonRoutes);
app.use('/', adminRoutes);

app.use((req, res) => {
  res.status(404).render('index', {
    title: '404 - Sidan finst ikkje',
    lessons: loadLessons(),
    completedLessons,
    error: 'Sida du leter etter finnes ikke.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('index', {
    title: '500 - Serverfeil',
    lessons: loadLessons(),
    completedLessons,
    error: 'Noe gikk galt på serveren.'
  });
});

app.listen(PORT, async () => {
  console.log(`Dating Coach kjører på http://localhost:${PORT}`);

  try {
    const lessons = loadLessons();
    if (lessons.length > 0) {
      console.log(`Laster ned bilder for ${lessons.length} leksjoner...`);
      await downloadLessonImages(lessons);
      console.log('Bilder behandlet.');
    }
  } catch (err) {
    console.error('Feil ved nedlasting av bilder:', err.message);
  }
});
