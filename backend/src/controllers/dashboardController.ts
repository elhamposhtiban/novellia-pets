import { Request, Response, NextFunction } from 'express';
import { dashboardQueries } from '../db/queries/dashboardQueries';

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await dashboardQueries.getAllStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

