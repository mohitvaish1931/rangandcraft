const fs = require('fs');
let file = 'clothing-brand-frontend/src/index.css';
let content = fs.readFileSync(file, 'utf8');

const newClass = `
.jaipur-bg-pattern {
  position: relative;
  z-index: 1;
}
.jaipur-bg-pattern::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('/images/jaipur-pattern-bg.jpg');
  background-repeat: repeat;
  background-size: 300px;
  opacity: 0.1;
  mix-blend-mode: multiply;
  z-index: -1;
  pointer-events: none;
}
`;

fs.writeFileSync(file, content + newClass);
