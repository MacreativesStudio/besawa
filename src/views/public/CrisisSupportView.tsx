import React from 'react';
import {
  Phone,
  AlertCircle,
  ShieldAlert,
  HeartHandshake,
  MessageCircle,
  ArrowLeft,
  LifeBuoy,
  Hospital,
  Shield,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

interface CrisisSupportViewProps {
  navigate: (path: string) => void;
}

export const CrisisSupportView: React.FC<CrisisSupportViewProps> = ({ navigate }) => {
  return (
    <div className="py-8 md:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb / Back */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#54635B] hover:text-[#1C2420] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-[#9E5D43] bg-[#FFF8F0] px-3 py-1 rounded-full border border-[#F4D1BA]">
          24/7 Kenya Emergency Contacts
        </span>
      </div>

      {/* Hero Warning Banner */}
      <div className="bg-[#FFF8F0] border-2 border-[#E8B496] rounded-3xl p-6 sm:p-8 mb-10 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#9E5D43] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C2420] tracking-tight">
              Immediate Crisis & Emergency Support
            </h1>
            <p className="text-sm sm:text-base text-[#54635B] leading-relaxed max-w-3xl">
              If you, a child, teen, or loved one is experiencing acute suicidal thoughts, severe emotional crisis, domestic danger, or medical distress, <strong>please reach out immediately</strong>. You do not have to carry this alone. Free, confidential support is available 24/7 across Kenya.
            </p>
            <div className="text-xs text-[#9E5D43] font-bold pt-1">
              Be Sawa is a scheduled outpatient counselling practice. We do not provide 24/7 emergency casualty triage. Use the toll-free services below for instant intervention.
            </div>
          </div>
        </div>
      </div>

      {/* Primary Emergency Dial Lines */}
      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-bold text-[#1C2420] flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#2D5A46]" />
          Toll-Free & 24/7 Kenya Helplines (Tap to Call Directly)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Kenya Red Cross */}
          <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] hover:border-[#2D5A46] transition-all shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-2.5 py-1 rounded-lg">
                  24/7 Toll-Free
                </span>
                <span className="text-xs font-semibold text-[#78867E]">National Dispatch</span>
              </div>
              <h3 className="text-lg font-bold text-[#1C2420]">Kenya Red Cross Crisis Helpline</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                Free 24/7 emergency psychological first aid, suicide crisis intervention, mental health counselling, and emergency ambulance dispatch across all Kenyan counties.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-[#EDE9E1] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#78867E]">Toll-Free Number</div>
                <div className="text-2xl font-black text-[#2D5A46]">1199</div>
              </div>
              <a
                href="tel:1199"
                className="inline-flex items-center gap-2 bg-[#2D5A46] hover:bg-[#204233] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 1199 Free</span>
              </a>
            </div>
          </div>

          {/* Childline Kenya */}
          <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] hover:border-[#2D5A46] transition-all shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E5D43] bg-[#FFF8F0] px-2.5 py-1 rounded-lg">
                  Kids & Teens (24/7)
                </span>
                <span className="text-xs font-semibold text-[#78867E]">Youth Safeguarding</span>
              </div>
              <h3 className="text-lg font-bold text-[#1C2420]">Childline Kenya (Kids & Adolescents)</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                Confidential toll-free helpline dedicated to children and teenagers facing emotional distress, bullying, violence, neglect, depression, or parental conflict.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-[#EDE9E1] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#78867E]">Toll-Free Number</div>
                <div className="text-2xl font-black text-[#9E5D43]">116</div>
              </div>
              <a
                href="tel:116"
                className="inline-flex items-center gap-2 bg-[#9E5D43] hover:bg-[#834933] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 116 Free</span>
              </a>
            </div>
          </div>

          {/* GBV Hotline */}
          <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] hover:border-[#2D5A46] transition-all shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#286E47] bg-[#E8F3ED] px-2.5 py-1 rounded-lg">
                  Gender & Domestic Safety
                </span>
                <span className="text-xs font-semibold text-[#78867E]">24/7 National</span>
              </div>
              <h3 className="text-lg font-bold text-[#1C2420]">National GBV & Domestic Safety Hotline</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                Emergency crisis support, medical rescue coordination, safe house guidance, and legal support for survivors of domestic violence and gender-based assault.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-[#EDE9E1] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#78867E]">Toll-Free Number</div>
                <div className="text-2xl font-black text-[#286E47]">1195</div>
              </div>
              <a
                href="tel:1195"
                className="inline-flex items-center gap-2 bg-[#286E47] hover:bg-[#1E5637] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 1195 Free</span>
              </a>
            </div>
          </div>

          {/* Befrienders Kenya */}
          <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] hover:border-[#2D5A46] transition-all shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#54635B] bg-[#F4EFEA] px-2.5 py-1 rounded-lg">
                  Suicide Prevention
                </span>
                <span className="text-xs font-semibold text-[#78867E]">Confidential Listening</span>
              </div>
              <h3 className="text-lg font-bold text-[#1C2420]">Befrienders Kenya</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                A compassionate, non-judgmental listening ear for anyone experiencing severe loneliness, depression, or contemplating ending their life.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-[#EDE9E1] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#78867E]">Direct Helpline</div>
                <div className="text-lg font-black text-[#1C2420]">+254 722 178 177</div>
              </div>
              <a
                href="tel:+254722178177"
                className="inline-flex items-center gap-2 bg-[#1C2420] hover:bg-[#2D5A46] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Hospital Psychiatric Emergency Departments in Nairobi */}
      <div className="bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 border border-[#E3DED6] mb-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center shrink-0">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1C2420]">Nairobi Walk-In Emergency Casualty Centers</h2>
            <p className="text-xs text-[#54635B]">
              If someone is in immediate physical danger or experiencing an acute psychiatric crisis requiring in-person stabilization:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-[#EDE9E1] space-y-1">
            <div className="font-bold text-[#1C2420] text-sm">Mathari National Hospital</div>
            <div className="text-[#54635B]">National Referral Psychiatric Hospital</div>
            <div className="text-[#78867E]">Thika Superhighway, Nairobi</div>
            <div className="pt-2 font-bold text-[#2D5A46]">24/7 Psychiatric Casualty</div>
            <a href="tel:+254202337694" className="inline-block text-[#2D5A46] underline mt-1 font-semibold">
              +254 20 233 7694
            </a>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EDE9E1] space-y-1">
            <div className="font-bold text-[#1C2420] text-sm">The Nairobi Hospital</div>
            <div className="text-[#54635B]">Accident & Emergency Triage</div>
            <div className="text-[#78867E]">Argwings Kodhek Rd, Nairobi</div>
            <div className="pt-2 font-bold text-[#2D5A46]">24/7 Medical & Trauma</div>
            <a href="tel:+254703082000" className="inline-block text-[#2D5A46] underline mt-1 font-semibold">
              +254 703 082 000
            </a>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EDE9E1] space-y-1">
            <div className="font-bold text-[#1C2420] text-sm">Aga Khan University Hospital</div>
            <div className="text-[#54635B]">Accident & Emergency Unit</div>
            <div className="text-[#78867E]">3rd Parklands Ave, Nairobi</div>
            <div className="pt-2 font-bold text-[#2D5A46]">24/7 Emergency Casualty</div>
            <a href="tel:+254203662000" className="inline-block text-[#2D5A46] underline mt-1 font-semibold">
              +254 20 366 2000
            </a>
          </div>
        </div>
      </div>

      {/* Immediate Grounding Steps While Waiting */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] mb-12 space-y-4">
        <div className="flex items-center gap-2 text-[#2D5A46]">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-lg font-bold text-[#1C2420]">Immediate Grounding: 5-4-3-2-1 Coping Anchor</h2>
        </div>
        <p className="text-xs text-[#54635B] leading-relaxed max-w-2xl">
          When emotions feel overwhelmingly intense or panic takes over, your nervous system is in fight-or-flight. Take a slow, gentle breath into your belly and ground your senses in this present moment:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] text-center">
            <div className="text-base font-black text-[#2D5A46] mb-1">5</div>
            <div className="font-bold text-[#1C2420]">Things You See</div>
            <p className="text-[10px] text-[#78867E] mt-0.5">Look for colors, shadows, or textures around you.</p>
          </div>
          <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] text-center">
            <div className="text-base font-black text-[#2D5A46] mb-1">4</div>
            <div className="font-bold text-[#1C2420]">Things You Feel</div>
            <p className="text-[10px] text-[#78867E] mt-0.5">Feet on floor, fabric of your shirt, fingers touching.</p>
          </div>
          <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] text-center">
            <div className="text-base font-black text-[#2D5A46] mb-1">3</div>
            <div className="font-bold text-[#1C2420]">Things You Hear</div>
            <p className="text-[10px] text-[#78867E] mt-0.5">Traffic outside, birds, air conditioner, clock.</p>
          </div>
          <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] text-center">
            <div className="text-base font-black text-[#2D5A46] mb-1">2</div>
            <div className="font-bold text-[#1C2420]">Things You Smell</div>
            <p className="text-[10px] text-[#78867E] mt-0.5">Coffee, fresh air, hand soap, or fabric.</p>
          </div>
          <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] text-center col-span-2 sm:col-span-1">
            <div className="text-base font-black text-[#2D5A46] mb-1">1</div>
            <div className="font-bold text-[#1C2420]">Thing You Taste</div>
            <p className="text-[10px] text-[#78867E] mt-0.5">Sip of cool water or natural breath.</p>
          </div>
        </div>
      </div>

      {/* Non-Emergency Scheduled Support at Be Sawa */}
      <div className="p-6 sm:p-8 bg-[#EBF2EE] rounded-3xl border border-[#2D5A46]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-[#1C2420]">
            Seeking Ongoing Psychological Healing?
          </h3>
          <p className="text-xs text-[#54635B] max-w-xl leading-relaxed">
            Once you are in a safe, stabilized place, Be Sawa offers scheduled confidential individual, teen, child, and adult counselling with our licensed team in Nairobi or online.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/book')}
            className="w-full sm:w-auto"
          >
            Book Scheduled Session
          </Button>
          <a
            href="https://wa.me/254710759422?text=Hello%20Be%20Sawa%2C%20I%20would%20like%20to%20inquire%20about%20scheduled%20counselling."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
