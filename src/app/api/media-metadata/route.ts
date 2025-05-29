import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';

const METADATA_FILE = path.join(process.cwd(), 'public', 'uploads', 'metadata.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

interface MediaMetadata {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  tags?: string[];
}

// Ensure metadata file exists
async function ensureMetadataFile() {
  try {
    await readFile(METADATA_FILE);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it
      await mkdir(path.dirname(METADATA_FILE), { recursive: true });
      await writeFile(METADATA_FILE, JSON.stringify([]));
    }
  }
}

// Recover metadata for orphaned files
async function recoverOrphanedFiles() {
  try {
    const files = await readdir(UPLOADS_DIR);
    const imageFiles = files.filter(file => 
      file.match(/\.(jpg|jpeg|png|gif|webp)$/i) && 
      file !== '.gitkeep' && 
      file !== 'metadata.json'
    );

    if (imageFiles.length === 0) return [];

    const recoveredMetadata: MediaMetadata[] = [];

    for (const filename of imageFiles) {
      const filePath = path.join(UPLOADS_DIR, filename);
      const stats = await stat(filePath);
      
      // Extract original name (remove timestamp prefix)
      const originalName = filename.replace(/^\d+_[a-z0-9]+_/, '') || filename;
      
      recoveredMetadata.push({
        id: filename.split('.')[0], // Use filename as ID
        url: `/uploads/${filename}`,
        name: originalName,
        type: `image/${path.extname(filename).slice(1)}`,
        size: stats.size,
        uploadedAt: stats.birthtime.toISOString(),
      });
    }

    return recoveredMetadata;
  } catch (error) {
    console.error('Error recovering orphaned files:', error);
    return [];
  }
}

// Get all media metadata
export async function GET() {
  try {
    await ensureMetadataFile();
    const data = await readFile(METADATA_FILE, 'utf-8');
    let metadata: MediaMetadata[] = JSON.parse(data);
    
    // If metadata is empty but there are files, try to recover
    if (metadata.length === 0) {
      const recovered = await recoverOrphanedFiles();
      if (recovered.length > 0) {
        metadata = recovered;
        // Save the recovered metadata
        await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
        console.log('Recovered metadata for', recovered.length, 'orphaned files');
      }
    }
    
    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error('Error reading metadata:', error);
    return NextResponse.json({ success: true, metadata: [] });
  }
}

// Save media metadata
export async function POST(req: NextRequest) {
  try {
    const { metadata }: { metadata: MediaMetadata[] } = await req.json();
    
    await ensureMetadataFile();
    await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving metadata:', error);
    return NextResponse.json({ 
      error: 'Failed to save metadata' 
    }, { status: 500 });
  }
}

// Delete media metadata
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    
    await ensureMetadataFile();
    const data = await readFile(METADATA_FILE, 'utf-8');
    const metadata: MediaMetadata[] = JSON.parse(data);
    
    const filteredMetadata = metadata.filter(item => item.id !== id);
    await writeFile(METADATA_FILE, JSON.stringify(filteredMetadata, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting metadata:', error);
    return NextResponse.json({ 
      error: 'Failed to delete metadata' 
    }, { status: 500 });
  }
} 