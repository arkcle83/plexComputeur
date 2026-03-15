import db from '@/lib/db';
import { folders, chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db.query.folders.findFirst({
      where: eq(folders.id, id),
    });

    if (!existing) {
      return Response.json({ message: 'Folder not found' }, { status: 404 });
    }

    const updates: Record<string, string> = {};
    if (body.name !== undefined) updates.name = body.name.trim();

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { message: 'No fields to update.' },
        { status: 400 },
      );
    }

    await db.update(folders).set(updates).where(eq(folders.id, id));

    const updated = await db.query.folders.findFirst({
      where: eq(folders.id, id),
    });

    return Response.json({ folder: updated }, { status: 200 });
  } catch (err) {
    console.error('Error updating folder:', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    const existing = await db.query.folders.findFirst({
      where: eq(folders.id, id),
    });

    if (!existing) {
      return Response.json({ message: 'Folder not found' }, { status: 404 });
    }

    await db
      .update(chats)
      .set({ folderId: null })
      .where(eq(chats.folderId!, id));

    await db.delete(folders).where(eq(folders.id, id));

    return Response.json(
      { message: 'Folder deleted successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error deleting folder:', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
