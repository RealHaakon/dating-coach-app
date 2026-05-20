const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ProjectDir = path.resolve(__dirname, '..');
const ReadmePath = path.join(ProjectDir, 'README.md');
const LessonsDir = path.join(ProjectDir, 'lessons');

function getToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

function getUsername() {
  return process.env.GITHUB_USERNAME || 'RealHaakon';
}

function getRepoName() {
  return process.env.GITHUB_REPO || 'dating-coach-app';
}

function loadLessonsForReadme() {
  if (!fs.existsSync(LessonsDir)) return [];
  const files = fs.readdirSync(LessonsDir).filter(f => f.endsWith('.md')).sort();
  return files.map(filename => {
    const raw = fs.readFileSync(path.join(LessonsDir, filename), 'utf-8');
    // Simple YAML frontmatter parser
    const fm = {};
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (match) {
      match[1].split(/\r?\n/).forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
          let key = line.slice(0, idx).trim();
          let value = line.slice(idx + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
          fm[key] = value;
        }
      });
    }
    return { filename, title: fm.title || filename, description: fm.description || '', difficulty: fm.difficulty || '' };
  });
}

function generateReadme(lessons = null) {
  const lessonList = lessons || loadLessonsForReadme();
  const lessonLines = lessonList.map((l, i) => `- **${l.title}** (${l.difficulty || 'n/a'}) — ${l.description}`).join('\n');

  const content = `# dating-coach-app

> Interaktiv, modulbasert dating coach-nettside med Node.js, Express og EJS.

## Installasjon

\`\`\`bash
npm install
npm start
\`\`\`

## Leksjonsstruktur

${lessonLines || '- Ingen leksjoner funnet'}

## Arkitektur

- **Backend**: Node.js, Express
- **Templating**: EJS
- **Content**: Markdown med YAML-frontmatter
- **Styling**: Custom CSS med mørk/lys-modus

## Lisenstype

MIT
`;

  fs.writeFileSync(ReadmePath, content, 'utf-8');
  console.log('README.md generated.');
  return ReadmePath;
}

async function ensureRepoExists() {
  const token = getToken();
  const username = getUsername();
  const repo = getRepoName();

  if (!token) throw new Error('GITHUB_TOKEN ikke funnet. Legg til i .env eller sette environment variable.');

  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token ${token}" https://api.github.com/repos/${username}/${repo}`, { encoding: 'utf8', stdio: 'pipe' });
    // If we get here, it exists (or we need to create it)
  } catch (e) {
    // try create
  }

  // Try to create repo (will 422 if exists)
  try {
    const payload = JSON.stringify({ name: repo, private: false });
    execSync(`curl -s -o nul -w "%{http_code}" -X POST -d "${payload.replace(/"/g, '\\"')}" -H "Authorization: token ${token}" -H "Content-Type: application/json" https://api.github.com/user/repos`, { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    // repo might already exist
  }

  return `https://github.com/${username}/${repo}`;
}

function publishToGitHub() {
  const token = getToken();
  const username = getUsername();
  const repo = getRepoName();
  const remoteUrl = `https://${username}:${token}@github.com/${username}/${repo}.git`;

  generateReadme();

  try {
    execSync('git init', { cwd: ProjectDir });
  } catch (e) { /* already inited */ }

  try {
    execSync('git add .', { cwd: ProjectDir });
  } catch (e) { /* already added */ }

  try {
    execSync('git commit -m "Initial commit"', { cwd: ProjectDir });
  } catch (e) { /* nothing to commit */ }

  try {
    execSync(`git remote add origin ${remoteUrl}`, { cwd: ProjectDir });
  } catch (e) { /* already added */ }

  execSync('git push -u origin main --force', { cwd: ProjectDir });
  const finalUrl = `https://github.com/${username}/${repo}`;
  console.log(`Published to: ${finalUrl}`);
  return finalUrl;
}

module.exports = { generateReadme, publishToGitHub, getToken, getUsername };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--generate-readme')) {
    generateReadme();
  } else if (args.includes('--publish')) {
    (async () => {
      await ensureRepoExists();
      const url = publishToGitHub();
      console.log(url);
    })();
  }
}