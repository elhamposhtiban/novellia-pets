import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/database';

const createRecordSchema = z.object({
  record_type: z.enum(['vaccine', 'allergy'], {
    errorMap: () => ({ message: 'Record type must be "vaccine" or "allergy"' })
  }),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').optional(),
  reactions: z.string().optional(),
  severity: z.enum(['mild', 'severe']).optional(),
}).refine((data) => {
  if (data.record_type === 'vaccine' && !data.date) {
    return false;
  }
  return true;
}, {
  message: 'Vaccine records require a date',
  path: ['date'],
}).refine((data) => {
  if (data.record_type === 'allergy' && !data.severity) {
    return false;
  }
  return true;
}, {
  message: 'Allergy records require severity (mild or severe)',
  path: ['severity'],
});

const updateRecordSchema = z.object({
  record_type: z.enum(['vaccine', 'allergy']).optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').optional(),
  reactions: z.string().optional(),
  severity: z.enum(['mild', 'severe']).optional(),
});

export const getRecordsByPetId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { petId } = req.params;

    // Check if pet exists
    const petCheck = await query('SELECT * FROM pets WHERE id = $1', [petId]);
    if (petCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await query(
      'SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date DESC, created_at DESC',
      [petId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const getRecordById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM medical_records WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { petId } = req.params;
    const { record_type, name, date, reactions, severity } = req.body;

    const validationResult = createRecordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationResult.error.errors
      });
      return;
    }

    // Check if pet exists
    const petCheck = await query('SELECT * FROM pets WHERE id = $1', [petId]);
    if (petCheck.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await query(
      `INSERT INTO medical_records (pet_id, record_type, name, date, reactions, severity) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [petId, record_type, name, date || null, reactions || null, severity || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { record_type, name, date, reactions, severity } = req.body;

    // Check if record exists
    const checkResult = await query('SELECT * FROM medical_records WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    const validationResult = updateRecordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationResult.error.errors
      });
      return;
    }

    const existingRecord = checkResult.rows[0];
    // Always use provided values, fallback to existing only if not provided
    const finalRecordType = record_type !== undefined ? record_type : existingRecord.record_type;
    const finalName = name !== undefined ? name : existingRecord.name;
    // For date: if provided (even if empty string), use it; otherwise keep existing
    const finalDate = date !== undefined ? (date === "" ? null : date) : existingRecord.date;
    const finalReactions = reactions !== undefined ? reactions : existingRecord.reactions;
    const finalSeverity = severity !== undefined ? severity : existingRecord.severity;

    const result = await query(
      `UPDATE medical_records 
       SET record_type = $1, name = $2, date = $3, reactions = $4, severity = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [finalRecordType, finalName, finalDate, finalReactions, finalSeverity, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const deleteRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if record exists
    const checkResult = await query('SELECT * FROM medical_records WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    await query('DELETE FROM medical_records WHERE id = $1', [id]);

    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    next(err);
  }
};

