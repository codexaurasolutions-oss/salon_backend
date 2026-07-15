import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const rows = await prisma.platformSetting.findMany();
    const settings: Record<string, any> = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;
