import { NextResponse } from 'next/server'
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

    // Note: ImgBB doesn't provide a direct API to delete images via API key
    // If you need to delete from ImgBB, you would need to use the delete_url
    // that was stored when the image was uploaded
    
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