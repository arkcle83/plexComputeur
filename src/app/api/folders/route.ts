import db from '@/lib/db';
import { folders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const spaceId = url.searchParams.get('spaceId');

    let result;
    if (spaceId) {
      result = await db.query.folders.findMany({
        where: eq(folders.spaceId, spaceId),
      });
    } else {
      result = await db.query.folders.findMany();
    }

    return Response.json({ folders: result }, { status: 200 });
  } catch (err) {
    console.error('Error getting folders:', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { name, spaceId } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { message: 'Name is required.' },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID().slice(0, 12);
    const newFolder = {
      id,
      name: name.trim(),
      spaceId: spaceId || null,
      createdAt: new Date().toISOString(),
    };

    await db.insert(folders).values(newFolder);

    return Response.json({ folder: newFolder }, { status: 201 });
  } catch (err) {
    console.error('Error creating folder:', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
