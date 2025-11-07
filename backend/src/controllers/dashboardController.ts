import { Request, Response, NextFunction } from 'express';
import { query } from '../db/database';

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Total pets
    const totalPetsResult = await query('SELECT COUNT(*) as count FROM pets');
    const totalPets = parseInt(totalPetsResult.rows[0].count, 10);

    // Pets by type
    const petsByTypeResult = await query(
      'SELECT animal_type, COUNT(*) as count FROM pets GROUP BY animal_type ORDER BY count DESC'
    );
    const petsByType: Record<string, number> = petsByTypeResult.rows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.animal_type] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    // Total medical records
    const totalRecordsResult = await query('SELECT COUNT(*) as count FROM medical_records');
    const totalRecords = parseInt(totalRecordsResult.rows[0].count, 10);

    // Records by type
    const recordsByTypeResult = await query(
      'SELECT record_type, COUNT(*) as count FROM medical_records GROUP BY record_type'
    );
    const recordsByType: Record<string, number> = recordsByTypeResult.rows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.record_type] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    // Upcoming vaccines (vaccines from last 30 days to next 30 days)
    const upcomingVaccinesResult = await query(
      `SELECT mr.*, p.name as pet_name, p.animal_type 
       FROM medical_records mr
       JOIN pets p ON mr.pet_id = p.id
       WHERE mr.record_type = 'vaccine' 
       AND mr.date >= CURRENT_DATE - INTERVAL '30 days'
       AND mr.date <= CURRENT_DATE + INTERVAL '30 days'
       ORDER BY mr.date ASC
       LIMIT 10`
    );

    // Recent records (last 10)
    const recentRecordsResult = await query(
      `SELECT mr.*, p.name as pet_name, p.animal_type 
       FROM medical_records mr
       JOIN pets p ON mr.pet_id = p.id
       ORDER BY mr.created_at DESC
       LIMIT 10`
    );

    res.json({
      totalPets,
      petsByType,
      totalRecords,
      recordsByType,
      upcomingVaccines: upcomingVaccinesResult.rows,
      recentRecords: recentRecordsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

