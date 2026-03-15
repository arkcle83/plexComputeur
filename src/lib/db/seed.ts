import db from './index';
import { spaces } from './schema';

export const seedDefaults = async () => {
  const existing = await db.query.spaces.findMany();
  if (existing.length === 0) {
    await db.insert(spaces).values({
      id: 'default',
      name: 'Général',
      emoji: '📁',
      description: '',
      createdAt: new Date().toISOString(),
    });
    console.log('Seeded default space: Général');
  }
};
