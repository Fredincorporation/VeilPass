const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      transform(full);
    }
  }
}

function transform(file) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  // Replace catch (error: any) and catch (err: any) with unknown
  content = content.replace(/catch \((error|err|e|ex): any\)/g, 'catch ($1: unknown)');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
}

try {
  walk(ROOT);
  console.log('Done replacing catch (.*: any) -> unknown');
} catch (e) {
  console.error('Failed', e);
  process.exit(1);
}
