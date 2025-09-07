"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import { DetailLoader } from "@/components/DetailLoader";
import { BackButton } from "@/components/BackButton";
import { Icon } from "@/components/Icon";
import type { Post, EventData } from "@/types";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (params.id) {
      const getPost = async () => {
        try {
          const response = await fetch(`/api/post/${params.id}`);
          if (!response.ok) {
            setPost(null);
            return;
          }
          const data = await response.json();
          setPost(data);
        } catch (error) {
          setPost(null);
          toast.error("Failed to fetch posts");
          console.log("Failed to fetch posts:", error);
        } finally {
          setTimeout(() => setLoading(false), 1000);
        }
      };
      getPost();
    } else {
      router.replace("/all-posts");
    }
  }, [params, router]);

  const cleanedContent = useMemo(() => {
    if (!post?.contentText) return "";
    const urlRegex = /(https:\/\/(?:www\.)?(?:meetup\.com|luma\.com)\/[^\s]+)/g;
    return post.contentText.replace(urlRegex, "").trim();
  }, [post]);

  if (loading) {
    return (
      <div className="p-6">
        <DetailLoader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col justify-center items-center gap-10 p-10">
        <div className="text-white text-2xl">Post not found</div>
        <BackButton />
      </div>
    );
  }

  return (
    <>
      <BackButton />
      {cleanedContent && (
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg mb-8">
          <p
            className="text-gray-300 text-xl leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: cleanedContent.replace(/\n/g, "<br />"),
            }}
          />
        </div>
      )}
      <h2 className="text-2xl font-bold text-white mb-6">Attached Events</h2>
      <div className="space-y-8">
        {post.events.map((event: EventData, i: number) => (
          <div
            key={i}
            className="bg-slate-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-5">
              <Image
                src={event.imageUrl}
                alt={event.title}
                width={384}
                height={384}
                className="md:col-span-2 w-full h-96 object-cover"
              />
              <div className="md:col-span-3 p-6 md:p-8">
                <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                <p className="text-md text-gray-400 mt-2">{event.hostedBy}</p>
                <div className="mt-6 space-y-4">
                  <InfoLine
                    icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    primary={event.date}
                    secondary={event.time}
                  />
                  <InfoLine
                    icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    primary={event.locationName}
                  />
                  <InfoLine
                    icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    primary={`${event.attendees} Attendees`}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 border-t border-slate-700">
              <h4 className="text-xl font-bold text-white mb-2">
                About this event
              </h4>
              <div
                className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
              {event.mapEmbedUrl && (
                <div className="mt-6 rounded-xl overflow-hidden">
                  <iframe
                    title="Event Location"
                    src={event.mapEmbedUrl}
                    width="100%"
                    height="400"
                    className="border-0"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const InfoLine = ({
  icon,
  primary,
  secondary,
}: {
  icon: string;
  primary: string;
  secondary?: string;
}) => (
  <div className="flex items-start">
    <Icon path={icon} className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0" />
    <div>
      <p className="font-semibold text-gray-200">{primary}</p>
      {secondary && <p className="text-gray-400">{secondary}</p>}
    </div>
  </div>
);
