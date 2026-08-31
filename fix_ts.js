import fs from 'fs';

// Fix AdminProductReports.tsx
let f1 = 'clothing-brand-frontend/src/pages/admin/AdminProductReports.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace('import { Package, TrendingUp, AlertTriangle }', 'import { TrendingUp, AlertTriangle }');
fs.writeFileSync(f1, c1);

// Run tsc to check other files
const { execSync } = require('child_process');
try {
  execSync('npx tsc -b', { cwd: 'clothing-brand-frontend', stdio: 'inherit' });
  console.log("TSC SUCCESS");
} catch(e) {
  console.log("TSC FAILED");
}
