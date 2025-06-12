const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/voxta-logo.svg');
const pngPath = path.join(__dirname, '../public/voxta-logo.png');

const svgBuffer = fs.readFileSync(svgPath);

sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile(pngPath)
  .then(() => console.log('Successfully converted SVG to PNG'))
  .catch(err => console.error('Error converting SVG to PNG:', err)); 