import React, { useState } from 'react';
import { Menu, X, Phone, Shield, Search, Calendar, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Therapists', path: '/therapists' },
    { label: 'Packages', path: '/packages' },
    { label: 'Resources', path: '/resources' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Founder', path: '/founder' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const whatsappInquiryUrl = `https://wa.me/254710759422?text=${encodeURIComponent(
    'Hello Be Sawa, I would like to inquire about booking a counselling session.'
  )}`;

  return (
    <header className="w-full bg-[#FBF9F5] border-b border-[#E3DED6] sticky top-0 z-40">
      {/* Calm Emergency Crisis Top Bar */}
      <div className="bg-[#EBF2EE] text-[#2D5A46] text-xs py-1.5 px-4 border-b border-[#2D5A46]/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9E5D43] animate-pulse" />
            <button
              onClick={() => handleNav('/crisis')}
              className="font-bold text-[#1C2420] hover:text-[#9E5D43] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Need immediate crisis support?</span>
              <span className="underline text-[#9E5D43]">Emergency Helplines</span>
            </button>
            <span className="hidden sm:inline text-[#78867E]">•</span>
            <span className="hidden sm:inline text-[#54635B]">
              Toll-Free 24/7:{' '}
              <a href="tel:1199" className="font-bold underline text-[#2D5A46] hover:text-[#1C2420]">
                1199 (Red Cross)
              </a>{' '}
              or{' '}
              <a href="tel:116" className="font-bold underline text-[#9E5D43] hover:text-[#1C2420]">
                116 (Childline)
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNav('/lookup')}
              className="flex items-center gap-1.5 hover:underline font-medium cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNav('/')}
          className="cursor-pointer focus:outline-none"
          aria-label="Be Sawa Home"
        >
          <Logo variant="horizontal" size="md" />
        </button>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-7">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#2D5A46] font-bold border-b-2 border-[#2D5A46] pb-1'
                    : 'text-[#54635B] hover:text-[#1C2420]'
                }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A2F] bg-[#EBF2EE] hover:bg-[#DCE7E1] border border-[#2D5A46]/20 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
            <span>WhatsApp</span>
          </a>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={() => handleNav('/book')}
          >
            Book a Session
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#25D366] bg-[#EBF2EE] rounded-lg"
            aria-label="WhatsApp Direct"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </a>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNav('/book')}
            className="text-xs px-3 py-1.5"
          >
            Book
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#54635B] hover:text-[#1C2420] rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E3DED6] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentPath === link.path
                    ? 'bg-[#EBF2EE] text-[#2D5A46] font-bold'
                    : 'text-[#54635B] hover:bg-[#F4EFEA]'
                }`}
              >
                <span>{link.label}</span>
              </button>
            ))}
            <button
              onClick={() => handleNav('/crisis')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-[#9E5D43] bg-[#FFF8F0] hover:bg-[#FEEFE6] flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#9E5D43] animate-pulse" />
              Crisis & Emergency Help (1199 / 116)
            </button>
            <button
              onClick={() => handleNav('/lookup')}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#54635B] hover:bg-[#F4EFEA] flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#2D5A46]" />
              <span>Lookup Booking</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#E3DED6] flex flex-col gap-2">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Direct WhatsApp (0710 759 422)</span>
            </a>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => handleNav('/book')}
            >
              Book a Counselling Session
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
