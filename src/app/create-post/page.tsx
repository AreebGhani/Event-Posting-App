"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { BackButton } from "@/components/BackButton";
import type { EventData, Post } from "@/types";

export default function CreatePostPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [previewEvents, setPreviewEvents] = useState<EventData[]>([]);
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedText, setDebouncedText] = useState(text);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(text);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [text]);

  useEffect(() => {
    const processUrls = async () => {
      const urlRegex =
        /(https:\/\/(?:www\.)?(?:meetup\.com|luma\.com)\/[^\s]+)/g;
      const foundUrls = Array.from(
        debouncedText.matchAll(urlRegex),
        (m) => m[0]
      );
      const uniqueUrls = [...new Set(foundUrls)];
      const existingUrls = previewEvents.map((event) => event.sourceUrl);
      const currentLoadingUrls = Array.from(loadingUrls);
      const urlsToFetch = uniqueUrls.filter(
        (url) =>
          !existingUrls.includes(url) && !currentLoadingUrls.includes(url)
      );
      const urlsToRemove = existingUrls.filter(
        (url) => !uniqueUrls.includes(url)
      );
      if (urlsToRemove.length > 0) {
        setPreviewEvents((prev) =>
          prev.filter((event) => !urlsToRemove.includes(event.sourceUrl))
        );
      }
      if (urlsToFetch.length === 0) {
        return;
      }
      setLoadingUrls((prev) => new Set([...prev, ...urlsToFetch]));
      setError("");
      const fetchPromises = urlsToFetch.map(async (url) => {
        try {
          const response = await fetch(
            `/api/event?url=${encodeURIComponent(url)}`
          );
          if (!response.ok) throw new Error(`Request failed`);
          const data = await response.json();
          if (data.message) throw new Error(data.message);
          return data;
        } catch (err) {
          console.error(`Failed to fetch event data for ${url}:`, err);
          return null;
        }
      });
      const results = await Promise.all(fetchPromises);
      setLoadingUrls((prev) => {
        const newSet = new Set(prev);
        urlsToFetch.forEach((url) => newSet.delete(url));
        return newSet;
      });
      const successfulEvents = results.filter(
        (event): event is EventData => event !== null
      );
      if (successfulEvents.length > 0) {
        setPreviewEvents((prev) => [...prev, ...successfulEvents]);
      }
      if (successfulEvents.length < urlsToFetch.length) {
        setError("Couldn't fetch details for one or more links.");
      }
    };
    processUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError("");
    setText(e.target.value);
  };

  const handlePost = async () => {
    if (!previewEvents || previewEvents.length === 0 || !text.trim()) {
      toast.error("Please add some text and at least one event link.");
      return;
    }
    setIsSubmitting(true);
    const post: Post = {
      id: Date.now().toString(),
      contentText: text,
      events: previewEvents,
    };
    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      });
      if (response.ok) {
        toast.success("Post created successfully!");
        router.replace("/all-posts");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create the post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BackButton />
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg max-w-2xl mx-auto mt-20">
        <h1 className="text-2xl font-bold text-white mb-4">
          Create a New Post
        </h1>
        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full h-32 px-4 py-2 bg-slate-700 text-gray-200 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write something or paste event links from Meetup or Luma..."
        />
        <div className="mt-4 space-y-4">
          {error && (
            <div className="text-center py-2 text-red-400">{error}</div>
          )}
          {previewEvents.map((event) => (
            <div
              key={event.sourceUrl}
              className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900"
            >
              <div className="flex items-center gap-4 p-4">
                {event.imageUrl && (
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}
                <div>
                  <h3 className="font-bold text-gray-100">{event.title}</h3>
                  <p className="text-sm text-gray-400">{event.date}</p>
                  <p className="text-sm text-gray-400">{event.locationName}</p>
                </div>
              </div>
            </div>
          ))}
          {Array.from(loadingUrls).map((_, i: number) => (
            <div
              key={i}
              className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 animate-pulse"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="w-24 h-24 bg-slate-700 rounded-md"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handlePost}
          disabled={isSubmitting || previewEvents.length === 0 || !text.trim()}
          className="mt-4 w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Posting..." : "Add Post"}
        </button>
      </div>
    </>
  );
}
