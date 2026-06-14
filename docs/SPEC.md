# abba-das — Family Blog Specification

> **Project:** abba-das (אבא-דס)
> **Type:** Personal Family Blog
> **Stack:** Next.js 16.2.4 · React 19.2.4 · Tailwind CSS v4 · TypeScript 5
> **Language:** Hebrew (RTL) · `lang="he" dir="rtl"`
> **Deployment:** Vercel

---

## 1. Overview

A database-less family blog where content is stored as Markdown files in GitHub and served via the GitHub Content API. Family members authenticate via OIDC (Authelia) and contribute stories, photos, audio, and memories.

---

## 2. Routes

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Server | No | Homepage — hero, featured image, dynamic stats, post feed, OnThisDay |
| `/post/[slug]` | Server | No | Individual post — hero image, content, audio player, comments, prev/next nav |
| `/guestbook` | Server | No | Guestbook — comments widget with slug `"guestbook"` |
| `/feed.xml` | Route handler | No | RSS 2.0 feed |
| `/print` | Server | No | All posts in print-friendly layout |
| `/admin` | Client | Admin | Dashboard — WhatsApp import, post editor, image upload, Gemini AI, comment review |
| `/auth/signin` | Client | No | Sign-in form — username/password + OIDC |
| `/unauthorized` | Server | No | Access denied page |

---

## 3. API Routes

| Route | Methods | Auth | Purpose |
|-------|---------|------|---------|
| `/api/posts` | GET, POST | POST | List posts / create post |
| `/api/comments` | POST | No | Save comment to GitHub |
| `/api/github` | POST | Admin | Save post with optional weather auto-fetch |
| `/api/upload` | POST | Admin | Upload image/video/audio to MinIO |
| `/api/admin/comments` | GET | Admin | Fetch all comments for admin review |
| `/api/admin/generate-image` | POST | Admin | Generate image via Gemini AI, upload to MinIO |
| `/api/demo-stories` | GET | No | Hardcoded demo story data |
| `/api/auth/[...nextauth]` | GET, POST | — | NextAuth handlers |

---

## 4. Authentication & Authorization

### 4.1 Providers (NextAuth v5)
- **Authelia OIDC** — family members via `auth.avocado4ai.com`, scopes: `openid profile email groups`
- **Credentials** — username `hadas-abba` + bcrypt password hash from env

### 4.2 Authorization Gates
- `middleware.ts` — protects `/admin/*`, checks session and `abba-das_admins` group
- `app/admin/layout.tsx` — server-side group check
- All mutation API routes check `auth()` session

### 4.3 Groups
- `abba-das_admins` — grants admin access (from OIDC claims or hardcoded in credentials provider)

---

## 5. Content Model

### 5.1 Post (Markdown + YAML frontmatter)

```yaml
---
title: "הסיפור של הדרך הארוכה"
date: 2025-03-15
slug: the-long-path
weather: sunny
contentType: story           # story | audio-story | whatsapp-friday | photo | message | memory
category: family            # family | memories | thoughts | inspiration | reflection | moments
tags:
  - משפחה
  - סיפורים
featuredImage:
  src: /images/posts/the-long-path.webp
  alt: "תיאור התמונה"
  caption: "כיתוב לתמונה"
  prompt: "תיאור ליצירת תמונה ב-Gemini"
---

גוף הפוסט בכתיבת Markdown...
```

### 5.2 Comment (JSON)

Stored as `content/comments/{slug}.json`:
```json
[
  {
    "id": "uuid",
    "name": "שם המגיב",
    "message": "תוכן התגובה",
    "date": "2025-03-16T10:30:00.000Z"
  }
]
```

### 5.3 Content Types
- `story` — full narrative story
- `audio-story` — story with audio recording
- `whatsapp-friday` — Friday WhatsApp message import
- `photo` — photo-focused post
- `message` — short message/note
- `memory` — memory recollection

### 5.4 Categories
`family` · `memories` · `thoughts` · `inspiration` · `reflection` · `moments`

---

## 6. Data Flow

### 6.1 Storage (two backends, GitHub preferred)

**GitHub** (production on Vercel) — via Octokit, `createOrUpdateFileContents` on `main` branch with SHA conflict detection. Requires `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`.

**Local filesystem** (development fallback) — reads/writes `content/posts/*.md` and `content/comments/*.json` directly.

### 6.2 Rendering
1. `getAllPosts()` (React `cache()`-ed) — checks GitHub first, falls back to local
2. Posts sorted by date descending
3. `<PostList>` — client component with search, tag filter, favorites (localStorage)
4. Individual post — `getPostBySlug()`, `getAdjacentPosts()`, `getCommentsForPost()`
5. Comments fetched server-side, passed as `initialComments` to client component

---

## 7. Media

