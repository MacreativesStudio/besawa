import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Compass,
  Layers,
  Quote,
  MessageCircle,
  Calendar,
  Share2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { muthoniMainaFounderData } from '../../data/founderData';
import { Button } from '../../components/common/Button';
import { ResponsiveImage } from '../../components/common/ResponsiveImage';

interface FounderViewProps {
  navigate: (path: string, params?: any) => void;
}

export const FounderView: React.FC<FounderViewProps> = ({ navigate }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const data = muthoniMainaFounderData;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const getPillarIcon = (name: string) => {
    switch (name) {
      case 'heart':
        return <Heart className="w-5 h-5 text-[#9E5D43]" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-[#286E47]" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-[#C89D57]" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-[#2D5A46]" />;
      default:
        return <Heart className="w-5 h-5 text-[#2D5A46]" />;
    }
  };

  const founderWhatsAppUrl = `https://wa.me/${data.contactWhatsApp}?text=${encodeURIComponent(
    'Hello Be Sawa, I read the founder message and would like to learn more about your services.'
  )}`;

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Header / Intro Hero */}
      <section className="bg-white rounded-3xl p-6 sm:p-12 border border-[#E3DED6] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="w-56 h-64 sm:w-64 sm:h-80 rounded-3xl overflow-hidden border-2 border-[#C89D57]/30 shadow-md ring-4 ring-[#FAF2E4]">
              <ResponsiveImage
                src="/images/founder/muthoni.jpg"
                alt="Portrait of Muthoni Maina, founder of Be Sawa"
                aspectRatio="portrait"
                fallbackType="person"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E6B1F] bg-[#FAF2E4] px-3.5 py-1.5 rounded-full border border-[#E8D4B0]/60">
              <span>Meet the Founder</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C2420] tracking-tight">
              {data.publicName}
            </h1>
            <p className="text-base sm:text-lg text-[#2D5A46] font-semibold">
              {data.roleTitle}
            </p>

            {/* Foundational Quote */}
            <div className="relative p-5 rounded-2xl bg-[#FAF8F5] border border-[#EDE9E1]">
              <Quote className="w-6 h-6 text-[#C89D57]/40 absolute top-3 right-3" />
              <p className="text-sm italic text-[#1C2420] leading-relaxed relative z-10 font-serif">
                "{data.quote}"
              </p>
            </div>

            <p className="text-sm text-[#54635B] leading-relaxed">
              {data.aboutFounder}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/services')}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Explore Services
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/therapists')}
              >
                Meet Our Practitioners
              </Button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-[#E3DED6] text-[#78867E] hover:text-[#1C2420] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                title="Share founder page"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Be Sawa Exists (The Story) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9E5D43]">
            Our Origins
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2420]">
            Why Be Sawa Exists
          </h2>
        </div>

        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#EDE9E1] space-y-4 text-sm sm:text-base text-[#1C2420] leading-relaxed">
          {data.whyBeSawaExists.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* 3. Guiding Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2D5A46]">
            Core Values
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2420]">
            What We Stand For
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.philosophyPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-[#E3DED6] shadow-xs space-y-2.5 hover:border-[#2D5A46]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7EFEA] flex items-center justify-center">
                {getPillarIcon(pillar.iconName)}
              </div>
              <h3 className="text-base font-bold text-[#1C2420]">{pillar.title}</h3>
              <p className="text-xs font-semibold text-[#2D5A46]">{pillar.tagline}</p>
              <p className="text-xs text-[#54635B] leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Founder's Note & Closing */}
      <section className="bg-gradient-to-r from-[#FAF6EE] to-[#F3EDE2] border border-[#E8D4B0] rounded-3xl p-6 sm:p-10 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C2420]">
          A Personal Message from Muthoni
        </h3>
        <p className="text-sm text-[#54635B] max-w-2xl mx-auto leading-relaxed italic">
          "{data.founderNote}"
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={founderWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3 px-6 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Connect on WhatsApp ({data.displayPhone})</span>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/services')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Browse Counselling Services
          </Button>
        </div>
      </section>
    </div>
  );
};
