import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const photosPath = path.join(process.cwd(), 'public', 'photos.json')
    const photosData = await fs.readFile(photosPath, 'utf-8')
    const photos = JSON.parse(photosData)
    
    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error reading photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}