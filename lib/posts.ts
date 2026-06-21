import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { cache } from "react";
import { getOctokit, getGitHubConfig } from "./github-client";

export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
  showInGallery?: boolean;
  aiGenerated?: boolean;
}

export interface PostData {
  title: string;
  content: string;
  date: string;
  slug: string;
  author?: string;
  archived?: boolean;
  weather?: string;
  tags?: string[];
  featuredImage?: {
    src: string;
    alt?: string;
    caption?: string;
    showInGallery?: boolean;
    aiGenerated?: boolean;
  };
  gallery?: GalleryImage[];
  contentType?: "story" | "audio-story" | "whatsapp-friday" | "photo" | "message" | "memory";
  category?: "family" | "memories" | "thoughts" | "inspiration" | "reflection" | "moments";
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const BRANCH = "main";

function postFromMarkdown(slug: string, markdown: string): PostData {
  const { data: frontmatter, content } = matter(markdown);
  const rawFeaturedImage = frontmatter.featuredImage;
  const featuredImage =
    typeof rawFeaturedImage === "string"
      ? { src: rawFeaturedImage, alt: frontmatter.imageAlt || frontmatter.title || slug }
      : rawFeaturedImage && typeof rawFeaturedImage === "object" && typeof rawFeaturedImage.src === "string"
        ? {
            src: rawFeaturedImage.src,
            alt: rawFeaturedImage.alt || rawFeaturedImage.title || frontmatter.title || slug,
            caption: rawFeaturedImage.caption || rawFeaturedImage.description || "",
            showInGallery: typeof rawFeaturedImage.showInGallery === "boolean" ? rawFeaturedImage.showInGallery : undefined,
            aiGenerated: rawFeaturedImage.aiGenerated === true ? true : undefined,
          }
        : undefined;

  const rawGallery = frontmatter.gallery;
  const gallery: GalleryImage[] | undefined =
    Array.isArray(rawGallery)
      ? rawGallery
          .filter((item): item is Record<string, unknown> => item && typeof item === "object" && typeof item.src === "string")
          .map((item) => ({
            src: item.src as string,
            alt: typeof item.alt === "string" ? item.alt : undefined,
            caption: typeof item.caption === "string" ? item.caption : undefined,
            showInGallery: typeof item.showInGallery === "boolean" ? item.showInGallery : undefined,
            aiGenerated: item.aiGenerated === true ? true : undefined,
          }))
      : undefined;

  return {
    title: frontmatter.title || slug,
    date: frontmatter.date || "",
    author: frontmatter.author || "",
    archived: frontmatter.archived === true ? true : undefined,
    weather: frontmatter.weather || "sunny",
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    slug,
    content,
    featuredImage,
    gallery: gallery?.length ? gallery : undefined,
    contentType: frontmatter.contentType || "story",
    category: frontmatter.category || "memories",
  };
}

function assertSafeSlug(slug: string) {
  if (!slug || slug.includes("/") || slug.includes("\\") || slug.includes("..")) {
    throw new Error("Invalid post slug");
  }
}

async function getAllPostsLocal(): Promise<PostData[]> {
  try {
    const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
    const postFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name);

    const posts = await Promise.all(
      postFiles.map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const markdown = await fs.readFile(path.join(POSTS_DIR, fileName), "utf8");
        return postFromMarkdown(slug, markdown);
      })
    );

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error reading local posts:", error);
    return [];
  }
}

async function getAllPostsFromGitHub(): Promise<PostData[]> {
  const config = getGitHubConfig();
  const client = getOctokit();
  if (!config || !client) return [];

  const { data } = await client.rest.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: "content/posts",
    ref: BRANCH,
  });

  if (!Array.isArray(data)) return [];

  const postFiles = data.filter((file) => file.name.endsWith(".md"));
  const posts = await Promise.all(
    postFiles.map(async (file) => {
      try {
        const { data: fileData } = await client.rest.repos.getContent({
          owner: config.owner,
          repo: config.repo,
          path: file.path,
          ref: BRANCH,
        });

        if (!("content" in fileData)) return null;

        const markdown = Buffer.from(fileData.content, "base64").toString("utf8");
        return postFromMarkdown(file.name.replace(/\.md$/, ""), markdown);
      } catch (e: unknown) {
        console.error(`Error fetching GitHub post ${file.name}:`, e instanceof Error ? e.message : String(e));
        return null;
      }
    })
  );

  return posts
    .filter((post): post is PostData => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getAllPosts = cache(async (): Promise<PostData[]> => {
  if (getGitHubConfig()) {
    try {
      return await getAllPostsFromGitHub();
    } catch (error) {
      console.error("Error reading posts from GitHub:", error);
    }
  }

  return getAllPostsLocal();
});

async function getPostBySlugLocal(slug: string): Promise<PostData | null> {
  try {
    assertSafeSlug(slug);
    const markdown = await fs.readFile(path.join(POSTS_DIR, `${slug}.md`), "utf8");
    return postFromMarkdown(slug, markdown);
  } catch (error) {
    console.error(`Error reading local post ${slug}:`, error);
    return null;
  }
}

async function getPostBySlugFromGitHub(slug: string): Promise<PostData | null> {
  const config = getGitHubConfig();
  const client = getOctokit();
  if (!config || !client) return null;

  assertSafeSlug(slug);

  try {
    const { data } = await client.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: `content/posts/${slug}.md`,
      ref: BRANCH,
    });

    if (!("content" in data)) return null;

    const markdown = Buffer.from(data.content, "base64").toString("utf8");
    return postFromMarkdown(slug, markdown);
  } catch (e: unknown) {
    const status = typeof e === "object" && e !== null && "status" in e ? (e as { status: number }).status : undefined;
    if (status !== 404) {
      console.error(`Error fetching GitHub post ${slug}:`, e instanceof Error ? e.message : String(e));
    }
    return null;
  }
}

