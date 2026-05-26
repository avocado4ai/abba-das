import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCommentsForPost } from "@/lib/github";
import { getAllPosts } from "@/lib/posts";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await getAllPosts();
    const groups = await Promise.all(
      posts.map(async (post) => ({
        slug: post.slug,
        title: post.title,
        comments: await getCommentsForPost(post.slug),
      }))
    );

    const guestbookComments = await getCommentsForPost("guestbook");
    if (guestbookComments.length > 0) {
      groups.unshift({
        slug: "guestbook",
        title: "ספר אורחים",
        comments: guestbookComments,
      });
    }

    return NextResponse.json(groups.filter((group) => group.comments.length > 0));
  } catch (error) {
    console.error("Admin comments API error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
