"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Icon } from "@/components/Icon";
import { CardLoader } from "@/components/CardLoader";
import type { Post } from "@/types";

export default function PostsListingPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await fetch("/api/post");
        if (!response.ok) {
          toast.error("Network response was not ok");
          return;
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        toast.error("Failed to fetch posts");
        console.log("Failed to fetch posts:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    getPosts();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Latest Posts</h1>
        <Link
          href="/create-post"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create Post
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(9)
            .fill(null)
            .map((_, i: number) => <CardLoader key={i} />)
        ) : posts.length === 0 ? (
          <h1 className="text-xl font-bold text-white">No post yet.</h1>
        ) : (
          posts.map((post, i: number) => (
            <Link
              href={`/post-detail/${post.id}`}
              key={i}
              className="bg-slate-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 block"
            >
              <Image
                src={post.events[0].imageUrl}
                alt={post.events[0].title}
                width={160}
                height={160}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-blue-400">
                  {post.events[0].date.toUpperCase()}
                </p>
                <h2 className="text-lg font-bold text-gray-100 mt-1 truncate">
                  {post.events[0].title}
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  {post.events[0].locationName}
                </p>
                <div className="flex items-center text-sm text-gray-400 mt-4">
                  <Icon
                    path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    className="w-4 h-4 mr-1"
                  />
                  <span>{post.events[0].attendees} attendees</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
