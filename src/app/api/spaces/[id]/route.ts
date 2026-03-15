import db from '@/lib/db';
import { spaces, chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db.query.spaces.findFirst({
      where: eq(spaces.id, id),
    });

    if (!existing) {
      return Response.json({ message: 'Space not found' }, { status: 404 });
    }

    const updates: Record<string, string> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.emoji !== undefined) updates.emoji = body.emoji;
    if (body.description !== undefined) updates.description = body.description;

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { message: 'No fields to update.' },
        { status: 400 },
      );
    }

    await db.update(spaces).set(updates).where(eq(spaces.id, id));

    const updated = await db.query.spaces.findFirst({
      where: eq(spaces.id, id),
    });

    return Response.json({ space: updated }, { status: 200 });
  } catch (err) {
    console.error('Error updating space:', err);
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

    const existing = await db.query.spaces.findFirst({
      where: eq(spaces.id, id),
    });

    if (!existing) {
      return Response.json({ message: 'Space not found' }, { status: 404 });
    }

    await db
      .update(chats)
      .set({ spaceId: null })
      .where(eq(chats.spaceId!, id));

    await db.delete(spaces).where(eq(spaces.id, id));

    return Response.json(
      { message: 'Space deleted successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error deleting space:', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
