const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'patient.controller.fixed.js');

try {
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    console.log(`Read ${lines.length} lines.`);

    if (lines.length > 534) {
        const newLines = lines.slice(0, 534);
        const newContent = newLines.join('\n');

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Truncated file to ${newLines.length} lines.`);
    } else {
        console.log('File is already short enough.');
    }
} catch (err) {
    console.error('Error:', err);
}
