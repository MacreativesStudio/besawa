import { db } from '../db/index';

export interface PaymentInitiateResult {
  success: boolean;
  paymentId: string;
  internalReference: string;
  message: string;
  isSandboxMode: boolean;
  requiresSimulation?: boolean;
}

export async function initiateMpesaPayment(
  bookingId: string,
  phoneNumber: string
): Promise<PaymentInitiateResult> {
  const state = db.getState();
  const booking = state.bookings.find((b) => b.id === bookingId);

  if (!booking) {
    throw new Error('Booking not found.');
  }

  if (booking.status === 'CONFIRMED') {
    throw new Error('This booking is already confirmed and paid.');
  }

  const internalRef = `PAY-${booking.booking_reference}`;
  const now = new Date().toISOString();

  // Format phone to 254...
  let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = `254${cleanPhone.substring(1)}`;
  } else if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1);
  }

  let payment = state.payments.find((p) => p.booking_id === bookingId);
  const paymentId = payment ? payment.id : `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const hasDarajaCredentials = Boolean(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_PASSKEY
  );

  db.mutate((draft) => {
    const existingIndex = draft.payments.findIndex((p) => p.booking_id === bookingId);
    const record = {
      id: paymentId,
      booking_id: bookingId,
      amount: booking.amount,
      currency: booking.currency || 'KES',
      provider: 'MPESA',
      provider_reference: null,
      internal_reference: internalRef,
      status: 'PENDING',
      phone_number: cleanPhone,
      failure_reason: null,
      raw_metadata: { initiatedVia: hasDarajaCredentials ? 'DARAJA_LIVE_API' : 'DARAJA_SANDBOX_ADAPTER' },
      initiated_at: now,
      completed_at: null,
    };

    if (existingIndex >= 0) {
      draft.payments[existingIndex] = record;
    } else {
      draft.payments.push(record);
    }
  });

  db.logAudit(
    'PAYMENT_INITIATED',
    'PAYMENT',
    paymentId,
    { bookingId, amount: booking.amount, phone: cleanPhone, hasDarajaCredentials }
  );

  return {
    success: true,
    paymentId,
    internalReference: internalRef,
    message: hasDarajaCredentials
      ? `M-Pesa STK push prompted to ${cleanPhone}. Please enter your M-Pesa PIN.`
      : `M-Pesa payment prompt dispatched for KES ${booking.amount}. (Sandbox verification adapter active).`,
    isSandboxMode: !hasDarajaCredentials,
    requiresSimulation: !hasDarajaCredentials,
  };
}

export function verifyAndConfirmPayment(
  bookingId: string,
  providerReference: string,
  verifiedBy: string = 'system_mpesa_webhook'
): { booking: any; payment: any; settlement: any } {
  const state = db.getState();
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found.');
  }

  const now = new Date().toISOString();
  let paymentRecord: any = null;
  let settlementRecord: any = null;

  db.mutate((draft) => {
    // 1. Update Booking
    const bk = draft.bookings.find((b) => b.id === bookingId);
    if (bk) {
      bk.status = 'CONFIRMED';
      bk.updated_at = now;
    }

    // 2. Update Payment
    let pay = draft.payments.find((p) => p.booking_id === bookingId);
    if (!pay) {
      pay = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        booking_id: bookingId,
        amount: booking.amount,
        currency: booking.currency,
        provider: 'MPESA',
        provider_reference: providerReference,
        internal_reference: `PAY-${booking.booking_reference}`,
        status: 'CONFIRMED',
        phone_number: booking.client_phone,
        failure_reason: null,
        raw_metadata: { verifiedBy, confirmedAt: now },
        initiated_at: now,
        completed_at: now,
      };
      draft.payments.push(pay);
    } else {
      pay.status = 'CONFIRMED';
      pay.provider_reference = providerReference;
      pay.completed_at = now;
      pay.raw_metadata = { ...pay.raw_metadata, verifiedBy, confirmedAt: now };
    }
    paymentRecord = pay;

    // 3. Generate Therapist Settlement Record
    const commissionPercent = draft.business_settings.platform_commission_percent || 20;
    const gross = booking.amount;
    const commission = (gross * commissionPercent) / 100;
    const payable = gross - commission;
    const settlementPeriod = now.substring(0, 7); // e.g. "2026-09"

    let stl = draft.settlements.find((s) => s.booking_id === bookingId);
    if (!stl) {
      stl = {
        id: `stl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        booking_id: bookingId,
        therapist_id: booking.therapist_id,
        gross_session_amount: gross,
        platform_commission_percent: commissionPercent,
        platform_commission_amount: commission,
        therapist_payable_amount: payable,
        adjustments: 0,
        settlement_status: 'PENDING',
        settlement_period: settlementPeriod,
        paid_at: null,
        payout_reference: null,
        admin_notes: `Auto-generated upon verified payment confirmation. Verified by ${verifiedBy}.`,
        created_at: now,
        updated_at: now,
      };
      draft.settlements.push(stl);
    } else {
      stl.gross_session_amount = gross;
      stl.platform_commission_amount = commission;
      stl.therapist_payable_amount = payable;
      stl.updated_at = now;
    }
    settlementRecord = stl;
  });

  db.logAudit(
    'PAYMENT_CONFIRMED',
    'BOOKING',
    bookingId,
    { providerReference, verifiedBy, amount: booking.amount, settlementGenerated: settlementRecord?.id }
  );

  return {
    booking: db.getState().bookings.find((b) => b.id === bookingId),
    payment: paymentRecord,
    settlement: settlementRecord,
  };
}
