/**
 * sync-tokens.js
 * Reads tokens.json and updates the CSS :root block in index.html
 * Run: node scripts/sync-tokens.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const TOKENS  = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens.json'), 'utf8'));
const HTML    = path.join(ROOT, 'index.html');

// Build CSS custom properties from tokens
function buildCSSVars(tokens) {
  const lines = [];
  const { color, typography, spacing, radius } = tokens;

  lines.push('    /* ── Design Tokens ─────────────────────────────────────────── */');
  lines.push('    :root {');

  Object.entries(color).forEach(([k, v]) => {
    lines.push(`      --${k}: ${v};`);
  });

  lines.push(`      --font-family: ${typography['font-family']};`);

  Object.entries(spacing).forEach(([k, v]) => {
    lines.push(`      --space-${k}: ${v};`);
  });

  Object.entries(radius).forEach(([k, v]) => {
    lines.push(`      --radius-${k}: ${v};`);
  });

  lines.push('    }');
  return lines.join('\n');
}

const newRoot = buildCSSVars(TOKENS);

let html = fs.readFileSync(HTML, 'utf8');

// Replace the existing :root block
const rootRegex = /\/\* ── Design Tokens ──.*?:root \{[\s\S]*?\}/;
if (rootRegex.test(html)) {
  html = html.replace(rootRegex, newRoot);
  fs.writeFileSync(HTML, html, 'utf8');
  console.log('✅ tokens.json → index.html :root synced.');
} else {
  console.warn('⚠️  Could not find :root block in index.html. Ensure it contains the Design Tokens comment.');
  process.exit(1);
}
