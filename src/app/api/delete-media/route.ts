import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 });
    }

    // Extract filename from URL
    const filename = url.replace('/uploads/', '');
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    try {
      await unlink(filepath);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, which is fine
        return NextResponse.json({ success: true });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete file',
      },
      { status: 500 },
    );
  }
}
