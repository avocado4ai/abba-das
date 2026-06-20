import { NextRequest, NextResponse } from "next/server";
import { saveCommentToGitHub, deleteCommentFromGitHub, CommentData } from "@/lib/github";
import { auth } from "@/auth";

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

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (!slug || !id) {
      return NextResponse.json({ error: "Missing slug or id" }, { status: 400 });
    }

    await deleteCommentFromGitHub(slug, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in comments DELETE API:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
