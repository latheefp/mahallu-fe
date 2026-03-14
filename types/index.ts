export interface Family {
  id: number;
  membership_number: string;
  address: string;
  phone: string;
  house_name?: string;
  previous_mahallu?: string;
  membership_date: string;
  number_of_members_in_family?: number;
  male?: number;
  female?: number;
  monthly_income?: number;
  type_of_house?: string;
  do_you_have_vehicle: boolean;
  vehicle_type?: string;
  any_disabled_person: boolean;
  any_patient: boolean;
  user_id: number;
  long_term_illness: boolean;
  long_term_illness_details?: string;
  created: string;
  modified: string;
  year_settled_here?: number;
  bed_patient: boolean;
  family_status_id: number;
  ward_id?: number;
  family_type: 'native' | 'migrated';
  family_head_name: string;
  subscription_amount: number;
  panchayath_ward_id: number;
}

export interface Member {
  id: number;
  family_id: number;
  first_name: string;
  second_name: string;
  gender: 'M' | 'F';
  date_of_birth: string;
  age?: number;
  blood_group?: string;
  education_id?: number;
  occupation?: string;
  marital_status?: string;
  phone?: string;
  email?: string;
  aadhar_number?: string;
  voter_id?: string;
  relation_with_head?: string;
  employment_status?: string;
  monthly_income?: number;
  health_status?: string;
  disabilities?: string;
  created: string;
  modified: string;
}

export interface BirthRegistration {
  id: number;
  family_id: number;
  user_id: number;
  relation_with_headof_family: string;
  name: string;
  date_of_birth: string;
  place_of_birth?: string;
  town_of_birth?: string;
  county_of_birth?: string;
  father_first_name?: string;
  blood_group?: string;
  father_second_name?: string;
  gender: 'M' | 'F';
  member_id?: number;
  created_at: string;
  updated_at: string;
}

export interface MarriageRegistration {
  id: number;
  family_id: number;
  user_id: number;
  groom_name: string;
  bride_name: string;
  marriage_date: string;
  place_of_marriage?: string;
  witness_1_name?: string;
  witness_2_name?: string;
  registration_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: number;
  name: string;
  description?: string;
  created?: string;
  modified?: string;
}

export interface PanchayathWard {
  id: number;
  name: string;
  ward_number?: string;
  created?: string;
  modified?: string;
}

export interface Education {
  id: number;
  name: string;
  created?: string;
  modified?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  group_id: number;
  created?: string;
  modified?: string;
}

export interface DashboardStats {
  total_families: number;
  total_members: number;
  total_male: number;
  total_female: number;
  recent_births: number;
  recent_marriages: number;
  pending_subscriptions: number;
  ward_distribution: Array<{
    ward_id: number;
    ward_name: string;
    family_count: number;
  }>;
}

export interface SubscriptionPayment {
  id: number;
  family_id: number;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference_number?: string;
  receipt_number?: string;
  user_id: number;
  created: string;
  modified: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
