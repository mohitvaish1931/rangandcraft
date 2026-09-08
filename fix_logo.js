const fs = require('fs');
let file = 'clothing-brand-frontend/src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("objectFit: 'cover'", "objectFit: 'contain'");
content = content.replace("objectPosition: 'center'", "objectPosition: 'left'");
fs.writeFileSync(file, content);
