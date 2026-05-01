import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content/posts');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_TO = process.env.EMAIL_TO;

async function generateSummary() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('Posts directory not found.');
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const newPosts = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data, content: body } = matter(content);
    const postDate = new Date(data.date);

    if (postDate >= oneWeekAgo) {
      newPosts.push({
        title: data.title,
        date: data.date,
        slug: file.replace('.md', ''),
        excerpt: body.substring(0, 150).trim() + '...',
      });
    }
  }

  if (newPosts.length === 0) {
    console.log('No new posts this week.');
    return;
  }

  console.log(`Found ${newPosts.length} new posts. Generating email...`);

  const html = `
    <div style="direction: rtl; font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5F5F1; color: #0A2647;">
      <h1 style="text-align: center; color: #0A2647;">אבא-דס: סיכום שבועי</h1>
      <p style="text-align: center; color: #7E9983; font-size: 18px;">הנה הסיפורים החדשים שעלו השבוע בבלוג:</p>
      
      <div style="margin-top: 40px;">
        ${newPosts.map(post => `
          <div style="background-color: white; padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(10, 38, 71, 0.1);">
            <h2 style="margin-top: 0; color: #0A2647;">${post.title}</h2>
            <p style="color: #7E9983; font-size: 12px;">${new Date(post.date).toLocaleDateString('he-IL')}</p>
            <p style="line-height: 1.6;">${post.excerpt}</p>
            <a href="https://abba-das.vercel.app/post/${post.slug}" style="display: inline-block; margin-top: 10px; color: #7E9983; font-weight: bold; text-decoration: none;">קרא עוד ←</a>
          </div>
        `).join('')}
      </div>

      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: rgba(10, 38, 71, 0.4);">
        <p>© ${new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.</p>
        <p><a href="https://abba-das.vercel.app" style="color: inherit;">לביקור בבלוג</a></p>
      </footer>
    </div>
  `;

  if (!RESEND_API_KEY || !EMAIL_TO) {
    console.log('RESEND_API_KEY or EMAIL_TO not set. Printing HTML to console:');
    console.log(html);
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Abba-Das <onboarding@resend.dev>',
        to: EMAIL_TO.split(','),
        subject: `אבא-דס: ${newPosts.length} סיפורים חדשים מחכים לך`,
        html: html,
      }),
    });

    if (response.ok) {
      console.log('Email sent successfully!');
    } else {
      const error = await response.json();
      console.error('Failed to send email:', error);
    }
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

generateSummary();
