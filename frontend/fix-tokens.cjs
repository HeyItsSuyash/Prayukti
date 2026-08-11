const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/Suyash/Desktop/Prayukti_Legacy/frontend/src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('Bearer ${token}')) {
        // Remove the Authorization header line
        content = content.replace(/\s*['"]?Authorization['"]?:\s*`Bearer \$\{token\}`\s*,?/g, '');
        
        // Ensure credentials: 'include' is added to fetch calls
        content = content.replace(/(fetch\([^,]+,\s*\{)/g, (match) => {
            return match + '\n                    credentials: "include",';
        });

        // Ensure withCredentials: true is added to axios calls if not present (simple check)
        content = content.replace(/(axios\.(get|post|put|delete|patch)\([^,]+(?:,\s*[^,]+)?)(?=\s*\))/g, (match) => {
             if (!match.includes('withCredentials')) {
                 return match + ', { withCredentials: true }';
             }
             return match;
        });

        fs.writeFileSync(file, content, 'utf8');
        changed++;
        console.log('Fixed ' + file);
    }
});
console.log('Total files changed: ' + changed);
