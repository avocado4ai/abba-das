/**
 * Post image generation script — Gemini API (headless batch mode)
 *
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/nano-banana-gen.mjs
 *   GEMINI_API_KEY=your_key node scripts/nano-banana-gen.mjs --all        # regenerate existing
 *   GEMINI_API_KEY=your_key node scripts/nano-banana-gen.mjs --regenerate # alias for --all
 *
 * What it does:
 *   1. Reads every post in content/posts/
 *   2. For posts whose featuredImage.src points to /images/posts/ but the file is missing,
 *      generates the image using Gemini (using the post's stored prompt)
 *   3. Saves the result to public/images/posts/<slug>.webp
 *   4. Retries up to 3 times with exponential backoff on API errors
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'posts');
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
const FORCE_ALL = process.argv.includes('--all') || process.argv.includes('--regenerate');
const MAX_RETRIES = 3;

console.log(`\n🤖  Model: ${MODEL}`);

// Master style wrapper — matches the blog's cream/sage/coral/warm-gold palette
const MASTER_STYLE = `
Ultra-realistic warm film photography, high-quality 16:9 image.
Visual style: warm Mediterranean family memory. Soft, natural daylight or golden hour.
Color palette: sage green, soft coral, warm gold, ivory cream — muted and gentle.
Mood: intimate, nostalgic, emotionally warm. No text, no watermarks, no logos, no writing of any kind.
Composition: cinematic, slightly soft-focus background (bokeh), 8k resolution.
Film grain: subtle. No HDR over-processing. No stock-photo clichés.
`.trim();

function wrapWithMasterStyle(specificPrompt) {
  return `${specificPrompt}\n\n${MASTER_STYLE}`;
}

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateImage(prompt, slug) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌  GEMINI_API_KEY is not set.');
    process.exit(1);
  }

  const fullPrompt = wrapWithMasterStyle(prompt);
  console.log(`\n🎨  Generating: ${slug}`);
  console.log(`    Prompt: ${prompt.slice(0, 80)}...`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const t0 = Date.now();
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Gemini API ${response.status}: ${err?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(p => p.inlineData?.data || p.inline_data?.data);

      if (!imagePart) {
        const textOnly = parts.map(p => p.text).filter(Boolean).join(' ');
        throw new Error(`No image in response: ${textOnly || '(empty)'}`);
      }

      const inlineData = imagePart.inlineData || imagePart.inline_data;
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`    ✔  Done in ${elapsed}s`);

      return {
        imageBase64: inlineData.data,
        mimeType: inlineData.mimeType || inlineData.mime_type || 'image/png',
        ext: extensionFromMimeType(inlineData.mimeType || inlineData.mime_type || 'image/png'),
      };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const delay = 2000 * attempt;
        console.warn(`    ⚠️   Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}. Retrying in ${delay / 1000}s…`);
        await sleep(delay);
      } else {
        throw err;
      }
    }
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
      const { imageBase64, ext } = await generateImage(prompt, slug);
      const outputFilename = `${slug}.${ext}`;
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));

      const newSrc = `/images/posts/${outputFilename}`;
      console.log(`    💾  Saved → public${newSrc}`);

      if (src !== newSrc) {
        frontmatter.featuredImage = { ...frontmatter.featuredImage, src: newSrc };
        fs.writeFileSync(filePath, matter.stringify(body, frontmatter));
        console.log(`    ✔  Updated frontmatter: ${src} → ${newSrc}`);
      }

      results.generated++;

      if (i < files.length - 1) await sleep(2000);
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
  if (results.errors.length) {
    console.log('  Failed slugs:', results.errors.join(', '));
  }
  if (results.generated > 0) {
    console.log('\n👉  Next: git add public/images/posts/ content/posts/ && git commit');
  }
}

processPosts().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