### 7.1 Storage
MinIO/S3-compatible object storage via `@aws-sdk/client-s3`:
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` / `MINIO_ENDPOINT` / `MINIO_BUCKET_NAME`
- `NEXT_PUBLIC_MINIO_URL` for public access

### 7.2 Allowed Uploads
- Images: `jpeg` `png` `gif` `webp`
- Videos: `mp4` `webm`
- Audio: `mpeg` `wav`
- Max file size: 50MB

### 7.3 AI Image Generation
`/api/admin/generate-image` — calls Gemini API (`gemini-3.1-flash-image-preview`), uploads result to MinIO, returns URL.

### 7.4 Batch Generation
`scripts/nano-banana-gen.mjs` — reads all posts, generates missing `featuredImage` via Gemini 2.0 flash, saves to `public/images/posts/`, updates frontmatter.

---

## 8. Design System

### 8.1 Pattern
**Storytelling-Driven** — narrative flow with scroll-triggered reveals, chapter-like structure, emotional imagery. Each post feels like a chapter. Homepage follows "Newsletter / Content First" pattern: hero with value prop, recent posts feed, about section.

### 8.2 Color Palette

| Token | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| Navy | `#0A2647` | Primary backgrounds, headings | — |
| On Navy | `#F5F5F1` | Text on navy surfaces | 13.5:1 |
| Sage | `#7E9983` | Accents, secondary elements | — |
| Cream | `#F5F5F1` | Page backgrounds, card surfaces | — |
| On Cream | `#0A2647` | Body text on cream | 13.5:1 |
| Coral | `#D97760` | Highlights, CTAs, active states | — |
| On Coral | `#FFFFFF` | Text on coral | 3.8:1 (large text only) |
| Warm Gold | `#C4A572` | Decorative accents | — |
| Muted | `#E8DCD0` | Borders, dividers | — |
| Destructive | `#DC2626` | Errors, destructive actions | — |
| Ring | `#0A2647` | Focus rings | — |

All text/background pairs must meet WCAG AA 4.5:1 minimum contrast ratio. Use semantic tokens (`--color-primary`, `--color-surface`, etc.) rather than raw hex in components.

### 8.3 Themes
- **Light** — cream backgrounds, navy text
- **Dark** — navy backgrounds, cream text
- **Paper** — aged paper texture, dark brown text

Theme toggled via `data-theme` attribute on `<html>`. CSS custom properties drive all colors. Each theme independently verified for 4.5:1 contrast.

### 8.4 Typography

**Primary pairing (UI + body):**
- **Heebo** — UI text (navigation, buttons, labels, metadata). Sans-serif, clean, strong Hebrew support.
- **Assistant** — story body text. Warm, readable, optimized for long-form Hebrew reading.

**Recommended accent pairing (optional, for personality):**
- **Caveat** (headings, pull quotes, handwritten accents) — adds personal, warm, human feel
- **Quicksand** (alternate body) — friendly, casual, rounded

**Scale:**
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero | 36–42pt | 700 | Post titles, hero headings |
| H2 | 28–32pt | 600 | Section headings |
| H3 | 20–24pt | 600 | Subsection headings |
| Body | 16–18pt | 400 | Post content, story text |
| Small | 14pt | 400 | Metadata, dates, tags |
| Label | 12pt | 500 | Badges, captions |

- Minimum 16px body text on mobile (prevents iOS auto-zoom)
- Line height: 1.5–1.75 for body text
- Line length: 65–75 characters per line (desktop), 35–60 (mobile)
- `data-text="large"` attribute scales all text proportionally
- All fonts include Hebrew + Latin subsets

### 8.5 Spacing & Layout
- **System:** 4pt/8dp incremental spacing (Tailwind spacing scale)
- **Touch targets:** minimum 44×44pt interactive area
- **Touch spacing:** minimum 8px gap between tappable elements
- **Container max-width:** consistent (e.g. `max-w-4xl` for content, `max-w-7xl` for homepage)
- **Z-index scale:** layered system (0 / 10 / 20 / 40 / 100 / 1000)
- **Viewport:** prefer `min-h-dvh` over `100vh` on mobile
- No horizontal scroll on any viewport

### 8.6 Visual Style
- **Icons:** Lucide SVG icons only — no emoji as icons
- **Consistent stroke width** within same visual layer
- **Filled vs outline discipline:** one icon style per hierarchy level
- **Border radius:** consistent scale (e.g. `rounded-lg` for cards, `rounded-full` for badges)
- **Shadows/elevation:** consistent scale for cards, sheets, modals — no random values
- **Hover states:** smooth transition (150–300ms), `cursor-pointer` on all clickable elements
- **Focus states:** visible 2–4px focus rings, never `outline: none` without replacement

