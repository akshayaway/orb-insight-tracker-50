#!/usr/bin/env node
/**
 * scripts/generate-icons.js
 *
 * Usage:
 * 1. Put your source PNG (square, high-res) at `public/source-icon.png`.
 * 2. npm install sharp
 * 3. node scripts/generate-icons.js
 *
 * This will generate `public/icon-192.png`, `public/icon-512.png` and
 * a minimal set of Android mipmap PNGs under `android/app/src/main/res/` if
 * the android project exists.
 */

const fs = require('fs')
const path = require('path')
let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('Dependency `sharp` not found. Please run: npm install sharp')
  process.exit(1)
}

const root = path.resolve(__dirname, '..')
const src = path.join(root, 'public', 'source-icon.png')
if (!fs.existsSync(src)) {
  console.error('Source icon not found at', src)
  console.error('Please place your high-resolution PNG at public/source-icon.png')
  process.exit(1)
}

const outPublic = path.join(root, 'public')
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res')

const sizes = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 }
]

async function gen() {
  // manifest icons
  await sharp(src).resize(192, 192).png().toFile(path.join(outPublic, 'icon-192.png'))
  await sharp(src).resize(512, 512).png().toFile(path.join(outPublic, 'icon-512.png'))
  console.log('Generated public/icon-192.png and public/icon-512.png')

  // Android mipmap
  if (fs.existsSync(androidRes)) {
    for (const s of sizes) {
      const dir = path.join(androidRes, `mipmap-${s.name}`)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const out = path.join(dir, 'ic_launcher.png')
      await sharp(src).resize(s.size, s.size).png().toFile(out)
      console.log('Wrote', out)
    }
    // Adaptive icon foreground/background (simple fallback)
    const mipmapAny = path.join(androidRes, 'mipmap-anydpi-v26')
    if (!fs.existsSync(mipmapAny)) fs.mkdirSync(mipmapAny, { recursive: true })
    // Create a simple ic_launcher.xml referencing the png (this is a minimal fallback)
    const xml = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android=\"http://schemas.android.com/apk/res/android\">\n  <background android:drawable=\"@mipmap/ic_launcher_background\"/>\n  <foreground android:drawable=\"@mipmap/ic_launcher_foreground\"/>\n</adaptive-icon>`
    fs.writeFileSync(path.join(mipmapAny, 'ic_launcher.xml'), xml)
    // Also write simple foreground/background PNGs
    await sharp(src).resize(108, 108).png().toFile(path.join(androidRes, 'mipmap-mdpi', 'ic_launcher_foreground.png'))
    await sharp(src).resize(48, 48).png().toFile(path.join(androidRes, 'mipmap-mdpi', 'ic_launcher_background.png'))
    console.log('Wrote adaptive icon placeholders to Android resources')
  } else {
    console.log('Android project not found, skipped writing to android res folder.')
  }
}

gen().catch((err) => {
  console.error(err)
  process.exit(1)
})
