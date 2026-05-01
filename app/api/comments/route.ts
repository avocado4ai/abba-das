import { NextRequest, NextResponse } from "next/server";
import { saveCommentToGitHub, CommentData } from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const { slug, name, message } = await request.json();

    if (!slug || !name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newComment: CommentData = {
      id: crypto.randomUUID(),
      name,
      message,
      date: new Date().toISOString(),
    };

    await saveCommentToGitHub(slug, newComment);

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Error in comments API:", error);
    return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
  }
}
