const fs = require('fs');
let file = 'clothing-brand-frontend/src/index.css';
let content = fs.readFileSync(file, 'utf8');
const injection = `
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('/images/jaipur-pattern-bg.jpg');
  background-repeat: repeat;
  background-size: 400px;
  opacity: 0.12;
  z-index: -10;
  pointer-events: none;
}

`;
content = content.replace('body {', injection + 'body {');
fs.writeFileSync(file, content);
