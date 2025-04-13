import { NextResponse } from 'next/server'
import { writeFile, readFile, mkdir, access, constants } from 'fs/promises'
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

    console.log('Directories:', { publicDir, uploadsDir, photosPath })

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

    // Initialize or read photos.json with proper error handling
    let existingPhotos = []
    try {
      try {
        const photosData = await readFile(photosPath, 'utf-8')
        existingPhotos = JSON.parse(photosData || '[]')
        console.log('Successfully read photos.json')
      } catch (readError) {
        console.log('photos.json read error (creating new file):', readError)
        // If file doesn't exist, create it with empty array
        await writeFile(photosPath, '[]', { encoding: 'utf-8' })
        console.log('Created new photos.json file')
      }
    } catch (error) {
      console.error('Photos.json handling error:', error)
      return NextResponse.json({ 
        error: 'Server configuration error: Unable to manage photos database',
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
        encoding: 'utf-8' 
      })
      console.log('Successfully updated photos.json')
    } catch (error) {
      console.error('Error updating photos database:', error)
      return NextResponse.json({ 
        error: 'Server error: Unable to update photos database',
        details: error
      }, { status: 500 })
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