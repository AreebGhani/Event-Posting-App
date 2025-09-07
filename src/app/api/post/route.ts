import { NextRequest, NextResponse } from "next/server";

import { getAllPosts, savePost } from "@/data";
import type { Post } from "@/types";

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.log("Error getting post:", error);
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

export async function POST(request: NextRequest) {
  try {
    const newPost = (await request.json()) as Post;
    if (!newPost.id || !newPost.contentText || !newPost.events) {
      return NextResponse.json(
        { message: "Invalid post data provided" },
        { status: 400 }
      );
    }
    const success = await savePost(newPost);
    if (success) {
      return NextResponse.json(newPost, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "Internal Server Error: Failed to create post" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("Error creating post:", error);
    return NextResponse.json(
      {
        message: `Error creating post: ${
          error instanceof Error ? error.message : "something went wrong"
        }`,
      },
      { status: 500 }
    );
  }
}
