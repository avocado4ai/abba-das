import { getOctokit, getGitHubConfig } from "./github-client";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const UPLOADS_PATH = "public/images/uploads";
const BRANCH = "main";
const MAX_GITHUB_BYTES = 900 * 1024; // stay under GitHub's 1MB contents-API limit

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function compressForUpload(buffer: Buffer, filename: string): Promise<{ buffer: Buffer; filename: string }> {
  const isImage = /\.(jpe?g|png|gif|webp|heic|heif|tiff?)$/i.test(filename);
  if (!isImage || buffer.length <= MAX_GITHUB_BYTES) return { buffer, filename };

  try {
    const compressed = await sharp(buffer)
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const outName = filename.replace(/\.[^.]+$/, ".jpg");
    return { buffer: compressed, filename: outName };
  } catch {
    return { buffer, filename };
  }
}

async function uploadToGitHub(buffer: Buffer, filename: string) {
  const config = getGitHubConfig();
  const octokit = getOctokit();

  if (!config || !octokit) {
    throw new Error("GitHub configuration missing. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.");
  }

  const { buffer: uploadBuffer, filename: uploadFilename } = await compressForUpload(buffer, filename);
  const key = `${Date.now()}-${sanitizeFilename(uploadFilename)}`;
  const filePath = `${UPLOADS_PATH}/${key}`;
  const contentBase64 = uploadBuffer.toString("base64");

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

export async function deleteImageFromStorage(url: string): Promise<void> {
  const match = url.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.+)/);
  if (!match) return; // local path or external URL — nothing to delete

  const filePath = match[1];
  const config = getGitHubConfig();
  const octokit = getOctokit();
  if (!config || !octokit) throw new Error("GitHub configuration missing.");

  const { data } = await octokit.rest.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: filePath,
    ref: BRANCH,
  });

  if (Array.isArray(data) || !("sha" in data)) throw new Error("File not found in repository.");

  await octokit.rest.repos.deleteFile({
    owner: config.owner,
    repo: config.repo,
    path: filePath,
    message: `Delete image: ${filePath.split("/").pop()}`,
    sha: data.sha,
    branch: BRANCH,
  });
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
