import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

import type { EventData } from "@/types";

async function getPage(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch the page with status: ${response.status}`);
  }
  const html = await response.text();
  return cheerio.load(html);
}

function createMapEmbedUrl(location: {
  address?: string | null;
  geo?: { latitude: number; longitude: number } | null;
}): string | null {
  const { address, geo } = location;
  if (
    geo &&
    typeof geo.latitude === "number" &&
    typeof geo.longitude === "number"
  ) {
    const lat = geo.latitude;
    const lon = geo.longitude;
    const bbox = `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  }
  if (typeof address === "string" && address.trim()) {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.openstreetmap.org/export/embed.html?query=${encodedAddress}`;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json(
      { message: "URL parameter is required" },
      { status: 400 }
    );
  }
  if (/\s/.test(urlParam)) {
    return NextResponse.json(
      { message: "URL contains invalid characters or multiple links." },
      { status: 400 }
    );
  }
  let validUrl: URL;
  try {
    validUrl = new URL(urlParam);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return NextResponse.json(
      { message: "Invalid URL format provided." },
      { status: 400 }
    );
  }
  const allowedHosts = ["meetup.com", "luma.com"];
  const isAllowedHost = allowedHosts.some((host) =>
    validUrl.hostname.endsWith(host)
  );
  if (!isAllowedHost) {
    return NextResponse.json(
      { message: "A valid Meetup or Luma URL is required" },
      { status: 400 }
    );
  }

  try {
    const urlString = validUrl.toString();
    const $ = await getPage(urlString);
    let eventData: EventData;

    if (urlString.includes("luma.com")) {
      const jsonDataString = $('script[type="application/ld+json"]').html();
      if (!jsonDataString) throw new Error("Could not find Luma JSON-LD data.");
      const jsonData = JSON.parse(jsonDataString);
      eventData = {
        platform: "Luma",
        title: jsonData.name || "Untitled Event",
        hostedBy:
          Array.isArray(jsonData.organizer) && jsonData.organizer.length > 0
            ? jsonData.organizer
                .map((org: { name?: string }) => org.name)
                .join(", ")
            : "Luma Host",
        date: new Date(jsonData.startDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date(jsonData.startDate).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
        locationName: jsonData.location?.name || "Online Event",
        imageUrl: Array.isArray(jsonData.image)
          ? jsonData.image?.[0] ?? ""
          : jsonData?.image ?? "",
        description: jsonData.description || "No description provided.",
        attendees: 0,
        mapEmbedUrl: createMapEmbedUrl({ geo: jsonData.location?.geo }),
        sourceUrl: jsonData["@id"] || urlString,
      };
    } else {
      let date: string = "";
      let time: string = "";
      const response = await fetch("https://www.meetup.com/gql2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationName: "getEventByIdForAttendees",
          variables: {
            eventId: "310371352",
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                "06e14c0b9938b3f0cbd5f0ef3a4cf910d01285c8bcc6ebf76b0f0aafbf19b076",
            },
          },
        }),
      });
      const data = await response.json();
      const dateTime = data?.data?.event?.dateTime;
      if (dateTime) {
        const eventDate = new Date(dateTime);
        const formattedDate = eventDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedTime = eventDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        });
        date = formattedDate;
        time = formattedTime;
      }
      eventData = {
        platform: "Meetup",
        title:
          $(
            "#main > div.px-5.w-full.bg-white.border-b.border-shadowColor.py-2 > div > h1"
          )
            .text()
            .trim() || "Untitled Event",
        hostedBy:
          $(
            "#main > div.px-5.w-full.bg-white.border-b.border-shadowColor.py-2 > div > a > div > div.ml-6 > div:nth-child(2) > span"
          )
            .text()
            .trim() || "Meetup Host",
        date: date || "Date not found",
        time: time || "Time not found",
        locationName:
          $(
            "#event-info > div > div:nth-child(1) > div.flex.flex-col > div > div.overflow-hidden.pl-4 > div:nth-child(1)"
          )
            .text()
            .trim() || "Location TBD",
        imageUrl: $('meta[property="og:image"]').attr("content") || "",
        description:
          $('meta[property="og:description"]').attr("content") ||
          "No description provided.",
        attendees: parseInt(
          $("#attendees > div.flex.items-center.justify-between > h2")
            .text()
            .trim()
            .match(/\((\d+)\)/)?.[1] || "0",
          10
        ),
        mapEmbedUrl: null,
        sourceUrl: urlString,
      };
    }

    return NextResponse.json(eventData, { status: 200 });
  } catch (error) {
    console.log("Error getting event:", error);
    return NextResponse.json(
      {
        message: `Error getting event: ${
          error instanceof Error ? error.message : "something went wrong"
        }`,
      },
      { status: 500 }
    );
  }
}
