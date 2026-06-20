import { getAllPosts } from "@/lib/posts";
import PhotoAlbum from "@/components/PhotoAlbum";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "גלריית תמונות | אבא-דס",
  description: "כל התמונות מהסיפורים של אבא-דס",
};

export default async function GalleryPage() {
  const posts = await getAllPosts();

  const isVisible = (showInGallery?: boolean, aiGenerated?: boolean) =>
    showInGallery !== false && !aiGenerated;

  // Collect all images: prefer gallery array, fall back to featuredImage
  // Exclude AI-generated images and images explicitly hidden from gallery
  const allImages = posts.flatMap((post) => {
    if (post.gallery?.length) {
      return post.gallery
        .filter((img) => isVisible(img.showInGallery, img.aiGenerated))
        .map((img) => ({
          src: img.src,
          alt: img.alt || post.title,
          caption: img.caption || post.title,
        }));
    }
    const fi = post.featuredImage;
    if (fi?.src && isVisible(fi.showInGallery, fi.aiGenerated)) {
      return [{ src: fi.src, alt: fi.alt || post.title, caption: fi.caption || post.title }];
    }
    return [];
  });

  return (
    <div
      dir="rtl"
      className="flex flex-col min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300"
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border-theme py-2.5 sm:py-4 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-lg sm:text-2xl font-bold text-foreground tracking-tight hover:text-coral transition-colors duration-250"
          >
            אבא-דס
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex min-h-10 items-center gap-1.5 rounded-full border border-border-theme bg-white/5 px-3 text-xs sm:text-sm font-medium text-muted-theme hover:text-coral transition-colors duration-250"
            >
              חזרה לבלוג
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-14">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-coral/15">
            <Camera className="w-5 h-5 text-coral" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">גלריית תמונות</h1>
            <p className="text-sm text-muted-theme mt-0.5">{allImages.length} תמונות מהסיפורים</p>
          </div>
        </div>

        {allImages.length > 0 ? (
          <div className="rounded-2xl bg-navy/[0.02] p-4 sm:p-6">
            <PhotoAlbum images={allImages} showHeader={false} />
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border-theme py-20 text-center">
            <Camera className="mx-auto mb-4 w-12 h-12 text-muted-theme/30" aria-hidden="true" />
            <p className="text-base font-medium text-muted-theme">עדיין אין תמונות בגלריה.</p>
            <p className="text-sm text-muted-theme/70 mt-1">
              הוסף שדה <code className="font-mono text-xs">gallery</code> לפרונטמטר של פוסט כדי להציג תמונות כאן.
            </p>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-border-theme">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-muted-theme text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