export const getPostBySlug = cache(async (slug: string): Promise<PostData | null> => {
  if (getGitHubConfig()) {
    try {
      return await getPostBySlugFromGitHub(slug);
    } catch (error) {
      console.error(`Error reading post ${slug} from GitHub:`, error);
    }
  }

  return getPostBySlugLocal(slug);
});

export async function getAdjacentPosts(slug: string): Promise<{ next: PostData | null; prev: PostData | null }> {
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex((post) => post.slug === slug);

  if (currentIndex === -1) return { next: null, prev: null };

  return {
    next: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    prev: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
  };
}

function postToMarkdown(post: PostData) {
  const frontmatter: Record<string, unknown> = {
    title: post.title,
    date: post.date,
    author: post.author || "",
    weather: post.weather || "sunny",
    contentType: post.contentType || "story",
    category: post.category || "memories",
    tags: post.tags || [],
  };

  if (post.archived === true) frontmatter.archived = true;

  if (post.featuredImage?.src) {
    const fi: Record<string, unknown> = {
      src: post.featuredImage.src,
      alt: post.featuredImage.alt || post.title,
      caption: post.featuredImage.caption || "",
    };
    if (post.featuredImage.aiGenerated) fi.aiGenerated = true;
    if (post.featuredImage.showInGallery === false) fi.showInGallery = false;
    frontmatter.featuredImage = fi;
  }

  if (post.gallery?.length) {
    frontmatter.gallery = post.gallery.map((img) => {
      const g: Record<string, unknown> = { src: img.src };
      if (img.alt) g.alt = img.alt;
      if (img.caption) g.caption = img.caption;
      if (img.aiGenerated) g.aiGenerated = true;
      if (img.showInGallery === false) g.showInGallery = false;
      return g;
    });
  }

  return matter.stringify(post.content.trim() + "\n", frontmatter);
}

async function savePostLocal(post: PostData) {
  assertSafeSlug(post.slug);
  await fs.mkdir(POSTS_DIR, { recursive: true });

  const markdown = postToMarkdown(post);
  const filePath = path.join(POSTS_DIR, `${post.slug}.md`);
  await fs.writeFile(filePath, markdown, "utf8");

  return {
    path: path.relative(process.cwd(), filePath),
    slug: post.slug,
  };
}

async function savePostToGitHub(post: PostData) {
  const config = getGitHubConfig();
  const client = getOctokit();
  if (!config || !client) {
    throw new Error("Missing GitHub configuration for runtime post persistence");
  }

  assertSafeSlug(post.slug);

  const path = `content/posts/${post.slug}.md`;
  const content = Buffer.from(postToMarkdown(post)).toString("base64");
  let sha: string | undefined;

  try {
    const { data } = await client.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
      ref: BRANCH,
    });

    if (!Array.isArray(data)) {
      sha = data.sha;
    }
  } catch {
    // New post: no SHA needed.
  }

  const response = await client.rest.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path,
    content,
    message: `Save post: ${post.title}`,
    sha,
    branch: BRANCH,
  });

  return {
    path,
    slug: post.slug,
    commit: response.data.commit.sha,
    source: "github" as const,
  };
}

export async function savePost(post: PostData) {
  if (getGitHubConfig()) {
    return savePostToGitHub(post);
  }

  if (process.env.VERCEL) {
    throw new Error("GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO are required on Vercel");
  }

  return {
    ...(await savePostLocal(post)),
    source: "local" as const,
  };
}

export async function deletePost(slug: string) {
  const config = getGitHubConfig();
  const client = getOctokit();
  if (!config || !client) {
    throw new Error("Missing GitHub configuration");
  }

  assertSafeSlug(slug);

  const path = `content/posts/${slug}.md`;

  const { data } = await client.rest.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path,
    ref: BRANCH,
  });

  if (Array.isArray(data)) {
    throw new Error("Unexpected response");
  }

  await client.rest.repos.deleteFile({
    owner: config.owner,
    repo: config.repo,
    path,
    message: `Delete post: ${slug}`,
    sha: data.sha,
    branch: BRANCH,
  });

  // Also delete the comments file if it exists
  try {
    const { data: commentData } = await client.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: `content/comments/${slug}.json`,
      ref: BRANCH,
    });
    if (!Array.isArray(commentData)) {
      await client.rest.repos.deleteFile({
        owner: config.owner,
        repo: config.repo,
        path: `content/comments/${slug}.json`,
        message: `Delete comments for post: ${slug}`,
        sha: commentData.sha,
        branch: BRANCH,
      });
    }
  } catch {
    // Comments file may not exist — fine
  }

  return { success: true, slug };
}

export async function removeImageFromAllPosts(imageUrl: string): Promise<void> {
  const posts = await getAllPosts();
  const affected = posts.filter(
    (p) => p.featuredImage?.src === imageUrl || p.gallery?.some((g) => g.src === imageUrl)
  );

  await Promise.all(
    affected.map(async (post) => {
      const updated: PostData = { ...post };
      if (updated.featuredImage?.src === imageUrl) updated.featuredImage = undefined;
      if (updated.gallery) {
        const filtered = updated.gallery.filter((g) => g.src !== imageUrl);
        updated.gallery = filtered.length > 0 ? filtered : undefined;
      }
      await savePost(updated);
    })
  );
}
