const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🔍 Starting CloudCrossover Site & SEO Audit...\n');

const ROOT_DIR = path.resolve(__dirname, '..');
let passed = 0;
let total = 0;

function it(description, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. File Existence Tests
const requiredFiles = [
  'index.html',
  'crossover-guide.html',
  'adr-generator.html',
  '404.html',
  'legal/privacy.html',
  'legal/terms.html',
  'assets/css/style.css',
  'assets/js/calculators.js',
  'assets/js/app.js',
  'assets/img/favicon.svg',
  'sitemap.xml',
  'robots.txt',
  'site.webmanifest',
  '.nojekyll'
];

requiredFiles.forEach(file => {
  it(`Core file exists: ${file}`, () => {
    const fullPath = path.join(ROOT_DIR, file);
    assert(fs.existsSync(fullPath), `Missing file: ${file}`);
  });
});

// 2. HTML Metadata & SEO Tests
const htmlFiles = [
  'index.html',
  'crossover-guide.html',
  'adr-generator.html',
  'legal/privacy.html',
  'legal/terms.html'
];

htmlFiles.forEach(file => {
  it(`HTML metadata validation for ${file}`, () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    assert(content.includes('<title>'), `${file} missing <title> tag`);
    assert(content.includes('name="description"'), `${file} missing meta description`);
    assert(content.includes('rel="canonical"'), `${file} missing canonical link`);
    assert(content.includes('rel="icon"'), `${file} missing favicon link`);
  });
});

// 3. Sitemap Verification
it('sitemap.xml lists valid production URLs', () => {
  const sitemap = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
  assert(sitemap.includes('https://mohd34.github.io/cloudcrossover/'));
  assert(sitemap.includes('crossover-guide.html'));
  assert(sitemap.includes('adr-generator.html'));
});

// 4. Robots.txt Verification
it('robots.txt points to correct sitemap location', () => {
  const robots = fs.readFileSync(path.join(ROOT_DIR, 'robots.txt'), 'utf8');
  assert(robots.includes('Sitemap: https://mohd34.github.io/cloudcrossover/sitemap.xml'));
  assert(robots.includes('User-agent: *'));
});

console.log(`\n======================================================`);
console.log(`🎉 Site audit complete: ${passed}/${total} checks passed!`);
console.log(`======================================================\n`);
