const fs = require('fs');

let file1 = 'clothing-brand-frontend/src/components/Footer.tsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace('className="footer-purple"', 'className="footer-purple jaipur-bg-pattern"');
fs.writeFileSync(file1, content1);

let file2 = 'clothing-brand-frontend/src/pages/HomePage.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
// Let's add it to the Our Story & Values section
content2 = content2.replace(
  '<section style={{ display: \'flex\', flexWrap: \'wrap\', maxWidth: \'1200px\', margin: \'60px auto\', gap: \'30px\', padding: \'0 20px\' }}>', 
  '<section className="jaipur-bg-pattern" style={{ display: \'flex\', flexWrap: \'wrap\', maxWidth: \'1200px\', margin: \'60px auto\', gap: \'30px\', padding: \'40px 20px\', backgroundColor: \'#fdfdfd\' }}>'
);
fs.writeFileSync(file2, content2);
