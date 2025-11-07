export interface Pet {
  id: number;
  name: string;
  animal_type: string;
  owner_name: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: number;
  pet_id: number;
  record_type: 'vaccine' | 'allergy';
  name: string;
  date?: string;
  reactions?: string;
  severity?: 'mild' | 'severe';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalPets: number;
  petsByType: Record<string, number>;
  totalRecords: number;
  recordsByType: Record<string, number>;
  upcomingVaccines: Array<MedicalRecord & { pet_name: string; animal_type: string }>;
  recentRecords: Array<MedicalRecord & { pet_name: string; animal_type: string }>;
}

export interface CreatePetData {
  name: string;
  animal_type: string;
  owner_name: string;
  date_of_birth: string;
}

export interface UpdatePetData {
  name?: string;
  animal_type?: string;
  owner_name?: string;
  date_of_birth?: string;
}

export interface CreateRecordData {
  record_type: 'vaccine' | 'allergy';
  name: string;
  date?: string;
  reactions?: string;
  severity?: 'mild' | 'severe';
}

export interface UpdateRecordData {
  record_type?: 'vaccine' | 'allergy';
  name?: string;
  date?: string;
  reactions?: string;
  severity?: 'mild' | 'severe';
}

