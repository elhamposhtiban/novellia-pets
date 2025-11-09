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

