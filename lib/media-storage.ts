import { getOctokit, getGitHubConfig } from "./github-client";
import { promises as fs } from "fs";
import path from "path";

const UPLOADS_PATH = "public/images/uploads";
const BRANCH = "main";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadToGitHub(buffer: Buffer, filename: string) {
  const config = getGitHubConfig();
  const octokit = getOctokit();

  if (!config || !octokit) {
    throw new Error("GitHub configuration missing. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.");
  }

  const key = `${Date.now()}-${sanitizeFilename(filename)}`;
  const filePath = `${UPLOADS_PATH}/${key}`;
  const contentBase64 = buffer.toString("base64");

  let sha: string | undefined;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: filePath,
      ref: BRANCH,
    });
    if (!Array.isArray(data)) sha = data.sha;
  } catch {
    // 404 expected — file doesn't exist yet
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path: filePath,
    message: `Upload image: ${key}`,
    content: contentBase64,
    sha,
    branch: BRANCH,
  });

  return {
    url: `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${BRANCH}/${filePath}`,
    filename: key,
  };
}

async function uploadToLocal(buffer: Buffer, filename: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const key = `${Date.now()}-${sanitizeFilename(filename)}`;
  await fs.writeFile(path.join(uploadsDir, key), buffer);

  return {
    url: `/uploads/${key}`,
    filename: key,
  };
}

export async function uploadBufferToMediaStorage({
  buffer,
  filename,
}: {
  buffer: Buffer;
  filename: string;
  contentType: string;
}) {
  const config = getGitHubConfig();
  if (config) {
    return uploadToGitHub(buffer, filename);
  }
  return uploadToLocal(buffer, filename);
}
