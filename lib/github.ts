import { Octokit } from "octokit";

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
    } catch (e) {
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
 * Fetches all posts from the content/posts directory.
 */
export async function fetchPostsFromGitHub() {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: "content/posts",
      ref: BRANCH,
    });

    if (Array.isArray(data)) {
      return data.filter(file => file.name.endsWith(".md"));
    }
    return [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
