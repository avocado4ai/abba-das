/**
 * Image generation script using Hugging Face Inference API
 * Uses the provided API key to generate high-quality images.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'posts');
const FORCE_ALL = process.argv.includes('--all') || process.argv.includes('--regenerate');
const HF_TOKEN = process.env.HF_TOKEN;
// FLUX.1-schnell is a high-quality, fast open model
const MODEL = "black-forest-labs/FLUX.1-schnell";

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
  console.log(`\n🎨  Generating: ${slug}`);
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        headers: { 
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ inputs: fullPrompt }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HF API error: ${response.status} ${errorText}`);
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
      await sleep(2000); // Be respectful of API limits
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
