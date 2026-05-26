import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Nano Banana - Realistic Image Generation Script
// Usage: GEMINI_API_KEY=xxx node scripts/nano-banana-gen.mjs

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'posts');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateImage(prompt, slug) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log(`[SKIPPED] ${slug}: No GEMINI_API_KEY provided.`);
    return null;
  }

  console.log(`[GENERATING] ${slug}: ${prompt}`);
  
  try {
    // Note: This uses the Gemini image generation model
    // Adjust the endpoint if necessary based on the specific Nano Banana setup
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate a realistic image based on this prompt: ${prompt}` }] }],
          // This is a placeholder logic. Real image generation via Gemini API 
          // usually requires a different endpoint or specific model parameters.
        }),
      }
    );

    const data = await response.json();
    // Logic to handle image bytes if the model returns them...
    // For now, this is a template.
    
    return `/images/posts/${slug}.webp`; 
  } catch (error) {
    console.error(`[ERROR] ${slug}:`, error.message);
    return null;
  }
}

async function processPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(content);

    if (data.featuredImage && data.featuredImage.prompt && !data.featuredImage.generated) {
      const slug = file.replace('.md', '');
      const imageUrl = await generateImage(data.featuredImage.prompt, slug);
      
      if (imageUrl) {
        data.featuredImage.src = imageUrl;
        data.featuredImage.generated = true;
        const updatedContent = matter.stringify(body, data);
        fs.writeFileSync(filePath, updatedContent);
        console.log(`[UPDATED] ${file}`);
      }
    }
  }
}

processPosts().catch(console.error);
