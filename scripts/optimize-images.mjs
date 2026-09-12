import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetDirs = [
  path.join(rootDir, 'src', 'photography'),
  path.join(rootDir, 'src', 'imports')
];
const targetFiles = [
  path.join(rootDir, 'src', 'AbishekforAbout.png')
];

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 80;

const exts = ['.jpg', '.jpeg', '.png', '.webp'];

async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!exts.includes(ext)) return;

  const parsed = path.parse(filePath);
  const outPath = path.join(parsed.dir, `${parsed.name}.webp`);

  // If it's already a webp, we might still want to resize and optimize it.
  // We'll read the image, get its metadata, and resize it if needed.
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let needsResize = false;
    let width = metadata.width;
    let height = metadata.height;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      needsResize = true;
      if (width > height) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      } else {
        width = Math.round(width * (MAX_HEIGHT / height));
        height = MAX_HEIGHT;
      }
    }

    let pipeline = image.webp({ quality: QUALITY });
    if (needsResize) {
      pipeline = pipeline.resize(width, height);
    }

    const tempOut = outPath + '.tmp.webp';
    await pipeline.toFile(tempOut);

    fs.renameSync(tempOut, outPath);

    if (filePath !== outPath) {
      fs.unlinkSync(filePath);
      console.log(`Converted and deleted: ${path.relative(rootDir, filePath)}`);
    } else {
      console.log(`Optimized: ${path.relative(rootDir, filePath)}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await walkDir(fullPath);
    } else {
      await processImage(fullPath);
    }
  }
}

async function run() {
  console.log('Starting image optimization...');
  for (const file of targetFiles) {
    if (fs.existsSync(file)) {
      await processImage(file);
    }
  }
  for (const dir of targetDirs) {
    await walkDir(dir);
  }
  console.log('Finished image optimization!');
}

run();
