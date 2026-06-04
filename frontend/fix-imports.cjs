const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('./src', (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const targetImport = 'import { API_URL } from "@/lib/config";\n';
    const targetImportWin = 'import { API_URL } from "@/lib/config";\r\n';
    
    let hasTarget = false;
    let newContent = content;

    // Check if the exact string exists
    if (content.includes(targetImport)) {
        hasTarget = true;
        newContent = newContent.replace(targetImport, '');
    } else if (content.includes(targetImportWin)) {
        hasTarget = true;
        newContent = newContent.replace(targetImportWin, '');
    } else if (content.includes('import { API_URL } from "@/lib/config";')) {
         hasTarget = true;
         newContent = newContent.replace('import { API_URL } from "@/lib/config";', '');
    }

    if (hasTarget) {
        // Clean up any double newlines left over if needed
        
        // Add to the top, but after "use client" if it exists
        if (newContent.startsWith('"use client"') || newContent.startsWith("'use client'")) {
            const firstNewline = newContent.indexOf('\n');
            newContent = newContent.slice(0, firstNewline + 1) + '\nimport { API_URL } from "@/lib/config";\n' + newContent.slice(firstNewline + 1);
        } else {
            newContent = 'import { API_URL } from "@/lib/config";\n' + newContent;
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed', filePath);
    }
});
