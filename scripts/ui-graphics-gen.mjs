/**
 * UI graphics generation script — Gemini API (headless batch mode)
 *
 * Generates static visual assets for the site redesign.
 * Saves to public/images/ui/
 *
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/ui-graphics-gen.mjs
 *   GEMINI_API_KEY=your_key node scripts/ui-graphics-gen.mjs --all   # regenerate existing
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'ui');
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
const FORCE_ALL = process.argv.includes('--all');
const MAX_RETRIES = 3;

console.log(`\n🤖  Model: ${MODEL}`);

// Shared visual identity for all UI assets
const STYLE_CORE = `
No text, no watermarks, no logos, no writing of any kind.
Color palette: sage green (#7E9983), soft coral (#D97760), warm gold (#C4A572), ivory cream (#F5F5F1), deep navy (#0A2647).
Mood: warm, intimate, family-oriented, Mediterranean.
Photography or illustration style: warm film, natural light, muted tones.
`.trim();

const ASSETS = [
  {
    name: 'hero-bg',
    filename: 'hero-bg.webp',
    description: 'Hero section background — 16:9',
    prompt: `A warm, inviting Mediterranean living room or garden in soft golden afternoon light.
Shallow depth of field, sage-green plants in the background, cream-colored walls, wooden furniture.
16:9 landscape orientation. Slightly blurred for text overlay use (background use only).
${STYLE_CORE}`,
  },
  {
    name: 'empty-stories',
    filename: 'empty-stories.webp',
    description: 'Empty state illustration — 4:3',
    prompt: `An open blank notebook or journal resting on a warm wooden table, next to a cup of tea or coffee.
Soft afternoon window light. Inviting and cozy atmosphere. A pen resting on the open page.
4:3 landscape orientation. Warm and hopeful mood — "no stories yet, be the first".
${STYLE_CORE}`,
  },
  {
    name: 'divider-ornament',
    filename: 'divider-ornament.webp',
    description: 'Decorative section divider — wide strip',
    prompt: `A delicate olive branch or floral botanical strip/border illustration, horizontal orientation.
Painterly style, watercolor-like. Sage green leaves, small coral-colored flowers, warm gold accents.
Very wide and narrow aspect ratio (8:1). Isolated on cream/white background — suitable for use as a divider.
${STYLE_CORE}`,
  },
  {
    name: 'guestbook-header',
    filename: 'guestbook-header.webp',
    description: 'Guestbook page header — 16:9',
    prompt: `A vintage open guestbook or guest register on a warm wooden table.
Aged paper pages, soft warm light, perhaps a fountain pen beside it.
16:9 landscape orientation. Nostalgic, welcoming mood.
${STYLE_CORE}`,
  },
];

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateImage(asset) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌  GEMINI_API_KEY is not set.');
    process.exit(1);
  }

  console.log(`\n🎨  Generating: ${asset.name} (${asset.description})`);
  console.log(`    Prompt: ${asset.prompt.split('\n')[0].slice(0, 80)}…`);

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
            contents: [{ parts: [{ text: asset.prompt }] }],
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

async function processAssets() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁  Created ${OUTPUT_DIR}`);
  }

  const results = { generated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    const outputPath = path.join(OUTPUT_DIR, asset.filename);
    const fileExists = fs.existsSync(outputPath);

    if (fileExists && !FORCE_ALL) {
      console.log(`✅  ${asset.name}: already exists — pass --all to regenerate`);
      results.skipped++;
      continue;
    }

    try {
      const { imageBase64, ext } = await generateImage(asset);

      // Use the declared filename but honour actual ext from API
      const actualFilename = asset.filename.replace(/\.[^.]+$/, `.${ext}`);
      const actualPath = path.join(OUTPUT_DIR, actualFilename);
      fs.writeFileSync(actualPath, Buffer.from(imageBase64, 'base64'));
      console.log(`    💾  Saved → public/images/ui/${actualFilename}`);

      results.generated++;

      if (i < ASSETS.length - 1) await sleep(2000);
    } catch (err) {
      console.error(`    ❌  ${asset.name}: ${err.message}`);
      results.errors.push(asset.name);
    }
  }

  console.log('\n┌─────────────────────────────────────┐');
  console.log(`│  Generated : ${String(results.generated).padEnd(24)}│`);
  console.log(`│  Skipped   : ${String(results.skipped).padEnd(24)}│`);
  console.log(`│  Errors    : ${String(results.errors.length).padEnd(24)}│`);
  console.log('└─────────────────────────────────────┘');
  if (results.errors.length) {
    console.log('  Failed assets:', results.errors.join(', '));
  }
  if (results.generated > 0) {
    console.log('\n👉  Assets saved to public/images/ui/');
    console.log('    Reference them in components as /images/ui/<filename>');
  }
}

processAssets().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
