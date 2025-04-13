import { NextResponse } from 'next/server'
import { writeFile, readFile, mkdir, access } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const section = formData.get('section') as string
    const uploadedPhotos = []

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await access(uploadsDir)
    } catch {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Read existing photos
    const photosPath = path.join(process.cwd(), 'public', 'photos.json')
    let existingPhotos = []
    try {
      const photosData = await readFile(photosPath, 'utf-8')
      existingPhotos = JSON.parse(photosData)
    } catch {
      // If file doesn't exist, we'll create it
    }

    // Process each uploaded file
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file-') && value instanceof Blob) {
        const file = value as File
        const fileName = `${uuidv4()}-${file.name}`
        const filePath = path.join(uploadsDir, fileName)
        
        // Save file to uploads directory
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
    await writeFile(photosPath, JSON.stringify(updatedPhotos, null, 2))

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