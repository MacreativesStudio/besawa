import React from 'react';
import { HeartHandshake, ShieldCheck, MapPin, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ResponsiveImage } from '../../components/common/ResponsiveImage';

interface AboutViewProps {
  navigate: (path: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ navigate }) => {
  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Emblem Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full">
            Our Story & Ethics
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1C2420] tracking-tight leading-tight">
            About BeSawa
          </h1>
          <p className="text-lg text-[#54635B] leading-relaxed">
            "Sawa" is the Swahili word for alright, balanced, and at peace. BeSawa was founded with a singular conviction: mental wellness care in Kenya must be dignified, safe, professional, and deeply accessible.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#C89D57] font-medium pt-1">
            <span className="w-6 h-px bg-[#C89D57]" />
            <span style={{ fontFamily: "'Alex Brush', cursive, serif" }} className="text-lg">
              Better Minds. Brighter Futures.
            </span>
          </div>
        </div>

        {/* Official Brand Emblem Display */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="bg-white p-6 rounded-3xl border border-[#E3DED6] shadow-sm flex flex-col items-center text-center space-y-3 max-w-xs w-full">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#C89D57]/40 shadow-xs bg-[#FAF8F5]">
              <img
                src="/besawa-emblem.jpg"
                alt="BeSawa Woman & Botanical Leaves Emblem"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1C3F32]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                BeSawa Emblem
              </h4>
              <p className="text-[11px] font-bold tracking-widest uppercase text-[#C89D57] mt-0.5">
                Mindfulness & Sanctuary
              </p>
              <p className="text-xs text-[#54635B] mt-2 leading-relaxed">
                The serene woman profile and blossoming leaves embody peace, cognitive restoration, and grounded African healing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-3xl border border-[#E3DED6] shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF2EE] flex items-center justify-center text-[#2D5A46] mb-6">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#1C2420] mb-3">Our Mission</h3>
          <p className="text-sm text-[#54635B] leading-relaxed">
            To provide compassionate, clinically rigorous, and culturally grounded psychological care that demystifies mental health and empowers individuals, couples, and communities to heal with dignity.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E3DED6] shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F7EFEA] flex items-center justify-center text-[#9E5D43] mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#1C2420] mb-3">Our Core Philosophy</h3>
          <p className="text-sm text-[#54635B] leading-relaxed">
            We reject cold clinical detachment. Therapy is an authentic human encounter. We combine evidence-based methodologies (CBT, ACT, EFT, Psychodynamic) with profound cultural understanding of contemporary Kenyan life.
          </p>
        </div>
      </div>

      {/* Strict Ethical Standards */}
      <div className="bg-[#F4EFEA] p-8 sm:p-12 rounded-3xl border border-[#E3DED6] mb-16">
        <div className="max-w-3xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2420]">
            The Be Sawa Standard of Clinical Governance
          </h2>
          <p className="text-sm text-[#54635B] mt-2">
            In an unregulated online world, we hold our platform to the highest professional and ethical safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-[#2D5A46] shrink-0 mt-1" />
            <div>
              <h4 className="text-base font-bold text-[#1C2420]">Rigorous Credential Vetting</h4>
              <p className="text-xs text-[#54635B] mt-1 leading-relaxed">
                Every therapist is screened for academic qualifications, professional association membership, and active good standing before onboarding.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-[#2D5A46] shrink-0 mt-1" />
            <div>
              <h4 className="text-base font-bold text-[#1C2420]">Absolute Data Confidentiality</h4>
              <p className="text-xs text-[#54635B] mt-1 leading-relaxed">
                We never ask for or store invasive medical diagnostic history on web intake forms. Your clinical conversations remain strictly between you and your practitioner.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-[#2D5A46] shrink-0 mt-1" />
            <div>
              <h4 className="text-base font-bold text-[#1C2420]">Fair Practitioner Remuneration</h4>
              <p className="text-xs text-[#54635B] mt-1 leading-relaxed">
                We operate on an ethical 80/20 practitioner settlement model, ensuring psychologists are fairly compensated for their vital emotional labor.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-[#2D5A46] shrink-0 mt-1" />
            <div>
              <h4 className="text-base font-bold text-[#1C2420]">Clear Safety Disclaimers</h4>
              <p className="text-xs text-[#54635B] mt-1 leading-relaxed">
                We are transparent about what we do and do not provide. We do not provide acute hospital casualty triage, and we openly provide Kenya Red Cross 1199 hotline resources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Founder Spotlight */}
      <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F4EFEA] p-8 sm:p-12 rounded-3xl border border-[#E3DED6] mb-16 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-48 sm:w-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#C89D57]/40 shadow-md shrink-0">
            <ResponsiveImage
              src="/images/founder/muthoni.jpg"
              alt="Muthoni Maina, Founder of Be Sawa"
              aspectRatio="portrait"
              fallbackType="person"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E6B1F] bg-[#FAF2E4] px-3 py-1 rounded-full border border-[#E8D4B0]/60">
              Sanctuary Leadership
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1C2420]">
              Muthoni Maina
            </h3>
            <p className="text-sm font-semibold text-[#2D5A46]">Founder of Be Sawa</p>
            <p className="text-sm text-[#54635B] leading-relaxed">
              Guided by deep empathy, human dignity, and a passion for community wellbeing, Muthoni established Be Sawa as an intentional sanctuary where seeking psychological support is normalized, respected, and accessible.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/founder')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Read Founder Story &amp; Philosophy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/therapists')}
              >
                Meet Our Practitioners
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Physical & Online Presence */}
      <div className="bg-white p-8 rounded-3xl border border-[#E3DED6] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E5D43]">
            <MapPin className="w-4 h-4" />
            Physical Consulting Rooms
          </div>
          <h3 className="text-2xl font-bold text-[#1C2420]">Based in Kilimani, Nairobi</h3>
          <p className="text-sm text-[#54635B] leading-relaxed">
            Our physical practice offers a tranquil, sound-isolated sanctuary free from the bustle of Nairobi. Prefer the comfort of your home? Our encrypted telehealth sessions connect you wherever you are in Kenya.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/book')}
        >
          Book an Appointment
        </Button>
      </div>
    </div>
  );
};
