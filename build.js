const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Files to copy for deployment
const filesToCopy = [
    'server.js',
    'script.js', 
    'index.html',
    'index-inline.html',
    'styles.css',
    'package.json',
    'README.md',
    'vercel.json'
];

// Copy files to dist directory
filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied ${file} to dist/`);
    } else {
        console.log(`⚠ Warning: ${file} not found, skipping...`);
    }
});

// Create production package.json (remove devDependencies)
const packageJsonPath = path.join(distDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove devDependencies for production
delete packageJson.devDependencies;

// Update scripts for production
packageJson.scripts = {
    "start": "node server.js"
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✓ Created production package.json');

console.log('\n🎉 Build completed successfully!');
console.log('📁 Built files are in the dist/ directory');
console.log('🚀 Ready for deployment!'); 