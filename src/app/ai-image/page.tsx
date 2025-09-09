"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface GeneratedImage {
  id: number;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  source: string;
}

const initialTitle = "Summer Music Festival";
const initialDescription =
  "A vibrant outdoor music festival with multiple stages, food vendors, and art installations. Happening in July with top artists from around the world.";

const exampleEvents = [
  {
    title: "AI Tech Conference",
    description:
      "Annual technology conference featuring keynote speakers, workshops, and networking opportunities for tech professionals.",
  },
  {
    title: "Art Exhibition Opening",
    description:
      "Grand opening of contemporary art exhibition featuring local and international artists, with live music and refreshments.",
  },
];

export default function EventImageGenerator() {
  const [eventTitle, setEventTitle] = useState(initialTitle);
  const [eventDescription, setEventDescription] = useState(initialDescription);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hues, setHues] = useState<Record<number, number>>({});
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (generatedImages.length > 0) {
      const newHues: Record<number, number> = {};
      generatedImages.forEach((image) => {
        if (!hues[image.id]) {
          newHues[image.id] = Math.floor(Math.random() * 360);
        }
      });
      if (Object.keys(newHues).length > 0) {
        setHues((prev) => ({ ...prev, ...newHues }));
      }
    }
  }, [generatedImages, hues]);

  const generateImages = async () => {
    if (!eventTitle.trim()) {
      alert("Please enter an event title");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/event?t=${Date.now()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventTitle,
          eventDescription,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate image");
      }
      const data = await response.json();
      const newImage: GeneratedImage = {
        id: Date.now(),
        title: eventTitle,
        description: eventDescription,
        source: data.source,
        image: data.image,
        imageUrl: data.imageUrl,
      };
      setGeneratedImages([newImage]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setGeneratedImages([]);
    setHues({});
    setEventTitle(initialTitle);
    setEventDescription(initialDescription);
  };

  const loadExample = (title: string, description: string) => {
    setEventTitle(title);
    setEventDescription(description);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8 mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            Event Image Generator
          </h1>
          <p className="text-xl text-gray-300">
            Create AI-generated images for your events using open-source tools
          </p>
        </header>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">Event Details</h2>
          <div className="mb-6">
            <label
              htmlFor="eventTitle"
              className="block text-lg font-medium mb-2"
            >
              Event Title
            </label>
            <input
              type="text"
              id="eventTitle"
              placeholder="Enter event title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-8">
            <label
              htmlFor="eventDescription"
              className="block text-lg font-medium mb-2"
            >
              Event Description
            </label>
            <textarea
              id="eventDescription"
              placeholder="Describe your event"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={generateImages}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                "Generate AI Images"
              )}
            </button>
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg cursor-pointer transition-transform hover:scale-105"
            >
              Clear Results
            </button>
            {exampleEvents.map((event, index) => (
              <button
                key={index}
                onClick={() => loadExample(event.title, event.description)}
                className="px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-semibold rounded-lg cursor-pointer transition-transform hover:scale-105"
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`mt-12 ${generatedImages.length > 0 ? "block" : "hidden"}`}
        >
          <h2 className="text-2xl font-semibold mb-6">Generated Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image) => {
              const hue = hues[image.id] || 0;
              const displaySrc = image.image || image.imageUrl || "";
              return (
                <div
                  key={image.id}
                  className="bg-gray-800 rounded-xl overflow-hidden transition-transform hover:-translate-y-2"
                >
                  <div className="h-48 w-full relative">
                    {!error && displaySrc ? (
                      <Image
                        src={displaySrc}
                        alt={image.title}
                        fill
                        className="object-cover"
                        onError={() => setError(true)}
                      />
                    ) : (
                      <div
                        className="h-48 flex items-center justify-center font-semibold"
                        style={{
                          background: `linear-gradient(45deg, hsl(${hue}, 70%, 40%), hsl(${
                            hue + 40
                          }, 70%, 60%))`,
                        }}
                      >
                        Image failed to load
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">
                      {image.title}
                    </h3>
                    <p className="text-gray-300 mb-2">
                      {image.description.substring(0, 100)}...
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Source: {image.source}
                    </p>
                    {image.imageUrl && (
                      <button
                        onClick={() => window.open(image.imageUrl, "_blank")}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white cursor-pointer"
                      >
                        View Image
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
