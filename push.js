require('dotenv').config();
const { execSync } = require('child_process');
const https = require('https');

const token = process.env.GITHUB_TOKEN;
const user = process.env.GITHUB_USERNAME;
const repo = process.env.GITHUB_REPO;
const dir = __dirname;
const remoteUrl = `https://${user}:${token}@github.com/${user}/${repo}.git`;

function createRepo() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ name: repo, private: false, auto_init: false });
    const req = https.request({
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'dating-coach-app',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 422) {
          resolve();
        } else {
          reject(new Error(`GitHub API ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Oppretter repo...');
  await createRepo();
  console.log('Repo klart.');

  try { execSync('git init', { cwd: dir, stdio: 'pipe' }); } catch(e) {}
  try { execSync('git add .', { cwd: dir, stdio: 'pipe' }); } catch(e) {}
  try { execSync('git commit -m "Agentisk AI-slop: initial commit"', { cwd: dir, stdio: 'pipe' }); } catch(e) {}
  try { execSync(`git remote add origin ${remoteUrl}`, { cwd: dir, stdio: 'pipe' }); } catch(e) {}
  execSync('git branch -M main', { cwd: dir, stdio: 'pipe' });
  execSync(`git push -u origin main --force`, { cwd: dir, stdio: 'inherit' });
  console.log(`\nPushed to: https://github.com/${user}/${repo}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
