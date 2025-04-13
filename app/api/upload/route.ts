import { NextResponse } from 'next/server'
import { writeFile, readFile, mkdir, access } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const section = formData.get('section') as string
    const uploadedPhotos = []

    // Ensure paths are absolute and use correct separators
    const publicDir = path.join(process.cwd(), 'public')
    const uploadsDir = path.join(publicDir, 'uploads')
    const photosPath = path.join(publicDir, 'photos.json')

    // Ensure directories exist with proper permissions
    try {
      // Check if directories exist and are writable
      await Promise.all([
        access(publicDir, require('fs').constants.W_OK),
        access(uploadsDir, require('fs').constants.W_OK)
      ]).catch(async () => {
        // If directories don't exist or aren't writable, try to create them
        await mkdir(uploadsDir, { recursive: true, mode: 0o755 })
      })
    } catch (error) {
      console.error('Directory access/creation error:', error)
      throw new Error('Server configuration error: Unable to access upload directory')
    }

    // Initialize or read photos.json with proper error handling
    let existingPhotos = []
    try {
      try {
        const photosData = await readFile(photosPath, 'utf-8')
        existingPhotos = JSON.parse(photosData || '[]')
      } catch (readError) {
        // If file doesn't exist, create it with proper permissions
        await writeFile(photosPath, '[]', { mode: 0o644, encoding: 'utf-8' })
      }
    } catch (error) {
      console.error('Photos.json handling error:', error)
      throw new Error('Server configuration error: Unable to manage photos database')
    }

    // Process each uploaded file with better error handling
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file-') && value instanceof Blob) {
        const file = value as File
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${uuidv4()}-${safeFileName}`
        const filePath = path.join(uploadsDir, fileName)
        
        try {
          // Save file with proper permissions
          const buffer = Buffer.from(await file.arrayBuffer())
          await writeFile(filePath, buffer, { mode: 0o644 })

          uploadedPhotos.push({
            id: uuidv4(),
            name: file.name,
            url: `/uploads/${fileName}`,
            section
          })
        } catch (fileError) {
          console.error(`File write error for ${fileName}:`, fileError)
          throw new Error(`Server storage error: Unable to save file ${file.name}`)
        }
      }
    }

    // Update photos.json with proper error handling
    try {
      const updatedPhotos = [...existingPhotos, ...uploadedPhotos]
      await writeFile(photosPath, JSON.stringify(updatedPhotos, null, 2), { 
        mode: 0o644, 
        encoding: 'utf-8' 
      })
    } catch (error) {
      console.error('Error updating photos database:', error)
      throw new Error('Server error: Unable to update photos database')
    }

    return NextResponse.json({ 
      success: true, 
      photos: uploadedPhotos 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload photos',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}