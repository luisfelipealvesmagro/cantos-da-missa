const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outDir  = path.join(__dirname, '../public/icons');
const sizes   = [72, 96, 128, 144, 152, 192, 384, 512];

const svg = fs.readFileSync(svgPath);

Promise.all(
  sizes.map(size =>
    sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`))
      .then(() => console.log(`✓ ${size}x${size}`))
  )
)
.then(() => console.log('\nTodos os ícones gerados em public/icons/'))
.catch(err => { console.error(err); process.exit(1); });
