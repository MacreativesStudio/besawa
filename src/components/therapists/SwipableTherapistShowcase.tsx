import React, { useRef, useState, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Globe,
  Award,
  Calendar,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';
import { PublicTherapist } from '../../types';
import { Button } from '../common/Button';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface SwipableTherapistShowcaseProps {
  therapists: PublicTherapist[];
  onSelectTherapist: (therapistId: string) => void;
  title?: string;
  subtitle?: string;
  showFounderHighlight?: boolean;
}

export const SwipableTherapistShowcase: React.FC<SwipableTherapistShowcaseProps> = ({
  therapists,
  onSelectTherapist,
  title = 'Meet Your Care Practitioners',
  subtitle = 'Discover our approved psychological counsellors. Each practitioner provides warm relational safety, confidentiality, and compassionate clinical care.',
  showFounderHighlight = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [selectedModalTherapist, setSelectedModalTherapist] = useState<PublicTherapist | null>(null);


  // Filter therapist items
  const filteredTherapists = therapists.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TRAUMA') {
      return t.areas_of_practice.some((a) =>
        /trauma|ptsd|anxiety|grief/i.test(a)
      );
    }
    if (activeFilter === 'COUPLES') {
      return (
        t.areas_of_practice.some((a) => /couple|marriage|family|relat/i.test(a)) ||
        t.supported_services.some((s) => /couple|marriage/i.test(s.name))
      );
    }
    if (activeFilter === 'KIDS') {
      return t.areas_of_practice.some((a) => /kid|teen|adolescent|youth/i.test(a));
    }
    if (activeFilter === 'ONLINE') {
      return t.supports_online;
    }
    return true;
  });

  // Check scroll position to update arrows and active index
  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScrollLeft - 10);

    // Calculate approx index based on card width
    const card = el.firstElementChild as HTMLElement;
    if (card) {
      const cardWidth = card.offsetWidth + 24; // width + gap
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(index, filteredTherapists.length - 1));
    }
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateScrollState);
    return () => window.cancelAnimationFrame(frame);
  }, [filteredTherapists.length]);

  const scrollToCard = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cards = el.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      setCurrentIndex(index);
    }
  };

  const handleScrollPrev = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 24 : 360;
    el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  const handleScrollNext = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 24 : 360;
    el.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };


  return (
    <div className="relative">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#286E47]" />
            <span>Interactive Practitioner Profiles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C2420] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#54635B] mt-2 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action / Navigation Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-xs font-semibold text-[#78867E] bg-white px-3 py-1.5 rounded-full border border-[#E3DED6]">
            Showing <span className="text-[#1C2420] font-bold">{filteredTherapists.length}</span> therapists
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScrollPrev}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-white text-[#1C2420] border-[#E3DED6] hover:bg-[#F3EDE2] hover:border-[#2D5A46] shadow-xs'
                  : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
              aria-label="Previous therapist"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleScrollNext}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-white text-[#1C2420] border-[#E3DED6] hover:bg-[#F3EDE2] hover:border-[#2D5A46] shadow-xs'
                  : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
              }`}
              aria-label="Next therapist"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Specialty Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {[
          { id: 'ALL', label: 'All Practitioners' },
          { id: 'TRAUMA', label: 'Trauma & Anxiety' },
          { id: 'COUPLES', label: 'Couples & Marriage' },
          { id: 'KIDS', label: 'Kids & Teens' },
          { id: 'ONLINE', label: 'Telehealth Available' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveFilter(tab.id);
              setCurrentIndex(0);
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }
            }}
            className={`text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-[#2D5A46] text-white shadow-xs'
                : 'bg-white text-[#54635B] border border-[#E3DED6] hover:bg-[#FAF8F5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Swipable Carousel Track */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollState}
        className="flex gap-6 overflow-x-auto snap-x snap-proximity scroll-smooth overscroll-x-contain touch-auto pb-6 pt-2 px-1 -mx-1 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {filteredTherapists.map((therapist) => {
          const firstName = therapist.full_name.split(' ')[0];
          return (
            <div
              key={therapist.id}
              className="snap-start shrink-0 w-[300px] sm:w-[350px] md:w-[380px] rounded-3xl border transition-all duration-300 flex flex-col justify-between relative group bg-white border-[#E3DED6] shadow-sm hover:shadow-xl hover:border-[#2D5A46]/40 overflow-hidden"
            >
              <div>
                {/* Full-Bleed Creative Portrait Header */}
                <div
                  className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4EFEA] cursor-pointer"
                  onClick={() => setSelectedModalTherapist(therapist)}
                  title={`View ${therapist.full_name}'s full profile`}
                >
                  <ResponsiveImage
                    src={therapist.profile_photo_url || ''}
                    alt={`Portrait of ${therapist.full_name}`}
                    fallbackType="person"
                    aspectRatio="portrait"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    imageClassName="w-full h-full object-cover object-top"
                  />

                  {/* Gradient vignette for readability & elegance */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top floating badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide bg-white/95 backdrop-blur-md text-[#286E47] px-3 py-1 rounded-full shadow-md border border-white/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#286E47]" />
                      <span>
                        {therapist.verification_status === 'VERIFIED'
                          ? 'Board Verified'
                          : 'Approved Practitioner'}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#1C2420]/80 backdrop-blur-md text-[#DFC085] px-2.5 py-1 rounded-full shadow-md border border-white/10">
                      <Award className="w-3 h-3 text-[#DFC085]" />
                      <span>{therapist.years_experience}+ Yrs</span>
                    </span>
                  </div>

                  {/* Bottom portrait overlay: Name & Title */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white pointer-events-none">
                    <h3
                      className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {therapist.full_name}
                    </h3>
                    <p className="text-xs font-medium text-white/90 drop-shadow-sm mt-0.5">
                      {therapist.title}
                    </p>
                  </div>
                </div>

                {/* Card Body Info */}
                <div className="p-5 space-y-3.5">
                  {/* Languages & Modes of Care */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#54635B] pb-3 border-b border-[#EDE9E1]">
                    <span className="text-[11px] text-[#78867E]">
                      {therapist.languages.join(' • ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {therapist.supports_online && (
                        <span className="inline-flex items-center gap-1 text-[#2D5A46] font-semibold bg-[#EBF2EE] px-2 py-0.5 rounded-md text-[10.5px]">
                          <Video className="w-3 h-3" /> Online
                        </span>
                      )}
                      {therapist.supports_in_person && (
                        <span className="inline-flex items-center gap-1 text-[#9E5D43] font-semibold bg-[#FFF4EE] px-2 py-0.5 rounded-md text-[10.5px]">
                          <MapPin className="w-3 h-3" /> Nairobi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Bio */}
                  <p className="text-xs text-[#54635B] leading-relaxed line-clamp-2">
                    {therapist.bio}
                  </p>

                  {/* Practice Area Tags */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#78867E] mb-1.5">
                      Clinical Focus
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {therapist.areas_of_practice.slice(0, 3).map((area, idx) => (
                        <span
                          key={idx}
                          className="text-[10.5px] font-medium bg-[#FAF8F5] border border-[#E3DED6] text-[#2D5A46] px-2 py-0.5 rounded-md"
                        >
                          {area}
                        </span>
                      ))}
                      {therapist.areas_of_practice.length > 3 && (
                        <span className="text-[10px] text-[#78867E] self-center">
                          +{therapist.areas_of_practice.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 py-2 text-xs font-bold shadow-xs"
                    onClick={() => onSelectTherapist(therapist.id)}
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  >
                    Book with {firstName}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setSelectedModalTherapist(therapist)}
                    className="p-2 border border-[#E3DED6] hover:border-[#2D5A46] hover:bg-[#F4EFEA] text-[#54635B] hover:text-[#2D5A46] rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                    title="View Bio & Credentials"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/254710759422?text=${encodeURIComponent(
                      `Hello BeSawa, I would like to inquire about booking a session with ${therapist.full_name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center cursor-pointer"
                    title={`WhatsApp inquiry for ${therapist.full_name}`}
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dot Indicators & Swipe Hint */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          {filteredTherapists.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToCard(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-6 bg-[#2D5A46]' : 'w-2 bg-[#D5E4DC] hover:bg-[#2D5A46]/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="text-[11px] text-[#78867E] flex items-center gap-1">
          <span>👈 Swipe cards or use arrows 👉</span>
        </div>
      </div>

      {/* Quick Bio & Credentials Modal */}
      {selectedModalTherapist && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E3DED6] relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedModalTherapist(null)}
              className="absolute top-5 right-5 p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#2D5A46]/20 shrink-0">
                <ResponsiveImage
                  src={selectedModalTherapist.profile_photo_url || ''}
                  alt={selectedModalTherapist.full_name}
                  fallbackType="person"
                  aspectRatio="square"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-[#286E47] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {selectedModalTherapist.verification_status === 'VERIFIED'
                      ? 'Board Verified Practitioner'
                      : 'Approved Care Practitioner'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1C2420]">
                  {selectedModalTherapist.full_name}
                </h3>
                <p className="text-xs text-[#54635B]">{selectedModalTherapist.title}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#54635B] leading-relaxed">
              <div>
                <h4 className="font-bold text-[#1C2420] uppercase tracking-wider text-[11px] mb-1">
                  Full Clinical Background
                </h4>
                <p>{selectedModalTherapist.bio}</p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EDE9E1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C2420]">Clinical Experience:</span>
                  <span>{selectedModalTherapist.years_experience}+ Years Active Practice</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C2420]">Languages Spoken:</span>
                  <span>{selectedModalTherapist.languages.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C2420]">Care Setting:</span>
                  <span>
                    {selectedModalTherapist.supports_online && 'Online Telehealth'}
                    {selectedModalTherapist.supports_online && selectedModalTherapist.supports_in_person && ' & '}
                    {selectedModalTherapist.supports_in_person && 'Kilimani Studio (Nairobi)'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1C2420] uppercase tracking-wider text-[11px] mb-2">
                  Specialized Areas of Focus
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedModalTherapist.areas_of_practice.map((area, idx) => (
                    <span
                      key={idx}
                      className="bg-[#EBF2EE] text-[#2D5A46] font-medium px-2.5 py-1 rounded-lg text-xs"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {selectedModalTherapist.credential_summary && selectedModalTherapist.credential_summary.length > 0 && (
                <div>
                  <h4 className="font-bold text-[#1C2420] uppercase tracking-wider text-[11px] mb-2">
                    Verified Board Credentials
                  </h4>
                  <div className="space-y-1.5">
                    {selectedModalTherapist.credential_summary.map((cred, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#1C2420]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#286E47] shrink-0" />
                        <span>
                          <strong>{cred.document_type}</strong> — {cred.issuing_authority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-[#EDE9E1] flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedModalTherapist(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = selectedModalTherapist.id;
                  setSelectedModalTherapist(null);
                  onSelectTherapist(id);
                }}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Schedule Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
