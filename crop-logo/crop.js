const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_DIR = path.resolve(__dirname, '../images-for-logo');
const OUTPUT_FULL_DIR = path.resolve(__dirname, '../images-for-logo/images-cropped-full');
const OUTPUT_256_DIR = path.resolve(__dirname, '../images-for-logo/images-cropped-256');

// verticalCenter: 0.0 = crop from top, 0.5 = dead center, 1.0 = crop from bottom
// Adjust per-image to keep logo text clearly visible
const images = [
  { file: 'lazyExpander-logo-01.png', verticalCenter: 0.52 },
  { file: 'lazyExpander-logo-02.png', verticalCenter: 0.48 },
  { file: 'lazyExpander-logo-03.png', verticalCenter: 0.46 },
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function cropImage({ file, verticalCenter }) {
  const inputPath = path.join(INPUT_DIR, file);
  const { width, height } = await sharp(inputPath).metadata();

  // Square size = width (portrait: width < height)
  const size = width;
  const left = 0;
  const top = Math.round((height - size) * verticalCenter);

  const baseName = path.basename(file, '.png');

  // Full resolution square crop
  const fullOutPath = path.join(OUTPUT_FULL_DIR, `${baseName}-square.png`);
  await sharp(inputPath)
    .extract({ left, top, width: size, height: size })
    .png()
    .toFile(fullOutPath);

  // 256x256 scaled
  const thumbOutPath = path.join(OUTPUT_256_DIR, `${baseName}-256.png`);
  await sharp(inputPath)
    .extract({ left, top, width: size, height: size })
    .resize(256, 256, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(thumbOutPath);

  console.log(`✓ ${file}`);
  console.log(`  full  → ${path.relative(process.cwd(), fullOutPath)}`);
  console.log(`  256px → ${path.relative(process.cwd(), thumbOutPath)}`);
  console.log(`  crop  : top=${top}px, ${size}x${size} (verticalCenter=${verticalCenter})`);
}

async function main() {
  await ensureDir(OUTPUT_FULL_DIR);
  await ensureDir(OUTPUT_256_DIR);

  console.log('Cropping logos...\n');
  for (const img of images) {
    await cropImage(img);
    console.log('');
  }
  console.log('Done! Check images-cropped-full/ and images-cropped-256/');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
