const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        let filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
                results = results.concat(walk(filePath));
            }
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    
    const regexes = [
        /hover:-translate-y-\d+/g,
        /group-hover:-translate-y-\d+/g,
        /hover:scale-\d+/g,
        /group-hover:scale-\d+/g,
        /active:scale-\d+/g,
        /shadow-md/g,
        /shadow-lg/g,
        /shadow-xl/g,
        /shadow-2xl/g,
        /shadow-primary/g,
        /hover:shadow-\w+/g,
        /group-hover:shadow-\w+/g,
        /shadow-sm/g // Add shadow-sm since it's a shadow
    ];
    
    let changed = false;
    regexes.forEach(regex => {
        if (newContent.match(regex)) {
            newContent = newContent.replace(regex, '');
            changed = true;
        }
    });
    
    if (changed) {
        newContent = newContent.replace(/ {2,}/g, ' ');
        newContent = newContent.replace(/className=\" /g, 'className=\"');
        newContent = newContent.replace(/ \"/g, '\"');
        
        fs.writeFileSync(file, newContent);
        changedCount++;
        console.log('Updated', file);
    }
});
console.log('Total files updated:', changedCount);
