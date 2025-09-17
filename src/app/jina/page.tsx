"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const ReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
});

export default function JinaTestPage() {
  const [text, setText] = useState<string>("");
  const [eventData, setEventData] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedText, setDebouncedText] = useState<string>(text);

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
        /(https:\/\/(?:www\.)?(?:meetup\.com|luma\.com|eventbrite\.com|linkedin\.com|facebook\.com)\/[^\s]+)/g;
      const matches = Array.from(debouncedText.matchAll(urlRegex));
      if (matches.length === 0) {
        setIsLoading(false);
        setEventData(null);
        return;
      }
      const foundUrl = matches[0][0];
      setEventData(null);
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/jina?url=${encodeURIComponent(foundUrl)}`
        );
        if (!response.ok) throw new Error(`Request failed`);
        const data = await response.json();
        if (data.message) throw new Error(data.message);
        setEventData(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        toast.error(`Failed to fetch event data for ${foundUrl}`);
        setEventData(null);
      }
      setIsLoading(false);
    };
    processUrls();
  }, [debouncedText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg mx-auto mt-20">
      <h1 className="text-2xl font-bold text-white mb-4">Add Event URL</h1>
      <textarea
        value={text}
        onChange={handleTextChange}
        className="w-full h-32 px-4 py-2 bg-slate-700 text-gray-200 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste event links from Meetup or Luma etc..."
      />
      <div className="mt-4">
        {isLoading && (
          <p className="animate-pulse">Loading Response, please wait...</p>
        )}
        {eventData && (
          <ReactJson
            name="response"
            src={eventData}
            theme="bright"
            enableClipboard={false}
            quotesOnKeys={false}
            displayDataTypes={false}
            displayObjectSize={false}
            style={{ overflow: "auto" }}
          />
        )}
      </div>
    </div>
  );
}
