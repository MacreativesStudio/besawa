import {
  Service,
  ServiceCategory,
  Package,
  PublicTherapist,
  FullTherapist,
  AvailabilitySlot,
  Booking,
  User,
  DashboardMetrics,
  Settlement,
  AuditLog,
  FAQ,
  Testimonial,
  ContactMessage,
  ClientProfile,
  AnalyticsData,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('besawa_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Public Catalog
  getServices: () => request<{ categories: ServiceCategory[]; services: Service[] }>('/services'),
  getPackages: () => request<{ packages: Package[] }>('/packages'),
  getPublicTherapists: () => request<{ therapists: PublicTherapist[] }>('/therapists/public'),
  getSlots: (therapistId: string, serviceId: string, date: string) =>
    request<{ slots: AvailabilitySlot[] }>(
      `/availability/slots?therapistId=${encodeURIComponent(therapistId)}&serviceId=${encodeURIComponent(
        serviceId
      )}&date=${encodeURIComponent(date)}`
    ),

  // Booking & Lookup
  createBooking: (payload: {
    service_id: string;
    therapist_id: string;
    date: string;
    time: string;
    delivery_mode: 'ONLINE' | 'IN_PERSON';
    client_name: string;
    client_phone: string;
    client_email?: string;
    client_notes?: string;
  }) => request<{ success: boolean; booking: Booking; whatsappUrl: string }>('/bookings', { method: 'POST', body: JSON.stringify(payload) }),

  lookupBooking: (reference: string, contact: string) =>
    request<{ booking: Booking }>(
      `/bookings/lookup?reference=${encodeURIComponent(reference)}&contact=${encodeURIComponent(contact)}`
    ),

  // Payments
  initiateMpesaStk: (bookingId: string, phoneNumber: string) =>
    request<{
      success: boolean;
      paymentId: string;
      internalReference: string;
      message: string;
      isSandboxMode: boolean;
      requiresSimulation?: boolean;
    }>('/payments/mpesa/stk-push', {
      method: 'POST',
      body: JSON.stringify({ bookingId, phoneNumber }),
    }),

  verifyMpesaTest: (bookingId: string, transactionReference?: string) =>
    request<{ success: boolean; message: string; result: any }>('/payments/verify-test', {
      method: 'POST',
      body: JSON.stringify({ bookingId, transactionReference }),
    }),

  getPaymentStatus: (bookingId: string) => request<{ booking_status: string; payment: any }>(`/payments/status/${bookingId}`),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  getWhatsAppLink: (bookingId: string) =>
    request<{ bookingReference: string; messageText: string; whatsappUrl: string }>(
      `/bookings/${encodeURIComponent(bookingId)}/whatsapp-link`
    ),

  // Admin Management
  getAdminMetrics: () => request<DashboardMetrics>('/admin/metrics'),
  getAdminBookings: () => request<{ bookings: Booking[] }>('/admin/bookings'),
  createAdminBooking: (payload: any) =>
    request<{ success: boolean; booking: Booking; message: string }>('/admin/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAdminBooking: (id: string, updates: any) =>
    request<{ success: boolean; booking: Booking; message: string }>(`/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteAdminBooking: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  updateBookingStatus: (id: string, status: string, cancellation_reason?: string) =>
    request<{ success: boolean; status: string }>(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancellation_reason }),
    }),

  getAdminServices: () =>
    request<{ categories: ServiceCategory[]; services: (Service & { assigned_therapist_count?: number })[] }>(
      '/admin/services'
    ),
  createService: (payload: any) =>
    request<{ success: boolean; serviceId: string }>('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateService: (id: string, updates: any) =>
    request<{ success: boolean }>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteService: (id: string) =>
    request<{ success: boolean; message?: string }>(`/services/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getAdminPackages: () => request<{ packages: Package[] }>('/admin/packages'),
  createPackage: (payload: any) =>
    request<{ success: boolean; packageId: string }>('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePackage: (id: string, updates: any) =>
    request<{ success: boolean }>(`/admin/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deletePackage: (id: string) =>
    request<{ success: boolean; message?: string }>(`/admin/packages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getAdminTherapists: () => request<{ therapists: FullTherapist[] }>('/admin/therapists'),
  createAdminTherapist: (payload: any) =>
    request<{ success: boolean; therapistId: string }>('/admin/therapists', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAdminTherapist: (id: string, updates: any) =>
    request<{ success: boolean }>(`/admin/therapists/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteAdminTherapist: (id: string) =>
    request<{ success: boolean; message?: string }>(`/admin/therapists/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  updateTherapistVerification: (id: string, verification_status: string, notes?: string) =>
    request<{ success: boolean; verification_status: string }>(`/admin/therapists/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ verification_status, notes }),
    }),

  getAdminSettlements: () => request<{ settlements: Settlement[] }>('/admin/settlements'),
  updateSettlementStatus: (id: string, settlement_status: string, payout_reference?: string, admin_notes?: string) =>
    request<{ success: boolean; settlement_status: string }>(`/admin/settlements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ settlement_status, payout_reference, admin_notes }),
    }),

  getAdminSettings: () => request<{ settings: any }>('/admin/settings'),
  updateAdminSettings: (settings: any) =>
    request<{ success: boolean; settings: any }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getAdminAuditLogs: () => request<{ logs: AuditLog[] }>('/admin/audit-logs'),
  getAuditLogs: () => request<{ logs: AuditLog[] }>('/admin/audit-logs'),

  // Client Intelligence & Analytics
  getAdminClients: () => request<{ clients: ClientProfile[] }>('/admin/clients'),
  getAdminClientProfile: (phone: string) =>
    request<{ profile: ClientProfile }>(`/admin/clients/${encodeURIComponent(phone)}`),
  updateClientCareNotes: (phone: string, care_notes: string) =>
    request<{ success: boolean; message: string }>(`/admin/clients/${encodeURIComponent(phone)}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ care_notes }),
    }),
  getAdminAnalytics: () => request<AnalyticsData>('/admin/analytics'),

  // Content & CMS Management (Public & Admin CRUD)
  getFaqs: () => request<{ faqs: FAQ[] }>('/content/faqs'),
  getAdminFaqs: () => request<{ faqs: FAQ[] }>('/admin/faqs'),
  createFaq: (payload: Partial<FAQ>) =>
    request<{ success: boolean; faqId: string }>('/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateFaq: (id: string, updates: Partial<FAQ>) =>
    request<{ success: boolean }>(`/admin/faqs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteFaq: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/faqs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getTestimonials: () => request<{ testimonials: Testimonial[] }>('/content/testimonials'),
  getAdminTestimonials: () => request<{ testimonials: Testimonial[] }>('/admin/testimonials'),
  createTestimonial: (payload: Partial<Testimonial>) =>
    request<{ success: boolean; testimonialId: string }>('/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTestimonial: (id: string, updates: Partial<Testimonial>) =>
    request<{ success: boolean }>(`/admin/testimonials/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteTestimonial: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/testimonials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  submitContact: (payload: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    request<{ success: boolean; message: string }>('/content/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdminContactMessages: () => request<{ messages: ContactMessage[] }>('/admin/contact-messages'),
  updateContactMessageStatus: (id: string, is_resolved: boolean) =>
    request<{ success: boolean }>(`/admin/contact-messages/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_resolved }),
    }),
  deleteContactMessage: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/contact-messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};
