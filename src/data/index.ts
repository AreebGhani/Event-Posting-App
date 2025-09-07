"use server";

import fs from "fs/promises";
import path from "path";

import type { Post } from "@/types";

const postsFilePath = path.join(path.resolve(), "/src/data/json/posts.json");

export async function getAllPosts(): Promise<Post[]> {
  try {
    const fileContent = await fs.readFile(postsFilePath, "utf-8");
    if (!fileContent) {
      return [];
    }
    const data = JSON.parse(fileContent);
    if (Array.isArray(data)) {
      return data as Post[];
    }
    return [];
  } catch (error) {
    console.log("Error while getting all posts: ", error);
    return [];
  }
}

export async function savePost(post: Post): Promise<boolean> {
  try {
    const posts = await getAllPosts();
    await fs.writeFile(
      postsFilePath,
      JSON.stringify([post, ...posts], null, 2),
      "utf-8"
    );
    return true;
  } catch (error) {
    console.log("Error while saving new post: ", error);
    return false;
  }
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.id === id);
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    let posts = await getAllPosts();
    const initialLength = posts.length;
    posts = posts.filter((p) => p.id !== id);
    if (posts.length < initialLength) {
      await fs.writeFile(
        postsFilePath,
        JSON.stringify(posts, null, 2),
        "utf-8"
      );
      return true;
    }
    return false;
  } catch (error) {
    console.log("Error while deleting a post: ", error);
    return false;
  }
}
