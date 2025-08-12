/* Remove the original script tag and inline the rollup bundle in the body */

import fs from 'node:fs';

const FILE_OPTIONS = { encoding: 'utf8' };

const original = fs.readFileSync('index.html', FILE_OPTIONS);
const script   = fs.readFileSync('docs/bundle.js', FILE_OPTIONS);

// noinspection UnterminatedStatementJS
const output = original
    .replace(`<script type="module" src="lib/main.js"></script>`, ``)
    .replace(`<!-- JS bundle placeholder -->`, `
        <script type="application/javascript">
            ${script}
        </script>
    `);

fs.writeFileSync('docs/index.html', output, FILE_OPTIONS);
fs.rmSync('docs/bundle.js');