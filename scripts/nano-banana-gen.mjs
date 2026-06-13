/**
 * Post image generation script — Gemini API
 *
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/nano-banana-gen.mjs
 *
 * What it does:
 *   1. Reads every post in content/posts/
 *   2. For posts whose featuredImage.src points to /images/posts/ but the file is missing,
 *      generates the image using Gemini (using the post's stored prompt)
 *   3. Saves the result to public/images/posts/<slug>.webp
 *   4. Optionally pass --all to regenerate even existing images
 *
 * Master style (raya-v1 approach): each post-specific prompt is wrapped in a
 * consistent style wrapper that matches the blog's visual identity.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'posts');
const MODEL = 'gemini-2.0-flash-preview-image-generation';
const FORCE_ALL = process.argv.includes('--all');

// Master style wrapper — matches the blog's cream/sage/coral/warm-gold palette
const MASTER_STYLE = `
Photorealistic, high-quality 16:9 photograph.
Visual style: warm Mediterranean family memory. Soft, natural daylight.
Color palette: sage green, soft coral, warm gold, ivory cream — muted and gentle.
Mood: intimate, nostalgic, emotionally warm. No text or watermarks.
Composition: cinematic, slightly soft focus background (bokeh), 8k resolution.
`.trim();

function wrapWithMasterStyle(specificPrompt) {
  return `${specificPrompt}\n\n${MASTER_STYLE}`;
}

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

async function generateImage(prompt, slug) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌  GEMINI_API_KEY is not set. Run: GEMINI_API_KEY=your_key node scripts/nano-banana-gen.mjs');
    process.exit(1);
  }

  const fullPrompt = wrapWithMasterStyle(prompt);
  console.log(`\n🎨  Generating: ${slug}`);
  console.log(`    Prompt: ${prompt.slice(0, 80)}...`);

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
    throw new Error(`Gemini API error ${response.status}: ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  const imagePart = parts.find(p => p.inlineData?.data || p.inline_data?.data);
  if (!imagePart) {
    const textOnly = parts.map(p => p.text).filter(Boolean).join(' ');
    throw new Error(`Gemini returned no image. Response: ${textOnly || '(empty)'}`);
  }

  const inlineData = imagePart.inlineData || imagePart.inline_data;
  const imageBase64 = inlineData.data;
  const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/png';
  const ext = extensionFromMimeType(mimeType);

  return { imageBase64, mimeType, ext };
}

async function processPosts() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁  Created ${OUTPUT_DIR}`);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: body } = matter(raw);
    const slug = file.replace(/\.md$/, '');

    const src = frontmatter.featuredImage?.src;
    const prompt = frontmatter.featuredImage?.prompt;

    if (!prompt) {
      console.log(`⏭   ${slug}: no prompt in frontmatter, skipping`);
      skipped++;
      continue;
    }

    // Determine output path from the src field (e.g. /images/posts/slug.webp → public/images/posts/slug.webp)
    const localSrc = src?.startsWith('/images/') ? path.join(process.cwd(), 'public', src) : null;
    const fileExists = localSrc && fs.existsSync(localSrc);

    if (fileExists && !FORCE_ALL) {
      console.log(`✅  ${slug}: image already exists (${src}), skipping (use --all to regenerate)`);
      skipped++;
      continue;
    }

    try {
      const { imageBase64, ext } = await generateImage(prompt, slug);

      // Determine where to save
      const outputFilename = `${slug}.${ext}`;
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));

      const newSrc = `/images/posts/${outputFilename}`;
      console.log(`    ✔  Saved → public${newSrc}`);

      // Update frontmatter src if it changed (e.g. .png vs .webp)
      if (src !== newSrc) {
        frontmatter.featuredImage = { ...frontmatter.featuredImage, src: newSrc };
        const updated = matter.stringify(body, frontmatter);
        fs.writeFileSync(filePath, updated);
        console.log(`    ✔  Updated frontmatter src: ${src} → ${newSrc}`);
      }

      generated++;

      // Be polite to the API — 2s between requests
      if (files.indexOf(file) < files.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`    ❌  ${slug}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n📊  Done: ${generated} generated, ${skipped} skipped, ${errors} errors`);
  if (generated > 0) {
    console.log('\n👉  Next steps:');
    console.log('    1. git add public/images/posts/ content/posts/');
    console.log('    2. git commit -m "Add: AI-generated post images"');
    console.log('    3. git push  (Vercel auto-deploys from main)');
  }
}

processPosts().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
