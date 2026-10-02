import React from 'react';
import { Calendar, UserCheck, CreditCard, Video, ShieldCheck, HeartHandshake, Phone } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface HowItWorksViewProps {
  navigate: (path: string) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ navigate }) => {
  const steps = [
    {
      num: '01',
      title: 'Select Your Service & Therapist',
      desc: 'Browse our specialized services (individual therapy, couples counseling, anxiety management) and choose a licensed Kenyan psychologist whose background aligns with your needs.',
      icon: <UserCheck className="w-6 h-6 text-[#2D5A46]" />,
    },
    {
      num: '02',
      title: 'Choose a Real-Time Available Slot',
      desc: 'Pick your preferred date and time. Our system computes actual therapist availability instantly—no double-bookings, no waiting around for email confirmations.',
      icon: <Calendar className="w-6 h-6 text-[#2D5A46]" />,
    },
    {
      num: '03',
      title: 'Share Basic Details Safely',
      desc: 'Provide your name, phone number, and email. In accordance with clinical ethics, we never ask for deep medical diagnosis history on unencrypted web forms.',
      icon: <ShieldCheck className="w-6 h-6 text-[#2D5A46]" />,
    },
    {
      num: '04',
      title: 'Pay Securely via Safaricom M-Pesa',
      desc: 'Enter your M-Pesa phone number to receive an instant STK prompt on your device. Complete payment seamlessly with your secret PIN.',
      icon: <CreditCard className="w-6 h-6 text-[#2D5A46]" />,
    },
    {
      num: '05',
      title: 'Attend Your Confidential Session',
      desc: 'Receive immediate SMS/Email confirmation with your unique booking reference (e.g. BS-48291) and session link (for online sessions) or Kilimani directions (for in-person).',
      icon: <Video className="w-6 h-6 text-[#2D5A46]" />,
    },
  ];

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-16 text-center mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full mb-3">
          Transparent & Simple
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
          How Booking at Be Sawa Works
        </h1>
        <p className="text-base text-[#54635B] mt-3 leading-relaxed">
          Seeking psychological support should never feel complicated or intimidating. We have designed our process to be calm, transparent, and respectful of your time.
        </p>
      </div>

      {/* Steps List */}
      <div className="max-w-4xl mx-auto space-y-6 mb-16">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3DED6] shadow-sm flex flex-col sm:flex-row items-start gap-6 hover:border-[#2D5A46] transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EBF2EE] flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#9E5D43] uppercase tracking-wider">
                  Step {s.num}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1C2420] mb-2">{s.title}</h3>
              <p className="text-sm text-[#54635B] leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Card */}
      <div className="max-w-4xl mx-auto bg-[#F4EFEA] rounded-3xl p-8 sm:p-10 border border-[#E3DED6] text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#2D5A46] text-white flex items-center justify-center mx-auto">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2420]">
          Ready to begin?
        </h2>
        <p className="text-sm text-[#54635B] max-w-lg mx-auto leading-relaxed">
          Book your session today with full confidentiality. No sign-up required for clients—just seamless booking and care.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/book')}
          >
            Start Your Booking
          </Button>
        </div>
      </div>
    </div>
  );
};
