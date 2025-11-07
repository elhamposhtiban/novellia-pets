import { Pool } from 'pg';
import { config } from '../config/config';

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
});

// Test connection
export const connect = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    throw err;
  }
};

// Initialize database schema
export const initializeSchema = async (): Promise<boolean> => {
  try {
    // Create pets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        animal_type VARCHAR(100) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create medical_records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('vaccine', 'allergy')),
        name VARCHAR(255) NOT NULL,
        date DATE,
        reactions TEXT,
        severity VARCHAR(20) CHECK (severity IN ('mild', 'severe')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
      CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(record_type);
      CREATE INDEX IF NOT EXISTS idx_pets_animal_type ON pets(animal_type);
      CREATE INDEX IF NOT EXISTS idx_pets_name ON pets(name);
    `);

    console.log('✅ Database schema initialized');
    return true;
  } catch (err) {
    console.error('❌ Schema initialization error:', err);
    throw err;
  }
};

// Query helper function
export const query = async <T = any>(
  text: string,
  params?: any[]
): Promise<any> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err: any) {
    console.error('Query error', { text, error: err.message });
    throw err;
  }
};

export { pool };

