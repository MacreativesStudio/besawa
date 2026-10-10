import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  MessageCircle,
  User,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Filter,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Booking } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

interface TodayAgendaProps {
  bookings: Booking[];
  onViewClient: (phone: string, name: string) => void;
  onDispatchWhatsApp: (booking: Booking) => void;
  onUpdateStatus?: (bookingId: string, status: string) => void;
}

export const TodayAgenda: React.FC<TodayAgendaProps> = ({
  bookings,
  onViewClient,
  onDispatchWhatsApp,
  onUpdateStatus,
}) => {
  // Kenya EAT local today date string (YYYY-MM-DD)
  const todayDateStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());
  }, []);

  const tomorrowDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [deliveryFilter, setDeliveryFilter] = useState<'ALL' | 'ONLINE' | 'IN_PERSON'>('ALL');

  // Filter bookings for the selected date
  const dayBookings = useMemo(() => {
    return bookings
      .filter((b) => b.date === selectedDate)
      .filter((b) => (deliveryFilter === 'ALL' ? true : b.delivery_mode === deliveryFilter))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, selectedDate, deliveryFilter]);

  // Daily statistics
  const stats = useMemo(() => {
    const allForDate = bookings.filter((b) => b.date === selectedDate);
    const confirmed = allForDate.filter((b) => b.status === 'CONFIRMED').length;
    const pending = allForDate.filter(
      (b) => b.status === 'PENDING_CONFIRMATION' || b.status === 'PENDING_PAYMENT'
    ).length;
    const completed = allForDate.filter((b) => b.status === 'COMPLETED').length;
    const online = allForDate.filter((b) => b.delivery_mode === 'ONLINE').length;
    const inPerson = allForDate.filter((b) => b.delivery_mode === 'IN_PERSON').length;
    const expectedRevenue = allForDate
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

    return { total: allForDate.length, confirmed, pending, completed, online, inPerson, expectedRevenue };
  }, [bookings, selectedDate]);

  const formattedSelectedDate = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj);
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const isToday = selectedDate === todayDateStr;
  const isTomorrow = selectedDate === tomorrowDateStr;

  return (
    <div className="bg-white rounded-3xl border border-[#E3DED6] shadow-xs overflow-hidden">
      {/* Top Banner & Date Controls */}
      <div className="p-5 sm:p-6 border-b border-[#EDE9E1] bg-gradient-to-r from-white via-[#FBF9F5] to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#286E47] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#2D5A46]">
              Clinical Operations Agenda
            </span>
            {isToday && (
              <span className="text-[10px] bg-[#EBF2EE] text-[#2D5A46] font-bold px-2 py-0.5 rounded-full border border-[#2D5A46]/20">
                Today EAT
              </span>
            )}
            {isTomorrow && (
              <span className="text-[10px] bg-[#FAF2E4] text-[#9E6B1F] font-bold px-2 py-0.5 rounded-full border border-[#9E6B1F]/20">
                Tomorrow
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C2420] tracking-tight">
            {formattedSelectedDate}
          </h2>
          <p className="text-xs text-[#54635B] mt-0.5">
            Real-time daily schedule dispatch, client arrival status, and telehealth connectivity.
          </p>
        </div>

        {/* Date Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayDateStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isToday
                ? 'bg-[#2D5A46] text-white shadow-xs'
                : 'bg-[#FBF9F5] text-[#54635B] hover:text-[#1C2420] border border-[#E3DED6]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(tomorrowDateStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isTomorrow
                ? 'bg-[#2D5A46] text-white shadow-xs'
                : 'bg-[#FBF9F5] text-[#54635B] hover:text-[#1C2420] border border-[#E3DED6]'
            }`}
          >
            Tomorrow
          </button>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* KPI Micro-strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-4 sm:p-5 bg-[#FBF9F5]/70 border-b border-[#EDE9E1] text-xs">
        <div className="bg-white p-3 rounded-2xl border border-[#EDE9E1] shadow-xs">
          <div className="text-[10px] text-[#78867E] uppercase font-bold">Total Sessions</div>
          <div className="text-lg font-black text-[#1C2420] mt-0.5">{stats.total}</div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#EDE9E1] shadow-xs">
          <div className="text-[10px] text-[#286E47] uppercase font-bold">Confirmed</div>
          <div className="text-lg font-black text-[#286E47] mt-0.5">{stats.confirmed}</div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#EDE9E1] shadow-xs">
          <div className="text-[10px] text-[#9E6B1F] uppercase font-bold">Needs Action</div>
          <div className="text-lg font-black text-[#9E6B1F] mt-0.5">{stats.pending}</div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#EDE9E1] shadow-xs">
          <div className="text-[10px] text-[#2D5A46] uppercase font-bold">Online Video</div>
          <div className="text-lg font-black text-[#2D5A46] mt-0.5">{stats.online}</div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#EDE9E1] shadow-xs">
          <div className="text-[10px] text-[#9E5D43] uppercase font-bold">Kilimani In-Person</div>
          <div className="text-lg font-black text-[#9E5D43] mt-0.5">{stats.inPerson}</div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#EDE9E1] shadow-xs">
          <div className="text-[10px] text-[#78867E] uppercase font-bold">Day's Yield</div>
          <div className="text-lg font-black text-[#1C2420] mt-0.5">
            KES {stats.expectedRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="px-5 py-3 border-b border-[#EDE9E1] flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#78867E]" />
          <span className="font-semibold text-[#54635B]">Delivery Mode:</span>
          {(['ALL', 'IN_PERSON', 'ONLINE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDeliveryFilter(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                deliveryFilter === mode
                  ? 'bg-[#EBF2EE] text-[#2D5A46] border border-[#2D5A46]/20'
                  : 'text-[#78867E] hover:text-[#1C2420]'
              }`}
            >
              {mode === 'ALL' ? 'All Delivery' : mode === 'IN_PERSON' ? 'Kilimani In-Person' : 'Online Video'}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-[#78867E]">
          Showing <strong>{dayBookings.length}</strong> session{dayBookings.length === 1 ? '' : 's'} on schedule
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="p-4 sm:p-6">
        {dayBookings.length === 0 ? (
          <div className="py-14 text-center bg-[#FBF9F5] rounded-2xl border border-dashed border-[#E3DED6] p-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#78867E] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Calendar className="w-6 h-6 text-[#2D5A46]" />
            </div>
            <h4 className="text-sm font-bold text-[#1C2420]">
              No sessions scheduled for {formattedSelectedDate}
            </h4>
            <p className="text-xs text-[#54635B] mt-1 max-w-sm mx-auto">
              There are no client bookings for this date matching your filter. The Kilimani consultation rooms and online telehealth slots remain open.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayBookings.map((booking) => {
              const isOnline = booking.delivery_mode === 'ONLINE';
              return (
                <div
                  key={booking.id}
                  className="bg-white hover:bg-[#FBF9F5]/70 p-4 sm:p-5 rounded-2xl border border-[#EDE9E1] hover:border-[#2D5A46]/30 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Time & Core Details */}
                  <div className="flex items-start gap-4">
                    {/* Time Badge */}
                    <div className="shrink-0 text-center bg-[#EBF2EE] text-[#2D5A46] p-2.5 rounded-2xl border border-[#2D5A46]/20 min-w-[76px]">
                      <div className="text-sm font-black tracking-tight flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="text-[10px] font-bold text-[#54635B] mt-0.5">
                        {booking.duration_minutes || 50} Mins
                      </div>
                    </div>

                    {/* Client & Service Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onViewClient(booking.client_phone, booking.client_name)}
                          className="text-sm font-black text-[#1C2420] hover:text-[#2D5A46] hover:underline cursor-pointer flex items-center gap-1.5"
                          title="View Client Intelligence Profile"
                        >
                          <User className="w-3.5 h-3.5 text-[#2D5A46]" />
                          <span>{booking.client_name}</span>
                        </button>
                        <span className="text-[10px] font-mono text-[#78867E]">
                          ({booking.booking_reference})
                        </span>
                        <StatusBadge status={booking.status} size="sm" />
                      </div>

                      <div className="text-xs text-[#54635B] flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#1C2420]">
                          {booking.service_name || 'Individual Therapy'}
                        </span>
                        <span>•</span>
                        <span>
                          Therapist:{' '}
                          <strong className="text-[#2D5A46]">
                            {booking.therapist_name || 'Assigned Practitioner'}
                          </strong>
                        </span>
                      </div>

                      {/* Delivery Mode Badge */}
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF2EE] text-[#2D5A46] text-[11px] font-bold">
                            <Video className="w-3 h-3 text-[#2D5A46]" />
                            <span>Google Meet Encrypted Telehealth</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F7EFEA] text-[#9E5D43] text-[11px] font-bold">
                            <MapPin className="w-3 h-3 text-[#9E5D43]" />
                            <span>Kilimani Consultation Sanctuary</span>
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-[#1C2420]">
                          {booking.currency} {booking.amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    {/* Client Intelligence Quick Link */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewClient(booking.client_phone, booking.client_name)}
                      className="text-xs text-[#54635B]"
                      title="View client history and care notes"
                    >
                      Client Profile
                    </Button>

                    {/* WhatsApp Dispatch Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onDispatchWhatsApp(booking)}
                      leftIcon={<MessageCircle className="w-3.5 h-3.5 text-white" />}
                      className="text-xs"
                      title="Dispatch WhatsApp reminder, Meet link, or Kilimani directions"
                    >
                      Care Dispatch
                    </Button>

                    {/* Quick Complete / Confirm Toggle */}
                    {onUpdateStatus && booking.status === 'PENDING_CONFIRMATION' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#286E47]" />}
                        className="text-xs text-[#286E47] bg-[#E8F3ED] hover:bg-[#D4EBDD]"
                      >
                        Confirm
                      </Button>
                    )}
                    {onUpdateStatus && booking.status === 'CONFIRMED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#286E47]" />}
                        className="text-xs text-[#286E47] bg-[#E8F3ED] hover:bg-[#D4EBDD]"
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
