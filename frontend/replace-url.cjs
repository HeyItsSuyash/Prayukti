const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
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

const files = walk('./src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:5000') || content.includes('process.env.NEXT_PUBLIC_API_URL')) {
        
        // Remove old local API_URL and baseUrl declarations
        content = content.replace(/const API_URL = [^;]+;\r?\n?/g, '');
        content = content.replace(/const baseUrl = [^;]+;\r?\n?/g, '');
        
        // If the file doesn't import API_URL, add it
        if (!content.includes('API_URL } from "@/lib/config"')) {
            let lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                let endOfLine = content.indexOf('\n', lastImportIndex);
                let importStmt = '\nimport { API_URL } from "@/lib/config";';
                content = content.slice(0, endOfLine) + importStmt + content.slice(endOfLine);
            } else {
                content = 'import { API_URL } from "@/lib/config";\n' + content;
            }
        }
        
        // Replace string variants
        content = content.replace(/['"]http:\/\/localhost:5000\/([^'"]*)['"]/g, '`${API_URL}/$1`');
        content = content.replace(/['"]http:\/\/localhost:5000['"]/g, 'API_URL');
        
        // Replace inline `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`
        content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| ['"]http:\/\/localhost:5000['"]\}/g, '${API_URL}');
        
        // Fix any occurrences of ${baseUrl}
        content = content.replace(/\$\{baseUrl\}/g, '${API_URL}');

        fs.writeFileSync(file, content);
        changed++;
        console.log('Updated: ' + file);
    }
});
console.log('Total changed: ' + changed);
