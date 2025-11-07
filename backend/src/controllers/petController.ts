import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/database';

const createPetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  animal_type: z.string().min(1, 'Animal type is required').max(100, 'Animal type is too long'),
  owner_name: z.string().min(1, 'Owner name is required').max(255, 'Owner name is too long'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
});

const updatePetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  animal_type: z.string().min(1, 'Animal type is required').max(100, 'Animal type is too long').optional(),
  owner_name: z.string().min(1, 'Owner name is required').max(255, 'Owner name is too long').optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').optional(),
});


export const getAllPets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, animal_type } = req.query;
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push(`name ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    if (animal_type) {
      conditions.push(`animal_type = $${params.length + 1}`);
      params.push(animal_type);
    }

    let sql = 'SELECT * FROM pets';
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const getPetById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const petResult = await query('SELECT * FROM pets WHERE id = $1', [id]);
    
    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    res.json(petResult.rows[0]);
  } catch (err) {
    next(err);
  }
};


export const createPet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, animal_type, owner_name, date_of_birth } = req.body;

    const validationResult = createPetSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationResult.error.errors
      });
      return;
    }

    // Check if pet already exists 
    const existingPet = await query(
      'SELECT * FROM pets WHERE name = $1 AND owner_name = $2',
      [name, owner_name]
    );

    if (existingPet.rows.length > 0) {
      res.status(400).json({ error: 'Pet already exists' });
      return;
    }

    const result = await query(
      `INSERT INTO pets (name, animal_type, owner_name, date_of_birth) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, animal_type, owner_name, date_of_birth]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};


export const updatePet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, animal_type, owner_name, date_of_birth } = req.body;

    // Check if pet exists
    const checkResult = await query('SELECT * FROM pets WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const validationResult = updatePetSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: validationResult.error.errors
      });
      return;
    }

    const result = await query(
      `UPDATE pets 
       SET name = $1, animal_type = $2, owner_name = $3, date_of_birth = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = ${id}
       RETURNING *`,
      [name, animal_type, owner_name, date_of_birth]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};


export const deletePet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if pet exists
    const checkResult = await query('SELECT * FROM pets WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    await query('DELETE FROM pets WHERE id = $1', [id]);

    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (err) {
    next(err);
  }
};

