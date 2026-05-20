const fs = require('fs');
const path = require('path');
const axios = require('axios');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'assets', 'images');

function ensureDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

function extractFilenameFromUrl(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const base = path.basename(pathname).split('?')[0];
  return base || `image-${Date.now()}.jpg`;
}

async function downloadImage(url, filename) {
  ensureDir();

  if (!filename) {
    filename = extractFilenameFromUrl(url);
  }

  const filepath = path.join(IMAGES_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`Skipped (exists): ${filename}`);
    return { filename, skipped: true, path: filepath };
  }

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 30000
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`Downloaded: ${filename}`);
    return { filename, skipped: false, path: filepath };
  } catch (error) {
    console.error(`Failed to download ${filename}:`, error.message);
    return { filename, skipped: false, error: error.message, path: null };
  }
}

async function downloadLessonImages(lessons) {
  const promises = lessons
    .filter(lesson => lesson.imageUrl)
    .map(async (lesson) => {
      const ext = path.extname(new URL(lesson.imageUrl).pathname)|| '.jpg';
      // Use slug as filename base to keep predictable paths
      const filename = `${lesson.slug}${ext}`;
      const result = await downloadImage(lesson.imageUrl, filename);
      return { slug: lesson.slug, ...result };
    });

  return Promise.all(promises);
}

module.exports = { downloadImage, downloadLessonImages, extractFilenameFromUrl };