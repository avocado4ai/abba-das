import { getAllPosts } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await getAllPosts();
  const siteUrl = "https://abba-das.vercel.app";

  const items = posts
    .map((post) => {
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/post/${post.slug}</link>
      <guid>${siteUrl}/post/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.content.substring(0, 300)}...]]></description>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>אבא-דס | הסיפורים של אבא</title>
    <link>${siteUrl}</link>
    <description>זכרונות, מחשבות ורגעים קטנים מהחיים</description>
    <language>he</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
