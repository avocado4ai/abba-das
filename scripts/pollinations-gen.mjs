/**
 * Free Image generation script using Pollinations.ai
 * No API key required.
 *
 * Usage:
 *   node scripts/pollinations-gen.mjs
 *   node scripts/pollinations-gen.mjs --all        # regenerate existing
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'posts');
const FORCE_ALL = process.argv.includes('--all') || process.argv.includes('--regenerate');

// Master style wrapper — matches the blog's cream/sage/coral/warm-gold palette
const MASTER_STYLE = `
Ultra-realistic warm film photography, high-quality 16:9 image.
Visual style: warm Mediterranean family memory. Soft, natural daylight or golden hour.
Color palette: sage green, soft coral, warm gold, ivory cream — muted and gentle.
Mood: intimate, nostalgic, emotionally warm. No text, no watermarks, no logos, no writing of any kind.
Composition: cinematic, slightly soft-focus background (bokeh).
Film grain: subtle. No HDR over-processing. No stock-photo clichés.
`.trim();

function wrapWithMasterStyle(specificPrompt) {
  return `${specificPrompt} ${MASTER_STYLE}`;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateImage(prompt, slug) {
  const fullPrompt = wrapWithMasterStyle(prompt);
  const encodedPrompt = encodeURIComponent(fullPrompt);
  // Using Pollinations Flux model for high quality
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&model=flux&seed=${seed}`;

  console.log(`\n🎨  Generating: ${slug}`);
  console.log(`    URL: ${url.slice(0, 100)}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    throw err;
  }
}

async function processPosts() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁  Created ${OUTPUT_DIR}`);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const results = { generated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: body } = matter(raw);
    const slug = file.replace(/\.md$/, '');

    const src = frontmatter.featuredImage?.src;
    const prompt = frontmatter.featuredImage?.prompt;

    if (!prompt) {
      console.log(`⏭   ${slug}: no prompt, skipping`);
      results.skipped++;
      continue;
    }

    const localSrc = src?.startsWith('/images/') ? path.join(process.cwd(), 'public', src) : null;
    const fileExists = localSrc && fs.existsSync(localSrc);

    if (fileExists && !FORCE_ALL) {
      console.log(`✅  ${slug}: image exists (${src}) — pass --all to regenerate`);
      results.skipped++;
      continue;
    }

    try {
      const imageBuffer = await generateImage(prompt, slug);
      const outputFilename = `${slug}.webp`;
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      fs.writeFileSync(outputPath, imageBuffer);

      const newSrc = `/images/posts/${outputFilename}`;
      console.log(`    💾  Saved → public${newSrc}`);

      if (src !== newSrc) {
        frontmatter.featuredImage = { ...frontmatter.featuredImage, src: newSrc };
        fs.writeFileSync(filePath, matter.stringify(body, frontmatter));
        console.log(`    ✔  Updated frontmatter: ${src} → ${newSrc}`);
      }

      results.generated++;
      // Pollinations is free but let's be polite
      await sleep(1000);
    } catch (err) {
      console.error(`    ❌  ${slug}: ${err.message}`);
      results.errors.push(slug);
    }
  }

  console.log('\n┌─────────────────────────────────────┐');
  console.log(`│  Generated : ${String(results.generated).padEnd(24)}│`);
  console.log(`│  Skipped   : ${String(results.skipped).padEnd(24)}│`);
  console.log(`│  Errors    : ${String(results.errors.length).padEnd(24)}│`);
  console.log('└─────────────────────────────────────┘');
}

processPosts().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
