import fs from 'fs';

let header = fs.readFileSync('clothing-brand-frontend/src/components/Header.tsx', 'utf8');
header = header.replace('import { useState, useEffect }', 'import { useState }');
header = header.replace(/const \[searchTerm, setSearchTerm\] = useState\(''\);\n/, '');
header = header.replace(/const navigate = useNavigate\(\);\n/, '');
fs.writeFileSync('clothing-brand-frontend/src/components/Header.tsx', header);

let hero = fs.readFileSync('clothing-brand-frontend/src/components/Hero.tsx', 'utf8');
hero = hero.replace("import { Link } from 'react-router-dom';", '');
fs.writeFileSync('clothing-brand-frontend/src/components/Hero.tsx', hero);
