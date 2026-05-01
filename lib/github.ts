import { Octokit } from "octokit";
import matter from "gray-matter";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = process.env.GITHUB_OWNER || "";
const REPO = process.env.GITHUB_REPO || "";
const BRANCH = "main";

export interface PostData {
  title: string;
  content: string;
  date: string;
  slug: string;
  weather?: string;
}

/**
 * Saves a blog post as a Markdown file to the GitHub repository.
 */
export async function savePostToGitHub(post: PostData) {
  const path = `content/posts/${post.slug}.md`;
  const message = `Add new post: ${post.title}`;
  
  const content = `---
title: "${post.title}"
date: "${post.date}"
weather: "${post.weather || 'sunny'}"
---

${post.content}
`;

  const contentBase64 = Buffer.from(content).toString("base64");

  try {
    // Check if file exists to get its SHA (for updates)
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path,
        ref: BRANCH,
      });
      if (!Array.isArray(data)) {
        sha = data.sha;
      }
    } catch {
      // File doesn't exist, which is fine for new posts
    }

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path,
      content: contentBase64,
      message,
      sha,
      branch: BRANCH,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving to GitHub:", error);
    throw error;
  }
}

/**
 * Fetches a single post by its slug.
 */
export async function getPostBySlug(slug: string): Promise<PostData | null> {
  try {
    const path = `content/posts/${slug}.md`;
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH,
    });

    if ("content" in fileData) {
      const content = Buffer.from(fileData.content, "base64").toString("utf-8");
      const { data: frontmatter, content: body } = matter(content);
      
      return {
        title: frontmatter.title || slug,
        date: frontmatter.date || "",
        weather: frontmatter.weather || "sunny",
        slug: slug,
        content: body,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

/**
 * Fetches adjacent posts (next and previous) for a given slug.
 */
export async function getAdjacentPosts(slug: string): Promise<{ next: PostData | null, prev: PostData | null }> {
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);

  if (currentIndex === -1) return { next: null, prev: null };

  // Posts are sorted newest first, so:
  // prev (older) is at index + 1
  // next (newer) is at index - 1
  return {
    next: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    prev: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
  };
}

/**
 * Fetches all posts from the content/posts directory with their content parsed.
 */
export async function getAllPosts(): Promise<PostData[]> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: "content/posts",
      ref: BRANCH,
    });

    if (!Array.isArray(data)) return [];

    const postFiles = data.filter(file => file.name.endsWith(".md"));

    const posts = (await Promise.all(
      postFiles.map(async (file) => {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path: file.path,
          ref: BRANCH,
        });

        if ("content" in fileData) {
          const content = Buffer.from(fileData.content, "base64").toString("utf-8");
          const { data: frontmatter, content: body } = matter(content);
          
          const post: PostData = {
            title: frontmatter.title || file.name.replace(".md", ""),
            date: frontmatter.date || "",
            weather: frontmatter.weather || "sunny",
            slug: file.name.replace(".md", ""),
            content: body,
          };
          return post;
        }
        return null;
      })
    )).filter((post): post is PostData => post !== null);

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
