import { db } from '../db/index';

export interface SlotResult {
  time: string; // '09:00'
  formattedTime: string; // '09:00 AM'
  available: boolean;
  reason?: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTimeAMPM(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  let hour = parseInt(hStr, 10);
  const minute = mStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export function calculateTherapistSlots(
  therapistId: string,
  serviceId: string,
  dateStr: string
): SlotResult[] {
  const state = db.getState();

  const therapist = state.therapists.find((t) => t.id === therapistId && t.is_active);
  if (!therapist) {
    return [];
  }

  const service = state.services.find((s) => s.id === serviceId && s.is_active);
  const duration = service ? service.duration_minutes : 50;

  // Check exceptions first
  const exception = state.availability_exceptions.find(
    (e) => e.therapist_id === therapistId && e.exception_date === dateStr
  );
  if (exception && !exception.is_available) {
    return [];
  }

  // Determine Day of Week
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const dayName = DAY_NAMES[targetDate.getDay()];

  // Find active availability rule or standard sanctuary hours (Mon-Sat 09:00 - 17:00)
  const rule = state.availability_rules.find(
    (r) => r.therapist_id === therapistId && r.day_of_week === dayName && r.is_active
  );

  let startTimeStr = '09:00';
  let endTimeStr = '17:00';
  let slotDuration = duration || 50;
  let breakDuration = 10;

  if (rule) {
    startTimeStr = rule.start_time;
    endTimeStr = rule.end_time;
    slotDuration = rule.slot_duration_minutes || 50;
    breakDuration = rule.break_duration_minutes || 10;
  } else if (dayName === 'Sunday') {
    return []; // Sanctuary rest day
  }

  // Generate slots from start_time to end_time
  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const interval = slotDuration + breakDuration;

  const generatedSlots: string[] = [];
  for (let current = startMinutes; current + duration <= endMinutes; current += interval) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    generatedSlots.push(`${h}:${m}`);
  }

  // Get existing bookings for this therapist on this date
  const existingBookings = state.bookings.filter(
    (b) =>
      b.therapist_id === therapistId &&
      b.date === dateStr &&
      !['CANCELLED', 'REFUNDED', 'PAYMENT_FAILED'].includes(b.status)
  );

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes();

  return generatedSlots.map((slot) => {
    const [slotH, slotM] = slot.split(':').map(Number);
    const slotMin = slotH * 60 + slotM;

    // Check if slot is in the past
    if (dateStr < todayStr || (dateStr === todayStr && slotMin <= currentMinutesToday + 30)) {
      return {
        time: slot,
        formattedTime: formatTimeAMPM(slot),
        available: false,
        reason: 'Past time',
      };
    }

    // Check conflict with existing booking
    const hasConflict = existingBookings.some((b) => {
      const [bH, bM] = b.time.split(':').map(Number);
      const bMin = bH * 60 + bM;
      const bEnd = bMin + (b.duration_minutes || 50);
      const slotEnd = slotMin + duration;
      // Overlap condition: slot starts before bEnd and slot ends after bMin
      return slotMin < bEnd && slotEnd > bMin;
    });

    if (hasConflict) {
      return {
        time: slot,
        formattedTime: formatTimeAMPM(slot),
        available: false,
        reason: 'Reserved',
      };
    }

    return {
      time: slot,
      formattedTime: formatTimeAMPM(slot),
      available: true,
    };
  });
}
