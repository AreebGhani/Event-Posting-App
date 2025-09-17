import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const JINA_READER_API_URL = "https://r.jina.ai/";
const JINA_API_KEY = process.env.JINA_API_KEY ?? '';

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
  const allowedHosts = [
    "meetup.com",
    "luma.com",
    "eventbrite.com",
    "linkedin.com",
    "facebook.com",
  ];
  const isAllowedHost = allowedHosts.some((host) =>
    validUrl.hostname.endsWith(host)
  );
  if (!isAllowedHost) {
    return NextResponse.json(
      { message: "A valid Meetup, Luma, Eventbrite, LinkedIn, or Facebook URL is required" },
      { status: 400 }
    );
  }
  try {
    const jinaUrl = `${JINA_READER_API_URL}${urlParam}`;
    const headers = JINA_API_KEY ? { 'Authorization': `Bearer ${JINA_API_KEY}` } : {};
    const jinaResponse = await axios.get(jinaUrl, {
      headers: {
        ...headers,
        "Accept": "application/json",
      },
    });
    const jinaData = jinaResponse.data;
    if (!jinaData || !jinaData.data || jinaData.data.length === 0) {
      throw new Error("Jina API did not return structured data.");
    }
    return NextResponse.json(jinaData, { status: 200 });
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