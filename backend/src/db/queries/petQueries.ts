import { query } from '../database';
import { Pet } from '../../types';

export interface PetFilters {
  search?: string;
  animal_type?: string;
}

export const petQueries = {
  getAll: async (filters?: PetFilters): Promise<Pet[]> => {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.search) {
      conditions.push(`name ILIKE $${params.length + 1}`);
      params.push(`%${filters.search}%`);
    }

    if (filters?.animal_type) {
      conditions.push(`animal_type = $${params.length + 1}`);
      params.push(filters.animal_type);
    }

    let sql = 'SELECT * FROM pets';
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  },

  getById: async (id: number): Promise<Pet | null> => {
    const result = await query('SELECT * FROM pets WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  },

  create: async (data: {
    name: string;
    animal_type: string;
    owner_name: string;
    date_of_birth: string;
  }): Promise<Pet> => {
    const result = await query(
      `INSERT INTO pets (name, animal_type, owner_name, date_of_birth) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [data.name, data.animal_type, data.owner_name, data.date_of_birth]
    );
    return result.rows[0];
  },

  update: async (id: number, data: {
    name?: string;
    animal_type?: string;
    owner_name?: string;
    date_of_birth?: string;
  }): Promise<Pet> => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramNum = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramNum++}`);
      params.push(data.name);
    }
    if (data.animal_type !== undefined) {
      updates.push(`animal_type = $${paramNum++}`);
      params.push(data.animal_type);
    }
    if (data.owner_name !== undefined) {
      updates.push(`owner_name = $${paramNum++}`);
      params.push(data.owner_name);
    }
    if (data.date_of_birth !== undefined) {
      updates.push(`date_of_birth = $${paramNum++}`);
      params.push(data.date_of_birth);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await query(
      `UPDATE pets 
       SET ${updates.join(', ')}
       WHERE id = $${paramNum}
       RETURNING *`,
      params
    );
    return result.rows[0];
  },

  delete: async (id: number): Promise<void> => {
    await query('DELETE FROM pets WHERE id = $1', [id]);
  },

  exists: async (name: string, owner_name: string): Promise<boolean> => {
    const result = await query(
      'SELECT * FROM pets WHERE name = $1 AND owner_name = $2',
      [name, owner_name]
    );
    return result.rows.length > 0;
  },
};

