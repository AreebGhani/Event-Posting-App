import { NextRequest, NextResponse } from "next/server";

import { getPostById, deletePost } from "@/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Error getting post:", error);
    return NextResponse.json(
      {
        message: `Error getting post: ${
          error instanceof Error ? error.message : "something went wrong"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wasDeleted = await deletePost(id);
    if (!wasDeleted) {
      return NextResponse.json(
        { message: "Post not found or could not be deleted" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting post:", error);
    return NextResponse.json(
      {
        message: `Error deleting post: ${
          error instanceof Error ? error.message : "something went wrong"
        }`,
      },
      { status: 500 }
    );
  }
}
