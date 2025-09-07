export interface EventData {
  platform: "Meetup" | "Luma";
  title: string;
  hostedBy: string;
  date: string;
  time: string;
  locationName: string;
  imageUrl: string;
  description: string;
  attendees: number;
  mapEmbedUrl: string | null;
  sourceUrl: string;
}

export interface Post {
  id: string;
  contentText: string;
  events: EventData[];
}
