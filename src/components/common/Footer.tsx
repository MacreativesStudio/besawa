import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#1C2420] text-[#E3DED6] pt-16 pb-12 border-t border-[#2D5A46]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#2D5A46]/20">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="cursor-pointer focus:outline-none text-left"
              aria-label="Be Sawa Home"
            >
              <Logo variant="footer" size="lg" showTagline={true} />
            </button>
            <p className="text-sm text-[#E3DED6]/80 leading-relaxed">
              Safe Space. Real Talk. Lasting Change. Compassionate, professional psychological support for kids, teens, and adults in Nairobi, Kenya and online nationwide.
            </p>
            <div className="inline-flex items-center gap-2 text-xs bg-[#2D5A46]/30 px-3 py-1.5 rounded-full text-[#EBF2EE] border border-[#2D5A46]/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#286E47]" />
              <span>Verified Licensed Practitioners</span>
            </div>
          </div>

          {/* Col 2: Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact & Location</h4>
            <ul className="space-y-2.5 text-sm text-[#E3DED6]/80">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C89D57] shrink-0 mt-0.5" />
                <div>
                  <a href="tel:0710759422" className="hover:text-white transition-colors">0710 759 422</a> /{' '}
                  <a href="tel:0745024278" className="hover:text-white transition-colors">0745 024 278</a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href="https://wa.me/254710759422?text=Hello%20Be%20Sawa%2C%20I%20would%20like%20to%20inquire%20about%20counselling."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: 0710 759 422
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C89D57] shrink-0" />
                <a href="mailto:infobesawa@gmail.com" className="hover:text-white transition-colors truncate">
                  infobesawa@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C89D57] shrink-0 mt-0.5" />
                <span>Nairobi, Kenya<br /><span className="text-xs text-[#E3DED6]/60">Scheduled In-Person & Telehealth</span></span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Explore</h4>
            <ul className="space-y-2 text-sm text-[#E3DED6]/80">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-white transition-colors cursor-pointer">
                  Counselling Services
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/therapists')} className="hover:text-white transition-colors cursor-pointer">
                  Meet Our Therapists
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/founder')} className="hover:text-white transition-colors cursor-pointer text-[#C89D57] font-semibold flex items-center gap-1.5">
                  <span>Founder's Vision</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/resources')} className="hover:text-white transition-colors cursor-pointer">
                  Psychoeducational Resources
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/packages')} className="hover:text-white transition-colors cursor-pointer">
                  Care Pathways & Packages
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  How Be Sawa Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faqs')} className="hover:text-white transition-colors cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/crisis')} className="hover:text-white transition-colors cursor-pointer text-[#C89D57]">
                  Crisis & Emergency Resources
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/lookup')} className="hover:text-white transition-colors cursor-pointer">
                  Lookup Existing Booking
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Crisis Support Warning */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#C89D57]">
              <AlertCircle className="w-4 h-4" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Emergency Helplines</h4>
            </div>
            <p className="text-xs text-[#E3DED6]/80 leading-relaxed">
              Be Sawa is a scheduled outpatient appointment service. If you or someone you know is in immediate life-threatening danger, please reach out to:
            </p>
            <div className="pt-2 border-t border-white/10 text-xs text-[#E3DED6]/90 space-y-1.5">
              <div>
                <strong>Kenya Red Cross:</strong>{' '}
                <a href="tel:1199" className="text-[#C89D57] font-bold hover:underline">1199</a> (Toll-Free)
              </div>
              <div>
                <strong>Childline Kenya:</strong>{' '}
                <a href="tel:116" className="text-[#C89D57] font-bold hover:underline">116</a> (Toll-Free)
              </div>
              <div>
                <strong>Emergency Medical/Police:</strong>{' '}
                <a href="tel:999" className="text-[#C89D57] font-bold hover:underline">999</a> / <a href="tel:112" className="text-[#C89D57] font-bold hover:underline">112</a>
              </div>
            </div>
            <button
              onClick={() => navigate('/crisis')}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C89D57] hover:underline cursor-pointer"
            >
              View Full Crisis Guide & Contacts →
            </button>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E3DED6]/60">
          <div className="space-y-1 text-center sm:text-left">
            <div>
              © {new Date().getFullYear()} BeSawa. All rights reserved. Registered psychological service provider in Nairobi, Kenya.
            </div>
            {/* Ma Creatives Studio Attribution with Embedded Link */}
            <div id="ma-creatives-attribution" className="text-xs text-[#E3DED6]/70">
              Digital experience &amp; architecture by{' '}
              <a
                href="https://macreatives.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#DFC085] hover:text-[#C89D57] font-semibold underline underline-offset-4 decoration-[#C89D57]/40 hover:decoration-[#DFC085] transition-colors cursor-pointer"
              >
                Ma Creatives Studio
              </a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
              Terms of Care
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
