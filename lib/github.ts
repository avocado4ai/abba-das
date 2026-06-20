import { getOctokit, getGitHubConfig } from "./github-client";
import matter from "gray-matter";
import { cache } from "react";

const BRANCH = "main";

function httpStatus(e: unknown): number | undefined {
  return typeof e === "object" && e !== null && "status" in e
    ? (e as { status: number }).status
    : undefined;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export interface PostData {
  title: string;
  content: string;
  date: string;
  slug: string;
  weather?: string;
  tags?: string[];
  contentType?: 'story' | 'audio-story' | 'whatsapp-friday' | 'photo' | 'message' | 'memory';
  category?: 'family' | 'memories' | 'thoughts' | 'inspiration' | 'reflection' | 'moments';
}

export interface CommentData {
  id: string;
  name: string;
  message: string;
  date: string;
}

/**
 * Saves a comment to the GitHub repository.
 */
export async function saveCommentToGitHub(slug: string, comment: CommentData) {
  const config = getGitHubConfig();
  const octokit = getOctokit();
  
  if (!config || !octokit) {
    console.warn("GitHub configuration missing. Comment not saved to remote.");
    return null;
  }

  const path = `content/comments/${slug}.json`;
  const message = `Add comment to post: ${slug}`;
  
  try {
    let currentComments: CommentData[] = [];
    let sha: string | undefined;

    // Try to fetch existing comments
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path,
        ref: BRANCH,
      });

      if (!Array.isArray(data) && "content" in data) {
        sha = data.sha;
        currentComments = JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
      }
    } catch (e: unknown) {
      if (httpStatus(e) !== 404) {
        console.error(`Error fetching comments for ${slug}:`, e);
      }
      // 404 means file doesn't exist yet, which is fine
    }

    // Add new comment to the list
    const updatedComments = [comment, ...currentComments];
    const contentBase64 = Buffer.from(JSON.stringify(updatedComments, null, 2)).toString("base64");

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path,
      content: contentBase64,
      message,
      sha,
      branch: BRANCH,
    });

    return response.data;
  } catch (error) {
    console.error(`Error saving comment for ${slug}:`, error);
    throw error;
  }
}

/**
 * Fetches all comments for a specific post slug.
 */
export const getCommentsForPost = cache(async (slug: string): Promise<CommentData[]> => {
  const config = getGitHubConfig();
  const octokit = getOctokit();
  
  if (!config || !octokit) return [];

  try {
    const path = `content/comments/${slug}.json`;
    const { data } = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
      ref: BRANCH,
    });

    if (!Array.isArray(data) && "content" in data) {
      return JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
    }
    return [];
  } catch (e: unknown) {
    if (httpStatus(e) !== 404) {
      console.error(`Error fetching comments for ${slug}:`, e);
    }
    return [];
  }
});

/**
 * Deletes a comment by ID from a post's comments file in GitHub.
 */
export async function deleteCommentFromGitHub(slug: string, commentId: string) {
  const config = getGitHubConfig();
  const octokit = getOctokit();

  if (!config || !octokit) {
    throw new Error("GitHub configuration missing");
  }

  const path = `content/comments/${slug}.json`;
  const message = `Delete comment from post: ${slug}`;

  let currentComments: CommentData[] = [];
  let sha: string | undefined;

  const { data } = await octokit.rest.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path,
    ref: BRANCH,
  });

  if (!Array.isArray(data) && "content" in data) {
    sha = data.sha;
    currentComments = JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
  }

  const updatedComments = currentComments.filter(comment => comment.id !== commentId);

  if (updatedComments.length === currentComments.length) {
    throw new Error("Comment not found");
  }

  const contentBase64 = Buffer.from(JSON.stringify(updatedComments, null, 2)).toString("base64");

  const response = await octokit.rest.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path,
    content: contentBase64,
    message,
    sha,
    branch: BRANCH,
  });

  return response.data;
}

/**
 * Saves a blog post as a Markdown file to the GitHub repository.
 */
export async function savePostToGitHub(post: PostData) {
  const config = getGitHubConfig();
  const octokit = getOctokit();
  
  if (!config || !octokit) {
    throw new Error("GitHub configuration missing");
  }

  const path = `content/posts/${post.slug}.md`;
  const message = `Add new post: ${post.title}`;
  
  const content = `---
title: "${post.title}"
date: "${post.date}"
weather: "${post.weather || 'sunny'}"
contentType: "${post.contentType || 'story'}"
category: "${post.category || 'memories'}"
tags: ${JSON.stringify(post.tags || [])}
---

${post.content}
`;

  const contentBase64 = Buffer.from(content).toString("base64");

  try {
    // Check if file exists to get its SHA (for updates)
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path,
        ref: BRANCH,
      });
      if (!Array.isArray(data)) {
        sha = data.sha;
      }
    } catch (e: unknown) {
      if (httpStatus(e) !== 404) {
        console.error(`Error checking post existence for ${post.slug}:`, e);
      }
    }

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
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
export const getPostBySlug = cache(async (slug: string): Promise<PostData | null> => {
  const config = getGitHubConfig();
  const octokit = getOctokit();
  
  if (!config || !octokit) return null;

  try {
    const path = `content/posts/${slug}.md`;
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
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
        tags: frontmatter.tags || [],
        slug: slug,
        content: body,
        contentType: frontmatter.contentType || "story",
        category: frontmatter.category || "memories",
      };
    }
    return null;
  } catch (e: unknown) {
    if (httpStatus(e) !== 404) {
      console.error(`Error fetching post ${slug}:`, e);
    }
    return null;
  }
});

/**
 * Fetches adjacent posts (next and previous) for a given slug.
 */
export async function getAdjacentPosts(slug: string): Promise<{ next: PostData | null, prev: PostData | null }> {
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);

  if (currentIndex === -1) return { next: null, prev: null };

  return {
    next: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    prev: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
  };
}

/**
 * Fetches all posts from the content/posts directory with their content parsed.
 */
export const getAllPosts = cache(async (): Promise<PostData[]> => {
  const config = getGitHubConfig();
  const octokit = getOctokit();
  
  if (!config || !octokit) return [];

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: "content/posts",
      ref: BRANCH,
    });

    if (!Array.isArray(data)) return [];

    const postFiles = data.filter(file => file.name.endsWith(".md"));

    const posts = (await Promise.all(
      postFiles.map(async (file) => {
        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner: config.owner,
            repo: config.repo,
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
              tags: frontmatter.tags || [],
              slug: file.name.replace(".md", ""),
              content: body,
              contentType: frontmatter.contentType || "story",
              category: frontmatter.category || "memories",
            };
            return post;
          }
        } catch (e: unknown) {
          console.error(`Error fetching post content for ${file.name}:`, errorMessage(e));
        }
        return null;
      })
    )).filter((post): post is PostData => post !== null);

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
});
