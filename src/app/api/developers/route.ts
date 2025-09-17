import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { devuserid, username, email } = body
    if (!devuserid || !username || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    // const user = await prisma.developerPortalDeveloperUser.create({
    //   data: {
    //     devuserid,
    //     username,
    //     email
    //   }
    // })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
