require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const dir = __dirname;
const token = process.env.GITHUB_TOKEN;
const user = process.env.GITHUB_USERNAME;
const repo = process.env.GITHUB_REPO;
const remoteUrl = `https://${user}:${token}@github.com/${user}/${repo}.git`;

try { execSync('git init', { cwd: dir, stdio: 'pipe' }); } catch(e) {}
try { execSync('git add .', { cwd: dir, stdio: 'pipe' }); } catch(e) {}
try { execSync('git commit -m "Agentisk AI-slop: initial commit"', { cwd: dir, stdio: 'pipe' }); } catch(e) {}
try { execSync(`git remote add origin ${remoteUrl}`, { cwd: dir, stdio: 'pipe' }); } catch(e) {}
execSync('git branch -M main', { cwd: dir, stdio: 'pipe' });
execSync(`git push -u origin main --force`, { cwd: dir, stdio: 'pipe' });
console.log(`Pushed to: https://github.com/${user}/${repo}`);
