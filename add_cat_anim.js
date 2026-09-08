const fs = require('fs');
let file = 'clothing-brand-frontend/src/components/Categories.css';
let content = fs.readFileSync(file, 'utf8');

const newAnim = `
.collection-category-card img {
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
}
.collection-category-card:hover img {
  transform: scale(1.1) !important;
}
.collection-category-card .collection-category-label {
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.collection-category-card:hover .collection-category-label {
  transform: translateY(-10px);
}
`;

fs.writeFileSync(file, content + newAnim);
