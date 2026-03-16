// ============================================================
// Database Types
// ============================================================

export type ServiceType = 'pet_sitting' | 'house_cleaning' | 'both';
export type UserRole = 'owner' | 'helper';
export type CleaningFrequency = 'weekly' | 'biweekly' | 'monthly' | 'as_needed';
export type OutdoorIndoor = 'indoor' | 'outdoor' | 'both';
export type PaymentStatus = 'unpaid' | 'paid' | 'pending';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  client_id: string;
  name: string;
  species: string | null;
  breed: string | null;
  age: string | null;
  color_markings: string | null;
  feeding_instructions: string | null;
  medications: string | null;
  behavioral_notes: string | null;
  outdoor_indoor: OutdoorIndoor | null;
  walk_instructions: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  vet_address: string | null;
  emergency_vet_name: string | null;
  emergency_vet_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  service_type: ServiceType;
  access_code: string | null;
  key_location: string | null;
  gate_code: string | null;
  alarm_code: string | null;
  parking_instructions: string | null;
  home_size: string | null;
  num_bedrooms: number | null;
  num_bathrooms: number | null;
  cleaning_frequency: CleaningFrequency | null;
  cleaning_products_preference: string | null;
  cleaning_products_location: string | null;
  fragile_items_notes: string | null;
  cleaning_special_instructions: string | null;
  payment_notes: string | null;
  notes: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  pets?: Pet[];
}

export interface Appointment {
  id: string;
  owner_id: string;
  client_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  service_type: 'pet_sitting' | 'house_cleaning' | null;
  notes: string | null;
  payment_status: PaymentStatus;
  payment_notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Pick<Client, 'id' | 'first_name' | 'last_name' | 'service_type'>;
}

// ============================================================
// Form Types
// ============================================================

export interface PetFormData {
  id?: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  color_markings: string;
  feeding_instructions: string;
  medications: string;
  behavioral_notes: string;
  outdoor_indoor: string;
  walk_instructions: string;
  vet_name: string;
  vet_phone: string;
  vet_address: string;
  emergency_vet_name: string;
  emergency_vet_phone: string;
}

export interface ClientFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  service_type: ServiceType;
  access_code: string;
  key_location: string;
  gate_code: string;
  alarm_code: string;
  parking_instructions: string;
  // House cleaning
  home_size: string;
  num_bedrooms: string;
  num_bathrooms: string;
  cleaning_frequency: string;
  cleaning_products_preference: string;
  cleaning_products_location: string;
  fragile_items_notes: string;
  cleaning_special_instructions: string;
  // Payment & notes
  payment_notes: string;
  notes: string;
  // Pets (managed separately)
  pets: PetFormData[];
}

export interface AppointmentFormData {
  title: string;
  client_id: string;
  start_time: string;
  end_time: string;
  service_type: string;
  notes: string;
  payment_status: PaymentStatus;
  payment_notes: string;
}
