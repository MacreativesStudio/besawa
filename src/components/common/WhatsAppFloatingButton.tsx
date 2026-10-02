import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  EyeOff,
} from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('general');

  const whatsappNumber = '254710759422';
  const displayPhone = '+254 710 759 422';

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-configured WhatsApp inquiry message topics
  const topics: Record<string, string> = {
    general: 'Hello Be Sawa, I would like to inquire about booking a confidential counselling session.',
    booking: 'Hello Be Sawa, I would like assistance choosing the right counselling service for my needs.',
    couples: 'Hello Be Sawa, I would like to inquire about Emotionally Focused Couples Therapy.',
    pricing: 'Hello Be Sawa, I would like more information on therapy fees, payment, and care packages.',
  };

  const currentMessage = topics[selectedTopic] || topics.general;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(currentMessage)}`;

  // Analytics event logger and dispatcher
  const trackWhatsAppEvent = useCallback((action: string, metadata?: Record<string, unknown>) => {
    const payload = {
      event: 'whatsapp_widget_interaction',
      action,
      screen_width: typeof window !== 'undefined' ? window.innerWidth : null,
      device_tier:
        typeof window !== 'undefined'
          ? window.innerWidth < 640
            ? 'mobile'
            : window.innerWidth < 1024
            ? 'tablet'
            : 'desktop'
          : 'unknown',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      ...metadata,
    };

    // 1. Console log with custom branding
    console.info(
      '%c[Be Sawa Telemetry] WhatsApp Widget Action:%c ' + action,
      'background: #1E3F30; color: #FAF2E4; font-weight: bold; border-radius: 4px; padding: 2px 6px;',
      'color: #2D5A46; font-weight: bold;',
      payload
    );

    // 2. Dispatch custom DOM event for analytics platforms (Google Analytics, GTM, etc.)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('besawa:analytics', {
          detail: payload,
        })
      );
      window.dispatchEvent(
        new CustomEvent('besawa:whatsapp_interaction', {
          detail: payload,
        })
      );
    }
  }, []);

  // External event listener so other parts of the website can open the WhatsApp dialog
  useEffect(() => {
    const handleExternalTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const requestedTopic = customEvent.detail?.topic;
      if (requestedTopic && topics[requestedTopic]) {
        setSelectedTopic(requestedTopic);
      }
      setIsVisible(true);
      setIsOpen(true);
      trackWhatsAppEvent('external_trigger_opened', { detail: customEvent.detail });
    };

    window.addEventListener('besawa:open_whatsapp', handleExternalTrigger);
    return () => {
      window.removeEventListener('besawa:open_whatsapp', handleExternalTrigger);
    };
  }, [trackWhatsAppEvent, topics]);

  // Initial sequence trigger: slide-in smoothly shortly after page load
  useEffect(() => {
    if (isSnoozed) {
      setIsVisible(false);
      return;
    }

    const initialDelay = setTimeout(() => {
      setIsVisible(true);
      trackWhatsAppEvent('initial_slide_in_visible');
    }, 700);

    return () => clearTimeout(initialDelay);
  }, [isSnoozed, trackWhatsAppEvent]);

  // Sequence Controller: Appears and disappears in gentle breathing sequences
  useEffect(() => {
    if (isSnoozed) return;

    if (isOpen || isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (isVisible) {
      // Visible for 18 seconds, then gracefully glides away
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        trackWhatsAppEvent('sequence_hide');
      }, 18000);
    } else {
      // Rests hidden for 22 seconds, then re-emerges with slide-in
      timerRef.current = setTimeout(() => {
        setIsVisible(true);
        trackWhatsAppEvent('sequence_reappear');
      }, 22000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, isOpen, isHovered, isSnoozed, trackWhatsAppEvent]);

  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    trackWhatsAppEvent(nextState ? 'button_click_opened' : 'button_click_closed');
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    trackWhatsAppEvent('topic_selected', { topic: topicId });
  };

  const handleDirectClick = () => {
    trackWhatsAppEvent('direct_whatsapp_link_clicked', {
      topic: selectedTopic,
      destination: whatsappUrl,
    });
    setIsOpen(false);
  };

  const handleSnooze = () => {
    trackWhatsAppEvent('snooze_requested', { duration_minutes: 5 });
    setIsOpen(false);
    setIsVisible(false);
    setIsSnoozed(true);

    setTimeout(() => {
      setIsSnoozed(false);
      setIsVisible(true);
      trackWhatsAppEvent('snooze_expired_resumed');
    }, 5 * 60 * 1000);
  };

  if (isSnoozed) return null;

  return (
    <div
      id="WhatsAppFloatingButton"
      className={`fixed z-40 flex flex-col items-end print:hidden will-change-transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
        /* Dynamic bottom and right scaling to protect mobile navigation and safe areas */
        bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:bottom-6 md:bottom-8 lg:bottom-10
        right-3.5 sm:right-6 md:right-8 lg:right-10
        ${
          isVisible || isOpen
            ? 'opacity-100 translate-y-0 translate-x-0 scale-100 blur-none pointer-events-auto'
            : 'opacity-0 translate-y-8 translate-x-4 scale-90 blur-[2px] pointer-events-none'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanded Care & Inquiry Modal */}
      {isOpen && (
        <div
          id="whatsapp-chat-popup"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-84 max-w-sm bg-white rounded-3xl p-5 border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300 relative text-[#1C2420]"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#EDE9E1]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1E3F30] to-[#2D5A46] text-white flex items-center justify-center shadow-xs border border-[#C89D57]/30 shrink-0">
                <MessageCircle className="w-5 h-5 fill-current text-[#E8D4B0]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold text-[#1C2420]">Be Sawa Sanctuary</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                </div>
                <p className="text-[11px] text-[#54635B] font-medium flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#C89D57]" />
                  <span>Care Coordination Team</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                trackWhatsAppEvent('modal_close_icon_clicked');
              }}
              className="text-[#78867E] hover:text-[#1C2420] p-1.5 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              aria-label="Close WhatsApp chat popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#54635B] leading-relaxed">
            Have a question about beginning therapy or choosing a practitioner? We reply promptly in a calm, pressure-free space.
          </p>

          {/* Quick Select Preset Inquiry Topics */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#78867E]">
              Select What You'd Like to Ask:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'general', label: 'General Inquiry' },
                { id: 'booking', label: 'Help Me Choose' },
                { id: 'couples', label: 'Couples Care' },
                { id: 'pricing', label: 'Fees & Packages' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTopic(t.id)}
                  className={`text-[11px] font-medium py-1.5 px-2.5 rounded-xl border text-left transition-all cursor-pointer truncate ${
                    selectedTopic === t.id
                      ? 'bg-[#EBF2EE] border-[#2D5A46] text-[#2D5A46] font-bold shadow-2xs'
                      : 'bg-[#FAF8F5] border-[#EDE9E1] text-[#54635B] hover:border-[#2D5A46]/40'
                  }`}
                >
                  {selectedTopic === t.id ? '✓ ' : ''}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direct CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirectClick}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E3F30] via-[#244E3B] to-[#173226] hover:from-[#25523E] hover:to-[#1E3F30] text-white font-bold py-3 px-4 rounded-2xl text-xs shadow-md border border-[#C89D57]/30 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current text-[#E8D4B0]" />
            <span>Open WhatsApp ({displayPhone})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E8D4B0]" />
          </a>

          {/* Reassurance & Controls Footer */}
          <div className="pt-2 border-t border-[#EDE9E1] flex items-center justify-between text-[10px] text-[#78867E]">
            <div className="flex items-center gap-1 text-[#286E47] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Strictly Confidential</span>
            </div>

            <button
              type="button"
              onClick={handleSnooze}
              className="inline-flex items-center gap-1 text-[#78867E] hover:text-[#1C2420] transition-colors cursor-pointer"
              title="Hide this button for 5 minutes"
            >
              <EyeOff className="w-3 h-3" />
              <span>Snooze for 5m</span>
            </button>
          </div>
        </div>
      )}

      {/* Small, Elegant Trigger Button with Periodic Pulse Attention Aura */}
      <div className="relative group">
        {/* Subtle periodic aura pulse ring to draw attention without disruption */}
        {!isOpen && isVisible && (
          <>
            <span
              className="absolute -inset-1 sm:-inset-1.5 rounded-2xl sm:rounded-3xl bg-[#C89D57] pointer-events-none animate-subtle-aura opacity-30"
              aria-hidden="true"
            />
            <span
              className="absolute -inset-0.5 rounded-2xl sm:rounded-3xl bg-[#2D5A46] pointer-events-none animate-ping opacity-15 duration-1000"
              aria-hidden="true"
            />
          </>
        )}

        <button
          id="floating-whatsapp-trigger"
          type="button"
          onClick={handleToggleOpen}
          aria-label={isOpen ? 'Close WhatsApp dialog' : 'Open WhatsApp inquiry'}
          className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C89D57]/40 ${
            isOpen
              ? 'bg-[#1C2420] text-white rotate-90 shadow-md'
              : 'bg-gradient-to-br from-[#1E3F30] via-[#244E3B] to-[#173226] hover:from-[#25523E] hover:to-[#1E3F30] text-white border border-[#C89D57]/40 shadow-[#1C2420]/25 hover:scale-105 animate-micro-breathe'
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5 fill-current text-[#FAF2E4]" />
              {/* Discrete Active Presence Pip */}
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#1E3F30]" />
            </>
          )}
        </button>

        {/* Quiet Desktop Hover Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block whitespace-nowrap">
            <div className="bg-[#1C2420]/95 backdrop-blur-xs text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-lg border border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>WhatsApp Inquiry</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
