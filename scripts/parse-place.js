const fs = require('fs');

const content = fs.readFileSync(
  'C:\\Users\\mohdh\\.gemini\\antigravity\\brain\\79b3db8e-ca88-41ab-8a46-13cd7a238a24\\.system_generated\\steps\\201\\content.md',
  'utf8'
);

// Find place name, address, phone
const lines = content.split('\n');
console.log('Total lines:', lines.length);

for (let i = 0; i < Math.min(lines.length, 100); i++) {
  const line = lines[i];
  if (line.includes('Momoe') || line.includes('place') || line.includes('address')) {
    console.log(`Line ${i}:`, line.substring(0, 300));
  }
}

// Search for JSON or app data in the file
const jsonMatches = content.match(/\[\"Momoe\"[^\]]+\]/g);
if (jsonMatches) {
  console.log('JSON matches:', jsonMatches.slice(0, 5));
}
