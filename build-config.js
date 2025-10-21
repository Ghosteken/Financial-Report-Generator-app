const fs = require('fs');
const path = require('path');

const apiBase = process.env.API_BASE || '';
const out = `window.API_BASE = ${JSON.stringify(apiBase)};`;

fs.writeFileSync(path.join(__dirname, 'config.js'), out, { encoding: 'utf8' });
console.log('Wrote config.js with API_BASE =', apiBase || '<empty>');
