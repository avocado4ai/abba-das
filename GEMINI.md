# Father's Stories Blog (abba-das)

## Project Overview

This is a Next.js (App Router) project built as a blog/story-telling platform. It functions with a "Database-less" backend, utilizing GitHub as a CMS by saving Markdown files directly to the repository via the GitHub API (`octokit`).

## Key Technologies & Architecture
- **Framework:** Next.js (React) using the App Router.
- **Styling:** Tailwind CSS.
  - *Color Palette:* Navy (#0A2647), Sage (#7E9983), Cream (#F5F5F1).
  - *Fonts:* 'Assistant' (Story Text) and 'Heebo' (UI Elements).
- **Authentication:** NextAuth (`next-auth`).
- **CMS:** GitHub (Markdown files).
- **Animations:** Framer Motion.
- **Language/Layout:** Right-to-Left (RTL) layout support, intended for Hebrew content.

## Notable Features
- **Admin Panel:** A secure `/admin` route designed for pasting text directly from WhatsApp.
- **Custom Parsing:** Includes a custom parser (`lib/whatsapp-parser.ts`) to automatically clean up WhatsApp timestamps and metadata from pasted stories.
- **Dynamic Content:** Automatic weather icons added based on the date of the post (`lib/weather.ts`).

## Building and Running

The project relies on standard Next.js npm scripts:

- **Development Server:** `npm run dev`
- **Build:** `npm run build`
- **Start Production Server:** `npm run start`
- **Linting:** `npm run lint`

## Development Conventions
- **Content Storage:** Posts are stored as Markdown files in the `content/posts/` directory. Comments are stored as JSON in `content/comments/`.
- **Styling:** Adhere to the established Tailwind color scheme (Navy, Sage, Cream) and typography when creating new UI components. Ensure RTL compatibility for all layouts.
- **API Routes:** Backend logic interacts with GitHub (for CMS functionality) and potentially S3 (for media) within `app/api/` routes.