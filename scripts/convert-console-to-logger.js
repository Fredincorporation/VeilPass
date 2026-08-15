const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'src');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js') || full.endsWith('.jsx'))) {
      try {
        processFile(full);
      } catch (e) {
        console.error('Skipping file due to error processing:', full, e && e.message ? e.message : e);
      }
    }
  }
}

function ensureImport(content, importLine) {
  if (content.includes(importLine)) return content;
  // add after first import block
  const lines = content.split('\n');
  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) insertAt = i + 1;
  }
  lines.splice(insertAt, 0, importLine);
  return lines.join('\n');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('console.')) return;

  let changed = false;

  if (content.includes('console.error(') || content.includes('console.error(')) {
    content = content.replace(/console\.error\(/g, 'captureException(');
    content = ensureImport(content, "import { captureException } from '@/lib/logger';");
    changed = true;
  }

  if (content.includes('console.log(') || content.includes('console.info(')) {
    content = content.replace(/console\.log\(/g, 'logger.info(');
    content = content.replace(/console\.info\(/g, 'logger.info(');
    content = ensureImport(content, "import logger from '@/lib/logger';");
    changed = true;
  }

  if (content.includes('console.warn(')) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    content = ensureImport(content, "import logger from '@/lib/logger';");
    changed = true;
  }

  if (changed) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    } catch (e) {
      console.error('Failed to write file:', filePath, e && e.message ? e.message : e);
    }
  }
}

try {
  walk(SRC_DIR);
  console.log('Conversion complete. Please run type-check and tests.');
} catch (e) {
  console.error('Conversion failed:', e);
  process.exit(1);
}
