import React from 'react';
import {
  X,
  ShieldCheck,
  Video,
  MapPin,
  Globe,
  Award,
  Calendar,
  MessageCircle,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PublicTherapist } from '../../types';
import { Button } from '../common/Button';
import { ResponsiveImage } from '../common/ResponsiveImage';

interface TherapistProfileModalProps {
  therapist: PublicTherapist | null;
  onClose: () => void;
  onBook: (therapistId: string) => void;
}

export const TherapistProfileModal: React.FC<TherapistProfileModalProps> = ({
  therapist,
  onClose,
  onBook,
}) => {
  if (!therapist) return null;

  const firstName = therapist.full_name.split(' ')[0];
  const whatsappUrl = `https://wa.me/254710759422?text=${encodeURIComponent(
    `Hello Be Sawa, I would like to inquire about booking a session with ${therapist.full_name} (${therapist.title}).`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-[#E3DED6] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#FBF9F5] to-[#F4EFEA] border-b border-[#EDE9E1] flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-[#286E47]" />
            <span>
              {therapist.verification_status === 'VERIFIED'
                ? 'Board Verified Practitioner'
                : 'Approved Care Practitioner'}{' '}
              • Nairobi &amp; Online
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-xl hover:bg-[#EDE9E1] transition-colors cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Hero Profile Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative shrink-0 w-36 h-44 sm:w-44 sm:h-56 rounded-3xl overflow-hidden border-2 border-[#C89D57]/40 shadow-lg ring-4 ring-[#FAF2E4] bg-[#FAF8F5]">
              <ResponsiveImage
                src={therapist.profile_photo_url || ''}
                alt={`Portrait of ${therapist.full_name}`}
                fallbackType="person"
                aspectRatio="portrait"
                className="w-full h-full object-cover"
                imageClassName="w-full h-full object-cover object-top"
              />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2420]">
                {therapist.full_name}
              </h2>
              <p className="text-sm font-semibold text-[#2D5A46]">{therapist.title}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#54635B]">
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#C89D57]" />
                  <span>{therapist.years_experience}+ Years Practice</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2D5A46]" />
                  <span>{therapist.languages.join(', ')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Mode Banner */}
          <div className="p-3.5 bg-[#FBF9F5] rounded-2xl border border-[#EDE9E1] flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-[#1C2420]">Available Delivery Formats:</span>
            <div className="flex items-center gap-3">
              {therapist.supports_online && (
                <span className="inline-flex items-center gap-1 text-[#2D5A46] font-medium bg-[#EBF2EE] px-2.5 py-1 rounded-lg">
                  <Video className="w-3.5 h-3.5" /> Telehealth Video
                </span>
              )}
              {therapist.supports_in_person && (
                <span className="inline-flex items-center gap-1 text-[#9E5D43] font-medium bg-[#FFF8F0] px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5" /> Kilimani Rooms, Nairobi
                </span>
              )}
            </div>
          </div>

          {/* Clinical Bio & Philosophy */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#78867E]">
              Professional Philosophy &amp; Background
            </h4>
            <p className="text-sm text-[#1C2420] leading-relaxed whitespace-pre-line bg-[#FAF8F5] p-4 rounded-2xl border border-[#EDE9E1]">
              {therapist.bio}
            </p>
          </div>

          {/* Areas of Practice */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#78867E]">
              Core Areas of Specialization
            </h4>
            <div className="flex flex-wrap gap-2">
              {therapist.areas_of_practice.map((area, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-[#EBF2EE] text-[#1E3F30] px-3 py-1.5 rounded-xl border border-[#2D5A46]/15"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Supported Services & Rates */}
          {therapist.supported_services && therapist.supported_services.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78867E]">
                Offered Services &amp; Transparent Rates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {therapist.supported_services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-3 bg-white rounded-xl border border-[#E3DED6] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#1C2420] truncate mr-2">{svc.name}</span>
                    <span className="font-bold text-[#2D5A46] shrink-0 font-mono">
                      KES {svc.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Credentials & Licensing Summary */}
          {therapist.credential_summary && therapist.credential_summary.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78867E]">
                Verified Regulatory Compliance
              </h4>
              <div className="space-y-1.5">
                {therapist.credential_summary.map((cred, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-[#286E47] bg-[#EBF2EE]/60 px-3 py-2 rounded-xl border border-[#2D5A46]/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {cred.document_type} — {cred.issuing_authority} (Verified Active)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-6 bg-[#FBF9F5] border-t border-[#EDE9E1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EBF2EE] hover:bg-[#DCE7E1] text-[#1E3A2F] border border-[#2D5A46]/20 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
            <span>Inquire About {firstName} on WhatsApp</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onBook(therapist.id);
              }}
              leftIcon={<Calendar className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-sm"
            >
              Book Session with {firstName}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
