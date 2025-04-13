import { NextResponse } from 'next/server'
import { writeFile, mkdir, access, constants } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await connectToDatabase()
    
    const formData = await request.formData()
    const section = formData.get('section') as string
    const uploadedPhotos = []

    // Ensure paths are absolute and use correct separators
    const publicDir = path.join(process.cwd(), 'public')
    const uploadsDir = path.join(publicDir, 'uploads')

    console.log('Directories:', { publicDir, uploadsDir })

    // Ensure directories exist with proper permissions
    try {
      // Check if directories exist and are writable
      try {
        await access(publicDir, constants.W_OK)
        console.log('Public directory exists and is writable')
      } catch (err) {
        console.log('Public directory issue:', err)
        await mkdir(publicDir, { recursive: true })
        console.log('Created public directory')
      }
      
      try {
        await access(uploadsDir, constants.W_OK)
        console.log('Uploads directory exists and is writable')
      } catch (err) {
        console.log('Uploads directory issue:', err)
        await mkdir(uploadsDir, { recursive: true })
        console.log('Created uploads directory')
      }
    } catch (error) {
      console.error('Directory access/creation error:', error)
      return NextResponse.json({ 
        error: 'Server configuration error: Unable to access upload directory',
        details: error
      }, { status: 500 })
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

          const photoId = uuidv4()
          const photoData = {
            id: photoId,
            name: file.name,
            url: `/uploads/${fileName}`,
            section
          }

          // Save to MongoDB
          await Photo.create(photoData)
          uploadedPhotos.push(photoData)
        } catch (fileError) {
          console.error(`File write error for ${fileName}:`, fileError)
          throw new Error(`Server storage error: Unable to save file ${file.name}`)
        }
      }
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
        details: process.env.NODE_ENV === 'production' ? error : undefined
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