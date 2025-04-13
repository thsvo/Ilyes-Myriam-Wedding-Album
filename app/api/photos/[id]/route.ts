import { NextResponse } from 'next/server'
import { readFile, writeFile, unlink, access } from 'fs/promises'
import path from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const publicDir = path.join(process.cwd(), 'public')
    const photosPath = path.join(publicDir, 'photos.json')
    
    // Check if photos.json exists
    try {
      await access(photosPath)
    } catch (error) {
      console.error('photos.json does not exist:', error)
      return NextResponse.json(
        { error: 'Photos database not found' },
        { status: 404 }
      )
    }
    
    // Read photos.json
    let photos = []
    try {
      const photosData = await readFile(photosPath, 'utf-8')
      photos = photosData ? JSON.parse(photosData) : []
    } catch (error) {
      console.error('Error reading photos.json:', error)
      return NextResponse.json(
        { error: 'Failed to read photos database' },
        { status: 500 }
      )
    }
    
    // Find the photo to delete
    const photoToDelete = photos.find((photo: any) => photo.id === id)
    if (!photoToDelete) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Remove the file from uploads directory
    try {
      const filePath = path.join(publicDir, photoToDelete.url)
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
      // Continue even if file deletion fails
    }

    // Update photos.json
    try {
      const updatedPhotos = photos.filter((photo: any) => photo.id !== id)
      await writeFile(photosPath, JSON.stringify(updatedPhotos, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error updating photos.json:', error)
      return NextResponse.json(
        { error: 'Failed to update photos database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}