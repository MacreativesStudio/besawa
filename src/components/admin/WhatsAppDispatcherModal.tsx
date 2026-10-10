import React, { useState, useMemo } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  Send,
  Video,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { Booking } from '../../types';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface WhatsAppDispatcherModalProps {
  booking: Booking;
  onClose: () => void;
}

type TemplateId = 'CONFIRMATION' | 'GOOGLE_MEET' | 'KILIMANI_DIRECTIONS' | 'REMINDER_24H' | 'AFTERCARE_FOLLOWUP';

export const WhatsAppDispatcherModal: React.FC<WhatsAppDispatcherModalProps> = ({
  booking,
  onClose,
}) => {
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    booking.delivery_mode === 'ONLINE' ? 'GOOGLE_MEET' : 'CONFIRMATION'
  );

  const formattedPhone = useMemo(() => {
    const raw = String(booking.client_phone || '').replace(/[^0-9]/g, '');
    if (raw.startsWith('0')) return `254${raw.slice(1)}`;
    if (raw.startsWith('254')) return raw;
    return `254${raw}`;
  }, [booking.client_phone]);

  // Dynamic template text generation
  const generatedText = useMemo(() => {
    const clientFirstName = booking.client_name.split(' ')[0] || booking.client_name;
    const therapistName = booking.therapist_name || 'your assigned therapist';
    const date = booking.date;
    const time = booking.time;
    const ref = booking.booking_reference;
    const isOnline = booking.delivery_mode === 'ONLINE';

    switch (selectedTemplate) {
      case 'CONFIRMATION':
        return (
          `🌿 *BE SAWA • Session Confirmation*\n\n` +
          `Hello ${clientFirstName},\n\n` +
          `Your mental wellness appointment has been confirmed with *${therapistName}*.\n\n` +
          `📅 *Date:* ${date}\n` +
          `⏰ *Time:* ${time} (EAT)\n` +
          `📍 *Format:* ${isOnline ? 'Google Meet Encrypted Telehealth' : 'Kilimani Consultation Rooms, Nairobi'}\n` +
          `🔖 *Reference:* ${ref}\n\n` +
          `Your comfort, emotional safety, and absolute confidentiality are our sacred priority.\n` +
          `If you have any questions before your session, simply reply to this message.\n\n` +
          `With warmth,\n` +
          `*Be Sawa Care Team*\n` +
          `https://besawa.ke`
        );

      case 'GOOGLE_MEET':
        return (
          `🌿 *BE SAWA • Telehealth Video Session Link*\n\n` +
          `Hello ${clientFirstName},\n\n` +
          `Here are your secure telehealth details for your upcoming session with *${therapistName}* on *${date} at ${time} EAT*:\n\n` +
          `📹 *Google Meet Room Link:* https://meet.google.com/bs-${ref.toLowerCase().replace(/[^a-z0-9]/g, '')}\n` +
          `🔖 *Booking Reference:* ${ref}\n\n` +
          `💡 *Tips for a peaceful session:*\n` +
          `1. Find a quiet, private room where you feel entirely unhurried.\n` +
          `2. Use earphones or headphones for optimum acoustic privacy.\n` +
          `3. Join the link 3–5 minutes ahead of time to settle in gently.\n\n` +
          `We look forward to holding space for you.\n\n` +
          `*Be Sawa Care Team*`
        );

      case 'KILIMANI_DIRECTIONS':
        return (
          `🌿 *BE SAWA • Kilimani Sanctuary Arrival Guide*\n\n` +
          `Hello ${clientFirstName},\n\n` +
          `We look forward to welcoming you for your in-person session with *${therapistName}* on *${date} at ${time} EAT*.\n\n` +
          `📍 *Location:* Kilimani Consultation Rooms, Off Argwings Kodhek Road, Nairobi\n` +
          `🚗 *Parking:* Secure dedicated private parking is available inside the compound.\n` +
          `☕ *Reception:* Arrive 5–10 minutes prior to relax in our quiet, serene waiting lounge with herbal tea.\n` +
          `🔖 *Reference:* ${ref}\n\n` +
          `If you need directions upon arrival, our concierge is on call at *0710 759 422*.\n\n` +
          `Warmly,\n` +
          `*Be Sawa Care Team*`
        );

      case 'REMINDER_24H':
        return (
          `🌿 *BE SAWA • Session Reminder*\n\n` +
          `Hello ${clientFirstName},\n\n` +
          `This is a gentle reminder that your session with *${therapistName}* is scheduled for tomorrow:\n\n` +
          `📅 *Date:* ${date}\n` +
          `⏰ *Time:* ${time} (EAT)\n` +
          `📍 *Format:* ${isOnline ? 'Online Google Meet' : 'Kilimani Sanctuary'}\n\n` +
          `If you need to reschedule or have any special accommodations, please let us know at least 4 hours ahead so we may adjust the clinical schedule.\n\n` +
          `Take care,\n` +
          `*Be Sawa Care Team*`
        );

      case 'AFTERCARE_FOLLOWUP':
        return (
          `🌿 *BE SAWA • Post-Session Check-in*\n\n` +
          `Hello ${clientFirstName},\n\n` +
          `We hope you are holding gentle space for yourself following your session with *${therapistName}* today.\n\n` +
          `Processing emotional thoughts can take physical and mental energy. Be kind to yourself today, stay hydrated, and take a moment to breathe.\n\n` +
          `When you feel ready to schedule your next appointment, you can book directly online:\n` +
          `👉 https://besawa.ke/book\n\n` +
          `We are honored to walk alongside your journey.\n\n` +
          `Warm regards,\n` +
          `*Be Sawa Care Team*`
        );
    }
  }, [selectedTemplate, booking]);

  const [customText, setCustomText] = useState(generatedText);

  // Update custom text whenever template changes
  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);
    // Timeout to let state compute
    setTimeout(() => {
      // Re-trigger computed text
    }, 0);
  };

  React.useEffect(() => {
    setCustomText(generatedText);
  }, [generatedText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    showToast('WhatsApp dispatch message copied to clipboard.', 'success');
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(customText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp Web / App...', 'success');
  };

  const templatesList: { id: TemplateId; label: string; icon: React.ReactNode }[] = [
    { id: 'CONFIRMATION', label: '1. Session Confirmation', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'GOOGLE_MEET', label: '2. Telehealth Meet Link', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'KILIMANI_DIRECTIONS', label: '3. Kilimani Arrival Guide', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'REMINDER_24H', label: '4. 24-Hour Reminder', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'AFTERCARE_FOLLOWUP', label: '5. Aftercare Follow-Up', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E3DED6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EDE9E1] bg-gradient-to-r from-white via-[#FBF9F5] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F3ED] text-[#286E47] flex items-center justify-center shadow-xs border border-[#286E47]/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1C2420]">
                Care Team WhatsApp Dispatcher
              </h3>
              <p className="text-xs text-[#54635B]">
                Recipient: <strong className="text-[#1C2420]">{booking.client_name}</strong> (+{formattedPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#78867E] hover:text-[#1C2420] hover:bg-[#F4EFEA] rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="p-4 bg-[#FBF9F5] border-b border-[#EDE9E1] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            {templatesList.map((tmpl) => {
              const isActive = selectedTemplate === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#2D5A46] text-white shadow-xs'
                      : 'bg-white text-[#54635B] hover:text-[#1C2420] border border-[#E3DED6]'
                  }`}
                >
                  {tmpl.icon}
                  <span>{tmpl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Editor & Live Preview */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-[#1C2420] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C89D57]" />
                <span>Message Text (Editable before sending)</span>
              </label>
              <span className="text-[10px] text-[#78867E]">
                {customText.length} characters
              </span>
            </div>
            <textarea
              rows={11}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-2xl p-4 text-xs font-sans text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-[#EDE9E1] bg-[#FBF9F5] flex flex-wrap items-center justify-between gap-3 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Copy Text
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenWhatsApp}
              leftIcon={<Send className="w-3.5 h-3.5 text-white" />}
              className="bg-[#286E47] hover:bg-[#1E5636]"
            >
              Open in WhatsApp (+{formattedPhone})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
