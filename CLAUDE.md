# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint check
npx tsc --noEmit   # Type check
node e2e.test.mjs  # E2E smoke test (requires running server at https://abba-das.vercel.app)
```

CI runs lint → type check → build on every push to `main`.

## What this is

A Hebrew RTL family blog ("Abba-Das" / אבא-דס) built as a Next.js 16 App Router app. The site is for a father's personal stories for his family, with an admin panel for authoring content.

## Architecture

**Content storage — GitHub as the database.** Posts and comments are stored as files in this repo (`content/posts/*.md`, `content/comments/*.json`) and read/written via the GitHub API at runtime using Octokit. `lib/posts.ts` is the canonical source: it prefers GitHub when `GITHUB_TOKEN`/`GITHUB_OWNER`/`GITHUB_REPO` are set, and falls back to local filesystem reads for development. `lib/github.ts` contains older GitHub functions (comments, duplicate post helpers); `lib/github-client.ts` holds the shared Octokit singleton and config helper.

**Post data model.** Posts are Markdown with YAML frontmatter. Key fields: `title`, `date`, `weather`, `contentType` (`story` | `audio-story` | `whatsapp-friday` | `photo` | `message` | `memory`), `category`, `tags[]`, `featuredImage` (object with `src`/`alt`/`caption`).

**Auth.** NextAuth v5 (`auth.ts`) with two providers: Authelia OIDC (for family members via `auth.avocado4ai.com`) and a credentials fallback (username + bcrypt hash). Admin access is gated to users in the `abba-das_admins` group. Admin username is `hadas-abba`.

**Admin panel** (`/admin`). Client component that handles: WhatsApp chat export parsing → post conversion (`lib/whatsapp-parser.ts`), manual post authoring, published post list & editing, comment review, and AI image generation. Posts are saved via `POST /api/posts`.

**Media storage.** `lib/media-storage.ts` wraps an S3-compatible MinIO instance. Required env vars: `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_ENDPOINT`, `MINIO_BUCKET_NAME`.

**Key env vars:**
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` — required on Vercel for post persistence
- `AUTH_SECRET`, `AUTH_AUTHELIA_ISSUER`, `AUTH_AUTHELIA_ID`, `AUTH_AUTHELIA_SECRET` — auth
- `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` — credentials fallback (hash is bcrypt)
- `MINIO_*` — image uploads

## RTL / Hebrew

The app is fully RTL. The root `<html>` has `lang="he" dir="rtl"`. Fonts are Heebo and Assistant (Hebrew-supporting). Keep RTL in mind when writing any layout or spacing code.

## API routes

- `GET/POST /api/posts` — list all posts / create or update a post (GitHub-backed)
- `GET/POST /api/comments` — fetch or submit comments for a post slug
- `GET /api/admin/comments` — list all comment files across posts (admin)
- `POST /api/admin/generate-image` — AI image generation for posts
- `POST /api/upload` — image upload to MinIO
- `GET /api/github` — GitHub repo metadata
- `GET /api/demo-stories` — seeded demo content
- `GET /app/feed.xml/route.ts` — RSS feed
