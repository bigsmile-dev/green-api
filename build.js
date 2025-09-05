const fs = require('fs');
const path = require('path');

console.log('🔨 Building inline version for Vercel deployment...');

// Read the source files
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const jsContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// Create inline HTML with embedded CSS and JS
const inlineHtml = htmlContent
    // Replace CSS link with inline styles
    .replace(
        '<link rel="stylesheet" href="styles.css">',
        `<style>\n${cssContent}\n</style>`
    )
    // Replace JS script with inline script
    .replace(
        '<script src="script.js"></script>',
        `<script>\n${jsContent}\n</script>`
    );

// Write the inline version
fs.writeFileSync(path.join(__dirname, 'index-inline.html'), inlineHtml);

console.log('✅ Created index-inline.html with embedded CSS and JS');
console.log('📁 File size:', Math.round(inlineHtml.length / 1024), 'KB');
console.log('🚀 Ready for Vercel deployment!'); 