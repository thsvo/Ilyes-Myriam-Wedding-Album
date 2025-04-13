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

    // Create directories if they don't exist
    try {
      await access(publicDir)
    } catch {
      await mkdir(publicDir, { recursive: true })
    }

    try {
      await access(uploadsDir)
    } catch {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Initialize or read photos.json
    let existingPhotos = []
    try {
      const photosData = await readFile(photosPath, 'utf-8')
      existingPhotos = photosData ? JSON.parse(photosData) : []
    } catch {
      await writeFile(photosPath, '[]', 'utf-8')
    }

    // Process each uploaded file
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file-') && value instanceof Blob) {
        const file = value as File
        const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = path.join(uploadsDir, fileName)
        
        // Save file
        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)

        // Add to photos list
        uploadedPhotos.push({
          id: uuidv4(),
          name: file.name,
          url: `/uploads/${fileName}`,
          section
        })
      }
    }

    // Update photos.json
    const updatedPhotos = [...existingPhotos, ...uploadedPhotos]
    await writeFile(photosPath, JSON.stringify(updatedPhotos, null, 2), 'utf-8')

    return NextResponse.json({ 
      success: true, 
      photos: uploadedPhotos 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}