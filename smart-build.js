const { execSync } = require('child_process');
const fs = require('fs');

if (process.env.RENDER === 'true') {
  console.log('Detected Render environment. Skipping frontend build (Backend only).');
  process.exit(0);
}

try {
  console.log('Building frontend workspace...');
  execSync('npm run build --workspace=clothing-brand-frontend', { stdio: 'inherit' });
  fs.rmSync('dist', { recursive: true, force: true });
  fs.cpSync('clothing-brand-frontend/dist', 'dist', { recursive: true });
  console.log('Copied frontend build to root dist/');
} catch (error) {
  console.error('Frontend build failed');
  process.exit(1);
}
