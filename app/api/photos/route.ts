import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'

export async function GET() {
  try {
    // Connect to MongoDB
    await connectToDatabase()
    
    // Fetch all photos from MongoDB
    const photos = await Photo.find({}).sort({ createdAt: -1 }).lean()
    
    return NextResponse.json({ 
      success: true, 
      photos 
    })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch photos',
        details: process.env.NODE_ENV === 'production' ? undefined : error
      },
      { status: 500 }
    )
  }
}