const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            if (!dirFile.includes('.next') && !dirFile.includes('node_modules')) {
                filelist = walkSync(dirFile, filelist);
            }
        } else {
            if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts') || dirFile.endsWith('.css')) {
                filelist.push(dirFile);
            }
        }
    });
    return filelist;
};

const map = {
    '#ff003c': '#FDE68A', // Primary red to Pastel Yellow
    '#ff1744': '#FACC15', // Glow red to Accent Yellow
    '#050505': '#0A0A0A', // Background to darker bg
    '#ffe6ea': '#FFF7CC', // Text to yellow text
    '#0b0b0b': '#111111', // Card background
    '255,0,60': '253,230,138', // rgba of Primary #FDE68A roughly
    '255, 0, 60': '253, 230, 138'
};

const files = walkSync('./src');
let filesUpdated = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [key, value] of Object.entries(map)) {
        if (content.includes(key)) {
            content = content.split(key).join(value);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated colors in ${file}`);
        filesUpdated++;
    }
});

console.log(`Finished updating ${filesUpdated} files.`);
