import db from '@/lib/db';
import { spaces, chats } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export const GET = async () => {
  try {
    const allSpaces = await db.query.spaces.findMany();

    const countsRaw = db
      .select({
        spaceId: chats.spaceId,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(chats)
      .where(sql`${chats.spaceId} IS NOT NULL`)
      .groupBy(chats.spaceId)
      .all();

    const countMap: Record<string, number> = {};
    for (const row of countsRaw) {
      if (row.spaceId) countMap[row.spaceId] = row.count;
    }

    const result = allSpaces.map((s) => ({
      ...s,
      chatCount: countMap[s.id] || 0,
    }));

    return Response.json({ spaces: result }, { status: 200 });
  } catch (err) {
    console.error('Error getting spaces:', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { name, emoji, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { message: 'Name is required.' },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID().slice(0, 12);
    const newSpace = {
      id,
      name: name.trim(),
      emoji: emoji || '📁',
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    await db.insert(spaces).values(newSpace);

    return Response.json({ space: newSpace }, { status: 201 });
  } catch (err) {
    console.error('Error creating space:', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
