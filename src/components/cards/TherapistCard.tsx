import React from 'react';
import { ShieldCheck, Video, MapPin, Globe, Award, Calendar, Eye, Sparkles } from 'lucide-react';
import { PublicTherapist } from '../../types';
import { Button } from '../common/Button';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface TherapistCardProps {
  therapist: PublicTherapist;
  onSelect: (therapistId: string) => void;
  onViewProfile?: (therapist: PublicTherapist) => void;
}

export const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onSelect, onViewProfile }) => {
  const firstName = therapist.full_name.split(' ')[0];

  return (
    <div className="group bg-white rounded-3xl border border-[#E3DED6] shadow-sm hover:shadow-xl hover:border-[#2D5A46]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Generous Full Portrait Header */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4EFEA] cursor-pointer" onClick={() => onViewProfile && onViewProfile(therapist)}>
          <ResponsiveImage
            src={therapist.profile_photo_url || ''}
            alt={`Portrait of ${therapist.full_name}`}
            fallbackType="person"
            aspectRatio="portrait"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            imageClassName="w-full h-full object-cover object-top"
          />

          {/* Artistic vignette overlay for depth and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

          {/* Top floating badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide bg-white/95 backdrop-blur-md text-[#286E47] px-3 py-1 rounded-full shadow-md border border-white/60">
              <ShieldCheck className="w-3.5 h-3.5 text-[#286E47]" />
              <span>
                {therapist.verification_status === 'VERIFIED' ? 'Board Verified' : 'Approved Practitioner'}
              </span>
            </span>

            {/* Experience Pill */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#1C2420]/80 backdrop-blur-md text-[#DFC085] px-2.5 py-1 rounded-full shadow-md border border-white/10">
              <Award className="w-3 h-3 text-[#DFC085]" />
              <span>{therapist.years_experience}+ Yrs</span>
            </span>
          </div>

          {/* Bottom photo overlay: Name & Title preview for immediate visual connection */}
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

        {/* Card Body Details */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Modality & Languages row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#54635B] pb-3 border-b border-[#EDE9E1]">
            <div className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-[#2D5A46] shrink-0" />
              <span>{therapist.languages.join(', ')}</span>
            </div>

            <div className="flex items-center gap-2">
              {therapist.supports_online && (
                <span className="inline-flex items-center gap-1 text-[#2D5A46] font-semibold bg-[#EBF2EE] px-2 py-0.5 rounded-md text-[11px]">
                  <Video className="w-3 h-3" /> Online
                </span>
              )}
              {therapist.supports_in_person && (
                <span className="inline-flex items-center gap-1 text-[#9E5D43] font-semibold bg-[#FFF4EE] px-2 py-0.5 rounded-md text-[11px]">
                  <MapPin className="w-3 h-3" /> In-Person
                </span>
              )}
            </div>
          </div>

          {/* Bio snippet */}
          <p className="text-xs sm:text-sm text-[#54635B] leading-relaxed line-clamp-3">
            {therapist.bio}
          </p>

          {/* Practice Areas / Focus Specialties */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78867E]">
              Clinical Focus Areas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {therapist.areas_of_practice.slice(0, 4).map((area, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-[#FAF8F5] text-[#2D5A46] border border-[#E3DED6] px-2.5 py-1 rounded-lg"
                >
                  {area}
                </span>
              ))}
              {therapist.areas_of_practice.length > 4 && (
                <span className="text-[10px] text-[#78867E] self-center">
                  +{therapist.areas_of_practice.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-5 sm:p-6 pt-0 flex items-center justify-between gap-3">
        {onViewProfile && (
          <button
            type="button"
            onClick={() => onViewProfile(therapist)}
            className="text-xs font-bold text-[#54635B] hover:text-[#2D5A46] hover:underline cursor-pointer flex items-center gap-1.5 py-2 px-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#2D5A46]" />
            <span>Full Bio &amp; Credentials</span>
          </button>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelect(therapist.id)}
          leftIcon={<Calendar className="w-3.5 h-3.5" />}
          className="ml-auto shadow-xs"
        >
          Book with {firstName}
        </Button>
      </div>
    </div>
  );
};
