import { NextResponse } from 'next/server';
import UploadManager from '@/lib/uploads/manager';
import fs from 'fs';
import path from 'path';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { fileId } = await params;
    const file = UploadManager.getFile(fileId);

    if (!file || file.fileType !== 'image') {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    const buffer = fs.readFileSync(file.filePath);
    const ext = path.extname(file.name).toLowerCase().slice(1);
    const mimeType =
      ext === 'png'
        ? 'image/png'
        : ext === 'gif'
          ? 'image/gif'
          : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Error serving image' },
      { status: 500 },
    );
  }
}
