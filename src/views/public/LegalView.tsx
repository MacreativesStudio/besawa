import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft, HeartHandshake, Phone } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  navigate: (path: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, navigate }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="w-full bg-[#FBF9F5] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="mb-8"
        >
          Back to Home
        </Button>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E3DED6] shadow-sm space-y-8">
          <div className="border-b border-[#EDE9E1] pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full">
              {isPrivacy ? <Lock className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              {isPrivacy ? 'Privacy & Data Protection' : 'Terms of Care & Practice Guidelines'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
              {isPrivacy ? 'Client Privacy & Confidentiality Policy' : 'Terms of Therapeutic Care & Service'}
            </h1>
            <p className="text-sm text-[#54635B]">
              Last updated: September 2026 • Compliant with the Kenya Data Protection Act 2019 & ethical codes of counselling practice.
            </p>
          </div>

          {isPrivacy ? (
            <div className="prose prose-slate max-w-none text-[#1C2420] text-sm leading-relaxed space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2D5A46]" />
                  1. Our Sacred Commitment to Confidentiality
                </h2>
                <p>
                  At Be Sawa, we regard your privacy not merely as a regulatory requirement, but as the foundational pillar of compassionate therapy. Everything shared in therapy sessions, intake forms, and pre-session communications is strictly confidential between you and your licensed practitioner.
                </p>
                <p>
                  No clinical notes, disclosures, or therapeutic dialogues are ever sold, rented, or shared with commercial entities, employers, or third parties.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420]">2. Minimal Necessary Information Collected</h2>
                <p>
                  To facilitate appointment scheduling and verified practitioner matching, we collect only minimal administrative contact details:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#54635B]">
                  <li>Full Name / Preferred Alias</li>
                  <li>Direct Phone Number (for WhatsApp/SMS appointment coordination)</li>
                  <li>Email Address (for calendar invites and telehealth session links)</li>
                  <li>Selected Service Category and Delivery Preference (Online or In-Person)</li>
                </ul>
                <p className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EDE9E1] text-xs text-[#2D5A46]">
                  <strong>Privacy Rule:</strong> We never mandate detailed medical histories or intimate clinical notes on web forms. Your clinical narrative belongs inside the therapy room, protected by professional privilege.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420]">3. Statutory Exceptions to Confidentiality</h2>
                <p>
                  In accordance with Kenyan Law and the Counsellors and Psychologists Act, confidentiality is strictly maintained except under rare statutory circumstances where there is:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#54635B]">
                  <li>Clear, imminent danger of severe harm to oneself or another identifiable person</li>
                  <li>Mandated reporting of ongoing child abuse, neglect, or vulnerable adult endangerment</li>
                  <li>A formal order issued by a competent court of law</li>
                </ul>
                <p>
                  Whenever ethically permissible, your therapist will discuss any mandatory safety escalation with you directly beforehand.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420]">4. Your Rights Under the Kenya Data Protection Act 2019</h2>
                <p>
                  You hold the legal right to access your stored administrative records, request corrections to contact details, or request full deletion of your contact profile upon completion of care.
                </p>
                <p>
                  For privacy inquiries or data requests, contact our Data Protection Liaison at{' '}
                  <a href="mailto:infobesawa@gmail.com" className="font-semibold text-[#2D5A46] underline">
                    infobesawa@gmail.com
                  </a>{' '}
                  or call{' '}
                  <a href="tel:0710759422" className="font-semibold text-[#2D5A46] underline">
                    0710 759 422
                  </a>.
                </p>
              </section>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-[#1C2420] text-sm leading-relaxed space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420] flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-[#2D5A46]" />
                  1. Collaborative Therapeutic Alliance
                </h2>
                <p>
                  Therapy is an active partnership between you and your practitioner. While our counsellors provide clinical expertise, coping techniques, and emotional containment, psychological growth requires mutual engagement, openness, and consistent session rhythm.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420]">2. Scheduled Appointments & Non-Emergency Notice</h2>
                <p>
                  Be Sawa operates on an advance-booking model. We are <strong>not</strong> an acute psychiatric crisis casualty unit. If you or a loved one is experiencing immediate life-threatening suicidal distress or medical emergency:
                </p>
                <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#F4D1BA] text-xs text-[#9E5D43] space-y-1.5">
                  <div><strong>Kenya Red Cross Toll-Free Helpline:</strong> <a href="tel:1199" className="font-bold underline">1199</a></div>
                  <div><strong>Childline Kenya:</strong> <a href="tel:116" className="font-bold underline">116</a></div>
                  <div><strong>National Emergency Service:</strong> <a href="tel:999" className="font-bold underline">999</a> or <a href="tel:112" className="font-bold underline">112</a></div>
                  <div className="pt-1">
                    <button
                      onClick={() => navigate('/crisis')}
                      className="text-[#2D5A46] font-bold underline cursor-pointer"
                    >
                      Visit the Be Sawa Crisis & Emergency Resources Directory →
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420]">3. Transparent Session Fees & Payment Terms</h2>
                <p>
                  Session fees are agreed upon and confirmed prior to appointment confirmation with zero hidden costs or intake fees.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#54635B]">
                  <li>Sessions are confirmed upon receipt of booking via official M-Pesa payment or approved arrangement.</li>
                  <li>Multi-session pathways offer structured care and remain valid for 60 to 120 days from purchase.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-[#1C2420]">4. Respectful Rescheduling & Cancellations</h2>
                <p>
                  Therapists dedicate their full attention and reserved studio time to each scheduled appointment. Please provide at least <strong>12 hours notice</strong> if you need to reschedule a session. Late cancellations within less than 4 hours may be subject to a half-session administrative fee at the practitioner's discretion.
                </p>
              </section>
            </div>
          )}

          <div className="pt-8 border-t border-[#EDE9E1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-[#54635B]">
              <Phone className="w-4 h-4 text-[#2D5A46]" />
              <span>Questions? Call or WhatsApp our Care Desk at <strong>0710 759 422</strong></span>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/book')}
            >
              Book a Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
