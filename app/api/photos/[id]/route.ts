import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const id = context.params.id;
    
    // Find the photo in MongoDB
    const photo = await Photo.findOne({ id });
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Delete the file from uploads directory
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const filePath = path.join(publicDir, photo.url);
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }

    // Delete from MongoDB
    await Photo.deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}