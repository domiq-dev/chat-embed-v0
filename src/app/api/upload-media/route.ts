import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.name);
      const filename = `${timestamp}_${randomString}${extension}`;

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filepath = path.join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      uploadedFiles.push({
        id: randomString,
        name: file.name,
        url: `/uploads/${filename}`,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload files',
      },
      { status: 500 },
    );
  }
}
