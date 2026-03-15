import db from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { and, desc, eq, like, sql } from 'drizzle-orm';

export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const spaceId = url.searchParams.get('spaceId');
    const folderId = url.searchParams.get('folderId');
    const pinned = url.searchParams.get('pinned');
    const limit = url.searchParams.get('limit');
    const q = url.searchParams.get('q');

    const conditions = [];

    if (spaceId) {
      conditions.push(eq(chats.spaceId, spaceId));
    }
    if (folderId) {
      conditions.push(eq(chats.folderId, folderId));
    }
    if (pinned === '1') {
      conditions.push(eq(chats.pinned, 1));
    }
    if (q) {
      conditions.push(like(chats.title, `%${q}%`));
    }

    const query = db
      .select()
      .from(chats)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(chats.createdAt));

    let result;
    if (limit) {
      result = query.limit(parseInt(limit, 10)).all();
    } else {
      result = query.all();
    }

    return Response.json({ chats: result }, { status: 200 });
  } catch (err) {
    console.error('Error in getting chats: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
