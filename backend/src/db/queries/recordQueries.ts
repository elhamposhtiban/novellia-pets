import { query } from '../database';
import { MedicalRecord } from '../../types';

export const recordQueries = {
  getByPetId: async (petId: number): Promise<MedicalRecord[]> => {
    const result = await query(
      'SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date DESC, created_at DESC',
      [petId]
    );
    return result.rows;
  },

  getById: async (id: number): Promise<MedicalRecord | null> => {
    const result = await query('SELECT * FROM medical_records WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  },

  create: async (data: {
    pet_id: number;
    record_type: 'vaccine' | 'allergy';
    name: string;
    date?: string | null;
    reactions?: string | null;
    severity?: 'mild' | 'severe' | null;
  }): Promise<MedicalRecord> => {
    const result = await query(
      `INSERT INTO medical_records (pet_id, record_type, name, date, reactions, severity) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        data.pet_id,
        data.record_type,
        data.name,
        data.date || null,
        data.reactions || null,
        data.severity || null,
      ]
    );
    return result.rows[0];
  },

  update: async (id: number, data: {
    record_type?: 'vaccine' | 'allergy';
    name?: string;
    date?: string | null;
    reactions?: string | null;
    severity?: 'mild' | 'severe' | null;
  }): Promise<MedicalRecord> => {
    const result = await query(
      `UPDATE medical_records 
       SET record_type = $1, name = $2, date = $3, reactions = $4, severity = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        data.record_type,
        data.name,
        data.date,
        data.reactions,
        data.severity,
        id,
      ]
    );
    return result.rows[0];
  },

  delete: async (id: number): Promise<void> => {
    await query('DELETE FROM medical_records WHERE id = $1', [id]);
  },
};