### 8.7 Animation
- **Duration:** 150–300ms for micro-interactions, ≤400ms for complex transitions
- **Properties:** `transform` and `opacity` only — never animate `width`, `height`, `top`, `left`
- **Easing:** `ease-out` for entering, `ease-in` for exiting
- **Meaning:** every animation expresses cause-effect relationship, not decoration
- **Reduced motion:** respect `prefers-reduced-motion` — reduce or disable animations
- **Loading states:** skeleton/spinner for operations >300ms
- **Exit faster than enter:** ~60–70% of enter duration

---

## 9. Components

| Component | Type | Purpose |
|-----------|------|---------|
| `PostList` | Client | Post feed with search, tag filter, favorites |
| `PostContent` | Client | Markdown renderer with image/video parsing |
| `Comments` | Client | Comment form + list with validation |
| `PostNavigation` | Server | Previous/next post links |
| `ShareButtons` | Client | Social sharing (WhatsApp, Facebook, copy link) |
| `FavoriteButton` | Client | localStorage-based favorites toggle |
| `ReadingProgressBar` | Client | Scroll progress indicator |
| `AudioPlayer` | Client | TTS audio playback |
| `ThemeSwitcher` | Client | Light/dark/paper toggle |
| `StoryImage` | Server | Post featured image with caption |
| `MobileNav` | Client | Mobile navigation drawer |
| `WhatsAppDisplay` | Client | WhatsApp-formatted post display |
| `ContentTypeBadge` | Server | Type/category badge |
| `OnThisDay` | Server | "On this day" historical posts |
| `DynamicStats` | Client | Post statistics counter |
| `Toast` | Client | Notification toasts |
| `ScrollToTop` | Client | Scroll-to-top FAB |
| `ExportButton` | Client | Post export |
| `PrintButton` | Client | window.print() trigger |
| `ContentTypeGuide` | Server | Guide to content types |
| `ErrorBoundary` | Client | Error boundary wrapper |
| `LoadingSkeleton` | Client | Loading skeleton placeholder |

---

## 10. Scripts

| Script | Purpose |
|--------|---------|
| `scripts/nano-banana-gen.mjs` | Batch Gemini image generation for posts missing featured images |
| `scripts/weekly-summary.mjs` | Generates and sends weekly email summary via Resend |

---

## 11. Testing

Playwright e2e tests in `tests/e2e.spec.ts` covering:
- Homepage load and hero section
- Story feed display
- Search/tag filtering
- Theme switching
- Guestbook page
- Admin redirect (unauthenticated)
- RSS feed
- Post navigation
- Audio player
- Comment form
- Mobile font size

Run: `npm test` (local) or `npm run test:prod` (production URL)

---

## 12. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | Production | GitHub API token |
| `GITHUB_OWNER` | Production | GitHub owner |
| `GITHUB_REPO` | Production | GitHub repo name |
| `AUTH_SECRET` | Yes | NextAuth encryption secret |
| `AUTH_AUTHELIA_ISSUER` | OIDC | Authelia issuer |
| `AUTH_AUTHELIA_ID` | OIDC | Authelia client ID |
| `AUTH_AUTHELIA_SECRET` | OIDC | Authelia client secret |
| `ADMIN_USERNAME` | Credentials | Admin login username |
| `ADMIN_PASSWORD_HASH` | Credentials | Admin bcrypt hash |
| `MINIO_ACCESS_KEY` | Uploads | MinIO access key |
| `MINIO_SECRET_KEY` | Uploads | MinIO secret key |
| `MINIO_ENDPOINT` | Uploads | MinIO endpoint |
| `MINIO_BUCKET_NAME` | Uploads | MinIO bucket |
| `NEXT_PUBLIC_MINIO_URL` | Uploads | Public MinIO URL |
| `GEMINI_API_KEY` | AI images | Gemini API key |
| `RESEND_API_KEY` | Weekly summary | Resend API key |
| `EMAIL_TO` | Weekly summary | Weekly summary recipient |

---

## 13. Deployment

- **Platform:** Vercel
- **CI:** Lint → TypeScript check → Build (on push to `main`)

---

## 14. Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.4 | Framework |
| `react` / `react-dom` | 19.2.4 | UI library |
| `next-auth` | 5.0.0-beta.31 | Authentication |
| `octokit` | 5.0.5 | GitHub API |
| `gray-matter` | 4.0.3 | YAML frontmatter parsing |
| `date-fns` | 4.1.0 | Date formatting (Hebrew locale) |
| `lucide-react` | 1.14.0 | Icons |
| `clsx` / `tailwind-merge` | — | Class composition |
| `@aws-sdk/client-s3` | 3.1040.0 | MinIO/S3 uploads |
| `bcryptjs` | 3.0.3 | Password hashing |
| `framer-motion` | 12.38.0 | Animations |
| `tailwindcss` | 4 | CSS framework |
| `@playwright/test` | 1.60.0 | E2E testing |
