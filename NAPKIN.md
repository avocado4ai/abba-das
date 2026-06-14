# Abba-Das / אבא-דס

## What is this?
A Hebrew RTL family blog for a father's personal stories — posts, photos, audio, and WhatsApp memories. Built for the Neaman family. Admin panel at `/admin` for authoring content. Deployed on Vercel.

## Tech stack
- Language: TypeScript / Node.js
- Framework: Next.js 16 App Router, Tailwind CSS (RTL, `dir="rtl" lang="he"`)
- Fonts: Heebo (UI), Assistant (story text)
- Database: GitHub as CMS — posts as `content/posts/*.md` (YAML frontmatter + Markdown), comments as `content/comments/*.json`, read/written via Octokit
- Media: MinIO (S3-compatible) for images/audio/video uploads
- Auth: NextAuth v5 — Authelia OIDC (`auth.avocado4ai.com`) + bcrypt credentials fallback
- Infrastructure: Vercel (hosting), GitHub Actions (CI: lint → typecheck → build)

## Key conventions
- All layout is RTL — keep `dir="rtl"` in mind for spacing, flex direction, and text alignment
- Content types: `story` | `audio-story` | `whatsapp-friday` | `photo` | `message` | `memory`
- Post frontmatter fields: `title`, `date`, `weather`, `contentType`, `category`, `tags[]`, `featuredImage` (`src`/`alt`/`caption`)
- `lib/posts.ts` is the canonical data layer — prefers GitHub API when env vars set, falls back to local filesystem
- Admin access requires `abba-das_admins` OIDC group or credentials user `hadas-abba`

## Key decisions
- GitHub as the database — no traditional DB, all content is markdown files committed to the repo
- Octokit at runtime — reads/writes happen via GitHub Content API, not at build time
- WhatsApp parser (`lib/whatsapp-parser.ts`) converts chat exports into structured posts
- AI image generation via Gemini API (`gemini-3.1-flash-image-preview`), uploaded to MinIO
- `lib/github.ts` (comments/duplicate helpers) vs `lib/github-client.ts` (shared Octokit singleton) — keep separate

## Active work
- Security: rotate GitHub token, clean git history of exposed secrets, add upload auth
- UX: typography improvements (Hebrew line-height, letter-spacing, font weights)
- Animations: hero entrance, post card stagger, micro-interactions
