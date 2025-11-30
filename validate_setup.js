#!/usr/bin/env node

/**
 * Cloudflare Deployment Configuration Validator
 * Checks your setup before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n' + '='.repeat(50));
console.log('Cloudflare Deployment Configuration Validator');
console.log('='.repeat(50) + '\n');

let issuesFound = 0;
let warningsFound = 0;

// Helper functions
function checkCommand(cmd, name) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    console.log(`✓ ${name} is installed`);
    return true;
  } catch {
    console.log(`✗ ${name} is NOT installed`);
    issuesFound++;
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${name} exists`);
    return true;
  } else {
    console.log(`✗ ${name} NOT found`);
    issuesFound++;
    return false;
  }
}

function checkDirectory(dirPath, name) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`✓ ${name} directory exists`);
    return true;
  } else {
    console.log(`✗ ${name} directory NOT found`);
    issuesFound++;
    return false;
  }
}

function checkFileContent(filePath, searchText, name) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      console.log(`✓ ${name} is configured`);
      return true;
    } else {
      console.log(`⚠ ${name} might need configuration`);
      warningsFound++;
      return false;
    }
  } catch {
    console.log(`✗ Could not read ${name}`);
    issuesFound++;
    return false;
  }
}

// Start checks
console.log('📋 Checking Prerequisites...\n');
const nodeOk = checkCommand('node', 'Node.js');
const npmOk = checkCommand('npm', 'npm');
const wranglerOk = checkCommand('wrangler', 'Wrangler CLI');

console.log('\n📁 Checking Project Structure...\n');
const packageJsonOk = checkFile('package.json', 'package.json');
const wranglerTomlOk = checkFile('wrangler.toml', 'wrangler.toml');
const publicDirOk = checkDirectory('public', 'public');
const workerDirOk = checkDirectory('cloudflare-worker', 'cloudflare-worker');

console.log('\n📝 Checking Configuration Files...\n');
const workerWranglerOk = checkFile('cloudflare-worker/wrangler.toml', 'worker wrangler.toml');
const workerIndexOk = checkFile('cloudflare-worker/src/index.js', 'worker index.js');
const gitignoreOk = checkFile('.gitignore', '.gitignore');

console.log('\n📚 Checking Documentation...\n');
const guideOk = checkFile('CLOUDFLARE_DEPLOYMENT_GUIDE.md', 'Deployment Guide');
const quickStartOk = checkFile('CLOUDFLARE_QUICK_START.md', 'Quick Start Guide');

console.log('\n🔐 Checking Wrangler Authentication...\n');
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
  console.log('✓ Wrangler is authenticated with Cloudflare');
} catch {
  console.log('⚠ Wrangler authentication not found');
  console.log('  Run: wrangler login');
  warningsFound++;
}

console.log('\n📦 Checking Dependencies...\n');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies.wrangler) {
    console.log('✓ Wrangler is in package.json');
  } else {
    console.log('⚠ Wrangler not in package.json');
    warningsFound++;
  }
} catch {
  console.log('✗ Could not read package.json');
  issuesFound++;
}

console.log('\n🔗 Checking Frontend Configuration...\n');
const frontendOk = checkFileContent(
  'public/index.html',
  'API',
  'Frontend API configuration'
);

console.log('\n💾 Checking Deployment Scripts...\n');
const deployScriptOk = checkFile('deploy_cloudflare.bat', 'Windows Deploy Script');

console.log('\n📋 Checking Environment Config Template...\n');
const envConfigOk = checkFile('.env.cloudflare.example', 'Environment config template');

// Summary
console.log('\n' + '='.repeat(50));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(50) + '\n');

if (issuesFound === 0 && warningsFound === 0) {
  console.log('🎉 All checks passed! Your setup is ready for deployment.\n');
  process.exit(0);
} else if (issuesFound === 0) {
  console.log(`✓ No critical issues found`);
  console.log(`⚠ ${warningsFound} warning(s) - recommended to review\n`);
  process.exit(0);
} else {
  console.log(`✗ Found ${issuesFound} critical issue(s)`);
  console.log(`⚠ Found ${warningsFound} warning(s)\n`);
  
  console.log('Quick Fixes:\n');
  
  if (!nodeOk) {
    console.log('1. Install Node.js 18+: https://nodejs.org/');
  }
  if (!wranglerOk) {
    console.log('2. Install Wrangler: npm install -g wrangler');
  }
  if (!packageJsonOk) {
    console.log('3. Initialize npm project: npm init -y');
  }
  
  console.log('\nFor more help, see CLOUDFLARE_QUICK_START.md\n');
  process.exit(1);
}
