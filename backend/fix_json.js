const fs = require('fs');
const fileName = 'c:\\Users\\Murat\\Downloads\\DEEP_SCAN_BUMERANGWEAR.json';

try {
  const content = fs.readFileSync(fileName, 'utf8');
  const data = JSON.parse(content);
  
  if (Array.isArray(data)) {
    console.log("Fixing the array format into object format...");
    const outputData = {
        shopName: "BUMERANGWEAR",
        products: data,
        categories: [...new Set(data.map(p => p.category).filter(c => c && c !== 'Genel'))],
        source: 'shopier_deep_scan',
        exportDate: new Date().toISOString()
    };
    fs.writeFileSync(fileName, JSON.stringify(outputData, null, 2));
    console.log("Fixed! File is ready for upload.");
  } else {
    console.log("File is already in object format.");
  }
} catch (e) {
  console.error(e);
}
