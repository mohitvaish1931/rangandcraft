const { execSync } = require('child_process');

if (process.env.RENDER === 'true') {
  console.log('Detected Render environment. Skipping frontend build (Backend only).');
  process.exit(0);
}

try {
  console.log('Building frontend workspace...');
  execSync('npm run build --workspace=clothing-brand-frontend', { stdio: 'inherit' });
} catch (error) {
  console.error('Frontend build failed');
  process.exit(1);
}
