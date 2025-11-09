import { query } from '../database';

export interface DashboardStats {
  totalPets: number;
  petsByType: Record<string, number>;
  totalRecords: number;
  recordsByType: Record<string, number>;
  upcomingVaccines: Array<any>;
  recentRecords: Array<any>;
}

export const dashboardQueries = {
  getTotalPets: async (): Promise<number> => {
    const result = await query('SELECT COUNT(*) as count FROM pets');
    return parseInt(result.rows[0].count, 10);
  },

  getPetsByType: async (): Promise<Record<string, number>> => {
    const result = await query(
      'SELECT animal_type, COUNT(*) as count FROM pets GROUP BY animal_type ORDER BY count DESC'
    );
    return result.rows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.animal_type] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);
  },

  getTotalRecords: async (): Promise<number> => {
    const result = await query('SELECT COUNT(*) as count FROM medical_records');
    return parseInt(result.rows[0].count, 10);
  },

  getRecordsByType: async (): Promise<Record<string, number>> => {
    const result = await query(
      'SELECT record_type, COUNT(*) as count FROM medical_records GROUP BY record_type'
    );
    return result.rows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.record_type] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);
  },

  getUpcomingVaccines: async (): Promise<Array<any>> => {
    const result = await query(
      `SELECT mr.*, p.name as pet_name, p.animal_type 
       FROM medical_records mr
       JOIN pets p ON mr.pet_id = p.id
       WHERE mr.record_type = 'vaccine' 
       AND mr.date >= CURRENT_DATE - INTERVAL '30 days'
       AND mr.date <= CURRENT_DATE + INTERVAL '30 days'
       ORDER BY mr.date ASC
       LIMIT 10`
    );
    return result.rows;
  },

  getRecentRecords: async (): Promise<Array<any>> => {
    const result = await query(
      `SELECT mr.*, p.name as pet_name, p.animal_type 
       FROM medical_records mr
       JOIN pets p ON mr.pet_id = p.id
       ORDER BY mr.created_at DESC
       LIMIT 10`
    );
    return result.rows;
  },

  getAllStats: async (): Promise<DashboardStats> => {
    const [
      totalPets,
      petsByType,
      totalRecords,
      recordsByType,
      upcomingVaccines,
      recentRecords,
    ] = await Promise.all([
      dashboardQueries.getTotalPets(),
      dashboardQueries.getPetsByType(),
      dashboardQueries.getTotalRecords(),
      dashboardQueries.getRecordsByType(),
      dashboardQueries.getUpcomingVaccines(),
      dashboardQueries.getRecentRecords(),
    ]);

    return {
      totalPets,
      petsByType,
      totalRecords,
      recordsByType,
      upcomingVaccines,
      recentRecords,
    };
  },
};

