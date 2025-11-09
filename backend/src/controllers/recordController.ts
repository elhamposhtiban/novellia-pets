import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { recordQueries } from '../db/queries/recordQueries';
import { petQueries } from '../db/queries/petQueries';

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
    const id = parseInt(petId, 10);

    // Check if pet exists
    const pet = await petQueries.getById(id);
    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const records = await recordQueries.getByPetId(id);
    res.json(records);
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
    const recordId = parseInt(id, 10);

    const record = await recordQueries.getById(recordId);
    
    if (!record) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    res.json(record);
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
    const id = parseInt(petId, 10);
    const pet = await petQueries.getById(id);
    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const record = await recordQueries.create({
      pet_id: id,
      record_type,
      name,
      date: date || null,
      reactions: reactions || null,
      severity: severity || null,
    });

    res.status(201).json(record);
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
    const recordId = parseInt(id, 10);
    const { record_type, name, date, reactions, severity } = req.body;

    // Check if record exists
    const existingRecord = await recordQueries.getById(recordId);
    if (!existingRecord) {
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

    // Always use provided values, fallback to existing only if not provided
    const finalRecordType = record_type !== undefined ? record_type : existingRecord.record_type;
    const finalName = name !== undefined ? name : existingRecord.name;
    // For date: if provided (even if empty string), use it; otherwise keep existing
    const finalDate = date !== undefined ? (date === "" ? null : date) : existingRecord.date;
    const finalReactions = reactions !== undefined ? reactions : existingRecord.reactions;
    const finalSeverity = severity !== undefined ? severity : existingRecord.severity;

    const record = await recordQueries.update(recordId, {
      record_type: finalRecordType,
      name: finalName,
      date: finalDate,
      reactions: finalReactions,
      severity: finalSeverity,
    });

    res.status(200).json(record);
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
    const recordId = parseInt(id, 10);

    // Check if record exists
    const record = await recordQueries.getById(recordId);
    if (!record) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    await recordQueries.delete(recordId);

    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    next(err);
  }
};

