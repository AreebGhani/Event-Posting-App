-- CreateEnum
CREATE TYPE "public"."AttendeeStatus" AS ENUM ('REGISTERED', 'CANCELLED', 'CHECKED_IN', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('MEETUP', 'CONFERENCE', 'WORKSHOP', 'HACKATHON', 'WEBINAR', 'CODE_REVIEW', 'NETWORKING');

-- CreateTable
CREATE TABLE "public"."developer_portal_developer_users" (
    "devuserid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "developer_portal_developer_users_pkey" PRIMARY KEY ("devuserid")
);

-- CreateTable
CREATE TABLE "public"."developer_portal_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "maxAttendees" INTEGER,
    "type" "public"."EventType" NOT NULL,
    "tags" TEXT[],
    "googleCalendarLink" TEXT,
    "microsoftCalendarLink" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."developer_portal_event_attendees" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."AttendeeStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developer_portal_developer_users_email_key" ON "public"."developer_portal_developer_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_eventId_userId_key" ON "public"."developer_portal_event_attendees"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "public"."developer_portal_events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."developer_portal_developer_users"("devuserid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."developer_portal_event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."developer_portal_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."developer_portal_event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."developer_portal_developer_users"("devuserid") ON DELETE CASCADE ON UPDATE CASCADE;
