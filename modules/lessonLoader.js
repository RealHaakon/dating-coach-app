const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const LESSONS_DIR = path.join(__dirname, '..', 'lessons');

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const frontmatter = {};

  raw.split(/\r?\n/).forEach((line) => {
    const [key, ...rest] = line.split(':');
    if (rest.length) {
      let value = rest.join(':').trim();
      // Remove quotes around strings
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else {
        // Try parse as number or array
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value.replace(/'/g, '"'));
          } catch {
            // keep as string
          }
        } else if (!isNaN(Number(value))) {
          value = Number(value);
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }
      }
      frontmatter[key.trim()] = value;
    }
  });

  return { frontmatter, body };
}

function loadLessons() {
  const files = fs.readdirSync(LESSONS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  const lessons = files.map(filename => {
    const id = Number(filename.match(/^(\d+)-/)?.[1]) || 99;
    const slug = filename.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(LESSONS_DIR, filename), 'utf-8');
    const { frontmatter, body } = parseFrontmatter(raw);

    return {
      id,
      title: frontmatter.title || 'Uten titel',
      description: frontmatter.description || '',
      difficulty: frontmatter.difficulty || 'begynner',
      imageUrl: frontmatter.imageUrl || null,
      order: frontmatter.order || id,
      tags: frontmatter.tags || [],
      content: marked.parse(body || ''),
      slug
    };
  });

  // Sort by id (numeric prefix) then order
  lessons.sort((a, b) => (a.id - b.id) || (a.order - b.order));
  return lessons;
}

module.exports = { loadLessons };