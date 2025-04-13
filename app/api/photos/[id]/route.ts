import { NextResponse } from 'next/server'
import { readFile, writeFile, unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const photosPath = path.join(process.cwd(), 'public', 'photos.json')
    
    // Initialize photos array if file doesn't exist
    let photos = []
    try {
      const photosData = await readFile(photosPath, 'utf-8')
      photos = photosData ? JSON.parse(photosData) : []
    } catch (error) {
      // If file doesn't exist or is empty, continue with empty array
      await writeFile(photosPath, '[]', 'utf-8')
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
      const filePath = path.join(process.cwd(), 'public', photoToDelete.url)
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
    }

    // Update photos.json
    const updatedPhotos = photos.filter((photo: any) => photo.id !== id)
    await writeFile(photosPath, JSON.stringify(updatedPhotos, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}