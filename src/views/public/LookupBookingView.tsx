import React, { useState } from 'react';
import { Search, Calendar, Clock, Video, MapPin, User, ShieldCheck, CreditCard, MessageCircle, AlertCircle } from 'lucide-react';
import { api } from '../../api';
import { Booking } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

interface LookupBookingViewProps {
  navigate: (path: string) => void;
}

export const LookupBookingView: React.FC<LookupBookingViewProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !contact.trim()) {
      showToast('Please enter both your Booking Reference and Phone or Email.', 'error');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      const res = await api.lookupBooking(reference.trim(), contact.trim());
      setBooking(res.booking);
    } catch (err: any) {
      setBooking(null);
      showToast(err.message || 'No booking found matching those details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full mb-3">
          <Search className="w-3.5 h-3.5 text-[#2D5A46]" />
          Appointment Verification &amp; Lookup
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
          Lookup Your Session Booking
        </h1>
        <p className="text-base text-[#54635B] mt-3">
          Enter your 8-digit Be Sawa booking reference along with the phone number or email you provided during booking.
        </p>
      </div>

      {/* Lookup Card Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED6] shadow-sm mb-10">
        <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
              Booking Reference *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BS-48291"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm font-semibold uppercase text-[#1C2420] placeholder-[#78867E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
              Your Phone Number or Email *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 0712345678 or email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] placeholder-[#78867E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full py-2.5"
            >
              Lookup
            </Button>
          </div>
        </form>
      </div>

      {/* Lookup Result Card */}
      {booking && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2D5A46] shadow-md space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EDE9E1]">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#78867E]">
                Booking Reference
              </div>
              <div className="text-2xl font-black text-[#2D5A46] tracking-wide">
                {booking.booking_reference}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={booking.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[#78867E]">Service</span>
                <div className="text-base font-bold text-[#1C2420]">{booking.service_name}</div>
              </div>

              <div>
                <span className="text-xs text-[#78867E]">Assigned Therapist</span>
                <div className="text-base font-bold text-[#1C2420]">{booking.therapist_name}</div>
                <div className="text-xs text-[#54635B]">{booking.therapist_title}</div>
              </div>

              <div>
                <span className="text-xs text-[#78867E]">Session Format</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1C2420]">
                  {booking.delivery_mode === 'ONLINE' ? (
                    <>
                      <Video className="w-4 h-4 text-[#2D5A46]" /> Online Encrypted Telehealth
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-[#9E5D43]" /> In-Person (Kilimani, Nairobi)
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-[#78867E]">Date & Time</span>
                <div className="flex items-center gap-1.5 text-base font-bold text-[#1C2420]">
                  <Calendar className="w-4 h-4 text-[#2D5A46]" />
                  {booking.date} at {booking.time} ({booking.duration_minutes} mins)
                </div>
              </div>

              <div>
                <span className="text-xs text-[#78867E]">Payment & Receipt</span>
                <div className="text-sm font-bold text-[#1C2420]">
                  {booking.currency} {booking.amount?.toLocaleString()} (M-Pesa)
                </div>
                <div className="text-xs text-[#54635B] mt-0.5">
                  Receipt:{' '}
                  <span className="font-mono font-semibold text-[#2D5A46]">
                    {booking.payment_reference || 'Pending verification'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-[#78867E]">Client Name & Contact</span>
                <div className="text-sm font-medium text-[#1C2420]">{booking.client_name}</div>
                <div className="text-xs text-[#54635B]">{booking.client_phone} • {booking.client_email}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#F4EFEA] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#54635B]">
            <span>Need to reschedule or have questions about this appointment?</span>
            <a
              href={`https://wa.me/254710759422?text=${encodeURIComponent(
                `Hello Be Sawa Care Team, I would like to inquire about my booking reference ${booking.booking_reference} for ${booking.service_name} on ${booking.date} at ${booking.time}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[#2D5A46] hover:underline"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
              <span>Inquire / Reschedule on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {searched && !isLoading && !booking && (
        <div className="bg-white rounded-3xl p-8 border border-[#E3DED6] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#9E6B1F] mx-auto" />
          <h4 className="text-base font-bold text-[#1C2420]">No Booking Record Found</h4>
          <p className="text-xs text-[#54635B] max-w-md mx-auto">
            Please double-check the booking reference format (e.g. BS-48291) and the phone or email you used when booking.
          </p>
        </div>
      )}
    </div>
  );
};
