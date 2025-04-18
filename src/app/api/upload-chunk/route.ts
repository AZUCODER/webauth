import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuid4 } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const TEMP_DIR = join(process.cwd(), 'public', 'temp');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get('chunk') as Blob;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const fileId = formData.get('fileId') as string || uuid4();
    
    // Ensure temp directory exists
    await mkdir(TEMP_DIR, { recursive: true });
    
    // Save chunk to temp directory
    const chunkPath = join(TEMP_DIR, `${fileId}-${chunkIndex}`);
    const buffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, buffer);
    
    // If this is the last chunk, combine all chunks and move to final location
    if (chunkIndex === totalChunks - 1) {
      // Ensure upload directory exists
      await mkdir(UPLOAD_DIR, { recursive: true });
      
      // TODO: Implement chunk combination logic here
      // For now, just return success
      
      return NextResponse.json({ 
        success: true, 
        fileId,
        message: 'All chunks uploaded successfully' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      fileId,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded` 
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload chunk' },
      { status: 500 }
    );
  }
} 