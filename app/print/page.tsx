import { getAllPosts } from "@/lib/posts";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import PrintButton from "@/components/PrintButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PrintPage() {
  const posts = await getAllPosts();

  return (
    <div className="bg-white text-black min-h-screen p-8 md:p-16 max-w-4xl mx-auto dir-rtl print:p-0 print:m-0" dir="rtl">
      <div className="text-center mb-16 print:mb-8">
        <h1 className="text-5xl font-bold mb-4 text-navy">אבא-דס</h1>
        <p className="text-xl text-gray-600">כל הסיפורים של אבא - נכון ל-{format(new Date(), "dd/MM/yyyy")}</p>
        <div className="mt-8 flex justify-center gap-4 print:hidden">
          <PrintButton />
          <Link href="/" className="px-6 py-2 border border-navy text-navy rounded-full hover:bg-navy/5 transition-colors">
            חזרה לבלוג
          </Link>
        </div>
      </div>

      <div className="space-y-20">
        {posts.map((post) => (
          <article key={post.slug} className="break-inside-avoid border-b border-gray-100 pb-12 last:border-0">
            <header className="mb-6">
              <div className="text-sm font-bold text-gray-400 mb-2">
                {post.date ? format(new Date(post.date), "dd MMMM yyyy", { locale: he }) : ""}
              </div>
              <h2 className="text-4xl font-bold text-navy leading-tight">{post.title}</h2>
            </header>
            <div className="text-xl leading-relaxed whitespace-pre-wrap font-stories text-gray-800">
              {post.content}
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-24 text-center text-gray-300 text-sm print:mt-10">
        <p>© אבא-דס. כל הזכויות שמורות.</p>
        <p className="mt-1">הופק באמצעות abba-das.vercel.app</p>
      </footer>
    </div>
  );
}
