import { Octokit } from "octokit";

export function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo };
}

let octokitInstance: Octokit | null = null;

export function getOctokit() {
  const config = getGitHubConfig();
  if (!config) return null;

  if (!octokitInstance) {
    octokitInstance = new Octokit({
      auth: config.token,
      // Add a user agent to avoid warnings/errors
      userAgent: "abba-das-v1",
    });
  }

  return octokitInstance;
}
