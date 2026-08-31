import fs from 'fs';
let content = fs.readFileSync('clothing-brand-frontend/src/App.tsx', 'utf8');
content = content.replace("import TrackOrder from './pages/TrackOrder';", "import TrackOrder from './pages/TrackOrder';\nimport Gallery from './pages/Gallery';\nimport Reviews from './pages/Reviews';");
content = content.replace('<Route path="/track-order" element={<TrackOrder />} />', '<Route path="/track-order" element={<TrackOrder />} />\n          <Route path="/gallery" element={<Gallery />} />\n          <Route path="/reviews" element={<Reviews />} />');
fs.writeFileSync('clothing-brand-frontend/src/App.tsx', content);
