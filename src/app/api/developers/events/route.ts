import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

export async function GET() {
  // const events = await prisma.developerPortalEvent.findMany({
  //   include: { developer_portal_event_attendees: true },
  //   orderBy: { date: 'asc' },
  // })
  return NextResponse.json([])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      date,
      // time,
      location,
      organizerId,
      // maxAttendees,
      type,
      // tags,
      // urls
    } = body
    if (!title || !description || !date || !location || !organizerId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    // const organizer = await prisma.developerPortalDeveloperUser.findUnique({
    //   where: { devuserid: organizerId }
    // })
    // if (!organizer) {
    //   return NextResponse.json(
    //     { success: false, error: 'Organizer not found' },
    //     { status: 404 }
    //   )
    // }
    const eventType = type.toUpperCase() as
      | 'MEETUP'
      | 'CONFERENCE'
      | 'WORKSHOP'
      | 'HACKATHON'
      | 'WEBINAR'
      | 'CODE_REVIEW'
      | 'NETWORKING'
    if (!['MEETUP','CONFERENCE','WORKSHOP','HACKATHON','WEBINAR','CODE_REVIEW','NETWORKING'].includes(eventType)) {
      return NextResponse.json(
        { success: false, error: `Invalid event type: ${type}` },
        { status: 400 }
      )
    }
    // const eventDate = time ? new Date(`${date}T${time}`) : new Date(date)
    // const googleCalendarLink = urls?.find((u: string) => u.includes('google.com')) || null
    // const microsoftCalendarLink = urls?.find((u: string) => u.includes('outlook') || u.includes('microsoft')) || null
    // const event = await prisma.developerPortalEvent.create({
    //   data: {
    //     title,
    //     description,
    //     date: eventDate,
    //     location,
    //     organizerId,
    //     maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
    //     type: eventType,
    //     tags: tags || [],
    //     googleCalendarLink,
    //     microsoftCalendarLink,
    //     updatedAt: new Date()
    //   },
    //   include: {
    //     organizer: {
    //       select: {
    //         devuserid: true,
    //         username: true,
    //         firstname: true,
    //         lastname: true,
    //         profile_photo: true,
    //         avatar: true
    //       }
    //     },
    //     developer_portal_event_attendees: true
    //   }
    // })
    // const transformed = {
    //   id: event.id,
    //   title: event.title,
    //   description: event.description,
    //   date: event.date,
    //   location: event.location,
    //   type: event.type,
    //   maxAttendees: event.maxAttendees,
    //   tags: event.tags,
    //   googleCalendarLink: event.googleCalendarLink,
    //   microsoftCalendarLink: event.microsoftCalendarLink,
    //   createdAt: event.createdAt,
    //   organizer: {
    //     id: event.organizer.devuserid,
    //     name:
    //       event.organizer.firstname && event.organizer.lastname
    //         ? `${event.organizer.firstname} ${event.organizer.lastname}`
    //         : event.organizer.username,
    //     avatar:
    //       event.organizer.profile_photo ||
    //       (event.organizer.avatar === 'Male Dev'
    //         ? '👨‍💻'
    //         : event.organizer.avatar === 'Female Dev'
    //         ? '👩‍💻'
    //         : event.organizer.avatar === 'Neutral Dev'
    //         ? '🧑‍💻'
    //         : event.organizer.avatar || '👨‍💻')
    //   },
    //   attendeesCount: event.developer_portal_event_attendees.length
    // }
    return NextResponse.json({ success: true, data: [] }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
