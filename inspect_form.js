const fs = require('fs');

try {
  const content = fs.readFileSync('debug_shopier.html', 'utf16le');
  
  // Find all select elements
  const selectRegex = /<select\s+[^>]*name="([^"]+)"[^>]*>/gi;
  let match;
  console.log("=== Selects found in debug_shopier.html ===");
  while ((match = selectRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const name = match[1];
    console.log(`  - Select Name: ${name}`);
  }
} catch (e) {
  console.error(e);
}
