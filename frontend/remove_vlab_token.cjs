const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove token variable declarations
    content = content.replace(/const\s+token\s*=\s*(?:typeof\s+window\s*!==\s*['"]undefined['"]\s*\?\s*)?localStorage\.getItem\(['"]vlab_token['"]\)(?:\s*:\s*null)?\s*;/g, '');
    
    // Remove headers with Authorization
    content = content.replace(/headers:\s*\{\s*Authorization:\s*`Bearer\s*\$\{[^}]+\}`\s*\}/g, '/* removed auth header */');
    
    // Replace token checks with false if they were for UI
    content = content.replace(/!!localStorage\.getItem\(['"]vlab_token['"]\)/g, "true /* assume auth handled by cookie */");

    // Remove localStorage.removeItem('vlab_token')
    content = content.replace(/localStorage\.removeItem\(['"]vlab_token['"]\)\s*;/g, '');

    // For any remaining Axios config that passed token manually:
    content = content.replace(/,\s*\{\s*headers:\s*\{\s*Authorization:\s*`Bearer\s*\$\{token\}`\s*\}\s*\}/g, '');
    content = content.replace(/headers:\s*\{\s*Authorization:\s*`Bearer\s*\$\{token\}`\s*\}/g, '/* removed auth header */');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Mass replace complete. Modified ${changedFiles} files.`);
