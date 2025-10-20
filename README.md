# Local development

Automatic recompilation of the TypeScript source code (through WebStorm or 
`tsc --watch`) should keep `lib/main.js` updated, which `index.html` includes.
So having that file live reloaded is enough to test changes.

# Build process

For the deployed site, the goal is to have a single, standalone HTML file, with
all CSS and JS content included directly. For the JS part, this has a few steps:

- Normal compilation happens with `tsc`, producing multiple files
- These are combined via `rollup` into a single file
    (seems like `tsc` doesn't support this out-of-the-box anymore?)  
- This file is inlined into `index.html` by `builder.js`
- All of this goes under `docs`, to be deployed as GitHub Pages