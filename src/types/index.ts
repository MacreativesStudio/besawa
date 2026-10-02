export type RoleName =
  | 'BUSINESS_OWNER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'THERAPIST'
  | 'CLIENT';

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_CONFIRMATION'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_CONFIRMED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';

export type SettlementStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'ON_HOLD' | 'CANCELLED';

export type VerificationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'VERIFIED'
  | 'SUSPENDED'
  | 'INACTIVE'
  | 'REJECTED';

export type DeliveryMode = 'ONLINE' | 'IN_PERSON' | 'BOTH';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
}

export interface Service {
  id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price: number;
  currency: string;
  delivery_mode: DeliveryMode;
  is_active: boolean;
  booking_instructions?: string;
  min_age?: number;
  max_age?: number | null;
}

export interface TherapistCredentialSummary {
  document_type: string;
  issuing_authority: string;
}

export interface PublicTherapist {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  years_experience: number;
  languages: string[];
  areas_of_practice: string[];
  profile_photo_url?: string;
  verification_status: VerificationStatus;
  supports_online: boolean;
  supports_in_person: boolean;
  supported_services: { id: string; name: string; price: number }[];
  credential_summary: TherapistCredentialSummary[];
}

export interface FullTherapist extends PublicTherapist {
  user_id?: string | null;
  service_ids: string[];
  credentials: any[];
  session_rate_override?: number | null;
  internal_admin_notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  number_of_sessions: number;
  price: number;
  currency: string;
  validity_days: number;
  is_active: boolean;
}

export interface AvailabilitySlot {
  time: string;
  formattedTime: string;
  available: boolean;
  reason?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  service_id: string;
  service_name?: string;
  therapist_id: string;
  therapist_name?: string;
  therapist_title?: string;
  date: string;
  time: string;
  duration_minutes: number;
  amount: number;
  currency: string;
  delivery_mode: 'ONLINE' | 'IN_PERSON';
  client_name: string;
  client_phone: string;
  client_email: string;
  client_notes?: string;
  status: BookingStatus;
  payment_status?: PaymentStatus;
  payment_reference?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  payment?: Payment;
  settlement?: Settlement;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_reference?: string | null;
  internal_reference: string;
  status: PaymentStatus;
  phone_number?: string;
  failure_reason?: string | null;
  initiated_at: string;
  completed_at?: string | null;
}

export interface Settlement {
  id: string;
  booking_id: string;
  therapist_id: string;
  therapist_name?: string;
  client_name?: string;
  session_date?: string;
  service_name?: string;
  gross_session_amount: number;
  platform_commission_percent: number;
  platform_commission_amount: number;
  therapist_payable_amount: number;
  adjustments: number;
  settlement_status: SettlementStatus;
  settlement_period: string;
  paid_at?: string | null;
  payout_reference?: string | null;
  admin_notes?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: RoleName[];
  therapist_id?: string | null;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  id: string;
  client_alias: string;
  quote: string;
  session_category?: string;
  is_verified: boolean;
}

export interface DashboardMetrics {
  todaySessions: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedSessions: number;
  grossRevenue: number;
  platformRetainedRevenue: number;
  therapistPayableTotal: number;
  outstandingSettlements: number;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
