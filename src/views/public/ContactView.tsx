import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, AlertCircle, Send, CheckCircle2, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../api';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const ContactView: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [selectedLine, setSelectedLine] = useState<'254710759422' | '254745024278'>('254710759422');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate clean, formatted WhatsApp message ready to send
  const generateWhatsAppMessage = (data = formData) => {
    const parts = [
      `*Hello BeSawa Care Sanctuary,* 👋`,
      ``,
      `I am reaching out via the contact form on your website:`,
      `• *Full Name:* ${data.name.trim() || '[Your Name]'}`,
      data.email.trim() ? `• *Email:* ${data.email.trim()}` : null,
      data.phone.trim() ? `• *Phone:* ${data.phone.trim()}` : null,
      `• *Inquiry Topic:* ${data.subject}`,
      ``,
      `*My Message / Request:*`,
      `"${data.message.trim() || 'I would like to inquire about booking a counselling session with BeSawa.'}"`,
      ``,
      `_Sent via BeSawa Mental Wellness Website_`,
    ];
    return parts.filter((p) => p !== null).join('\n');
  };

  const getWhatsAppUrl = (line = selectedLine) => {
    const text = generateWhatsAppMessage(formData);
    return `https://wa.me/${line}?text=${encodeURIComponent(text)}`;
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(generateWhatsAppMessage());
      setCopied(true);
      showToast('WhatsApp message copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter your name.', 'error');
      return;
    }
    if (!formData.message.trim()) {
      showToast('Please enter your message or question.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Log contact entry to database for BeSawa clinical audit records
      await api.submitContact(formData);
    } catch {
      // Graceful fallback: continue to WhatsApp even if background API is offline
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
      showToast('Opening WhatsApp with your ready-to-send message...', 'success');

      // 2. Direct user to WhatsApp with ready-to-send message
      const targetUrl = getWhatsAppUrl(selectedLine);
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9E5D43] bg-[#F7EFEA] px-3 py-1 rounded-full mb-3">
          We Are Here
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
          Get in Touch with BeSawa
        </h1>
        <p className="text-base text-[#54635B] mt-3 leading-relaxed">
          Have questions about starting therapy, our vetted practitioners, or booking corporate/group sessions? Fill out the form below to send a message directly to our WhatsApp care team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Contact Info & Emergency */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED6] shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#1C2420]">Contact Channels</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#78867E]">Phone Lines</div>
                  <div className="text-sm font-bold text-[#1C2420]">
                    <a href="tel:0710759422" className="hover:text-[#2D5A46] transition-colors">0710 759 422</a> /{' '}
                    <a href="tel:0745024278" className="hover:text-[#2D5A46] transition-colors">0745 024 278</a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8F3ED] text-[#286E47] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#78867E]">WhatsApp Care Line</div>
                  <a
                    href="https://wa.me/254710759422?text=Hello%20BeSawa%20Care%20Sanctuary%2C%20I%20would%20like%20to%20inquire%20about%20counselling."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#286E47] hover:underline flex items-center gap-1.5"
                  >
                    <span>+254 710 759 422 (Primary Care Line)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://wa.me/254745024278?text=Hello%20BeSawa%20Care%20Sanctuary%2C%20I%20would%20like%20to%20inquire%20about%20counselling."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#54635B] hover:text-[#286E47] mt-0.5 block"
                  >
                    +254 745 024 278 (Practice Desk)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F7EFEA] text-[#9E5D43] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#78867E]">Email</div>
                  <a
                    href="mailto:infobesawa@gmail.com"
                    className="text-sm font-bold text-[#1C2420] hover:text-[#9E5D43]"
                  >
                    infobesawa@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F4EFEA] text-[#54635B] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#78867E]">Consulting Rooms</div>
                  <div className="text-sm font-medium text-[#1C2420]">
                    Kilimani, Nairobi, Kenya
                  </div>
                  <div className="text-xs text-[#54635B] mt-0.5">
                    Visits are strictly by confirmed appointment
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F4EFEA] text-[#54635B] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#78867E]">Care Coordination Hours</div>
                  <div className="text-sm font-medium text-[#1C2420]">
                    Monday – Saturday: 8:00 AM – 7:00 PM EAT
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Crisis Box */}
          <div className="bg-[#FAF2E4] p-6 rounded-3xl border border-[#D6A54A]/30">
            <div className="flex items-center gap-2 text-[#9E6B1F] mb-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Crisis Emergency Helpline</h4>
            </div>
            <p className="text-xs text-[#1C2420] leading-relaxed">
              If you or someone you know is experiencing acute psychiatric distress or feelings of self-harm, please contact emergency lines immediately:
            </p>
            <div className="mt-3 pt-3 border-t border-[#D6A54A]/30 text-xs font-semibold text-[#1C2420] space-y-1">
              <div>• Kenya Red Cross Toll-Free: <strong>1199</strong></div>
              <div>• Childline Kenya Toll-Free: <strong>116</strong></div>
              <div>• Emergency Police/Ambulance: <strong>999 / 112</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Working Contact Form with Ready-to-Send WhatsApp Integration */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E3DED6] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#1C2420]">Direct WhatsApp Inquiry Form</h3>
                <p className="text-xs text-[#54635B] mt-0.5">
                  Your details are formatted into a ready-to-send WhatsApp message for immediate response.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3ED] text-[#286E47] text-xs font-bold shrink-0 self-start sm:self-center">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                Live on WhatsApp
              </span>
            </div>

            {isSuccess ? (
              <div className="bg-[#FAF8F5] border border-[#25D366]/40 p-6 sm:p-8 rounded-2xl text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center mx-auto shadow-md">
                  <MessageCircle className="w-8 h-8 fill-current" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-[#1C2420]">
                    Inquiry Formatted & Ready to Send!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#54635B] mt-1.5 max-w-md mx-auto">
                    We've prepared your complete message. Click below to continue directly to WhatsApp chat with the Be Sawa care team.
                  </p>
                </div>

                {/* WhatsApp Chat Preview Card */}
                <div className="bg-[#EBF2EE] p-4 rounded-xl text-left border border-[#D5E4DC] max-w-lg mx-auto shadow-inner text-xs font-mono text-[#1C2420] whitespace-pre-wrap leading-relaxed relative">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#2D5A46] mb-2 font-sans flex items-center justify-between">
                    <span>Formatted WhatsApp Message</span>
                    <span className="text-[#25D366] font-bold">Ready to Send</span>
                  </div>
                  {generateWhatsAppMessage()}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={getWhatsAppUrl(selectedLine)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Open in WhatsApp Now ({selectedLine === '254710759422' ? '0710 759 422' : '0745 024 278'})</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F3EDE2] text-[#1C2420] border border-[#E3DED6] font-semibold px-4 py-3 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#286E47]" /> : <Copy className="w-4 h-4 text-[#54635B]" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
                  </button>
                </div>

                {/* Fallback to alternate line */}
                <div className="pt-2 text-xs text-[#54635B] flex flex-wrap items-center justify-center gap-2">
                  <span>Prefer another number?</span>
                  <a
                    href={getWhatsAppUrl(selectedLine === '254710759422' ? '254745024278' : '254710759422')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#286E47] font-bold hover:underline"
                  >
                    Send to {selectedLine === '254710759422' ? '+254 745 024 278 (Practice Desk)' : '+254 710 759 422 (Primary Line)'} →
                  </a>
                </div>

                <div className="pt-4 border-t border-[#E3DED6]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Which WhatsApp Line */}
                <div>
                  <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                    Send Inquiry To:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLine('254710759422')}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        selectedLine === '254710759422'
                          ? 'border-[#25D366] bg-[#F2FAF5] text-[#1C2420] font-semibold ring-1 ring-[#25D366]'
                          : 'border-[#E3DED6] bg-white text-[#54635B] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${selectedLine === '254710759422' ? 'border-[#25D366]' : 'border-gray-300'}`}>
                        {selectedLine === '254710759422' && <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />}
                      </div>
                      <div>
                        <div className="font-bold text-[#1C2420]">0710 759 422</div>
                        <div className="text-[11px] text-[#54635B]">Primary Care &amp; Booking Line</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLine('254745024278')}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        selectedLine === '254745024278'
                          ? 'border-[#25D366] bg-[#F2FAF5] text-[#1C2420] font-semibold ring-1 ring-[#25D366]'
                          : 'border-[#E3DED6] bg-white text-[#54635B] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${selectedLine === '254745024278' ? 'border-[#25D366]' : 'border-gray-300'}`}>
                        {selectedLine === '254745024278' && <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />}
                      </div>
                      <div>
                        <div className="font-bold text-[#1C2420]">0745 024 278</div>
                        <div className="text-[11px] text-[#54635B]">BeSawa Practice Desk</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wanjiku Muthoni"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. wanjiku@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                      Your Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0712345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Booking Assistance">Booking Assistance</option>
                      <option value="Couples Counselling Question">Couples Counselling Question</option>
                      <option value="Child & Adolescent Care">Child & Adolescent Care</option>
                      <option value="Packages & Pricing">Packages & Pricing</option>
                      <option value="Corporate / Group Wellness">Corporate / Group Wellness</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                    Your Message / Question *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you'd like guidance with (e.g., in-person Kilimani vs online, preferred times, or questions about therapy)..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-4 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                  />
                </div>

                {/* Live WhatsApp Message Preview Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className="text-xs font-semibold text-[#286E47] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showLivePreview ? 'Hide Message Preview' : 'Preview Ready-to-Send WhatsApp Message'}</span>
                  </button>

                  {showLivePreview && (
                    <div className="mt-3 p-3.5 bg-[#F2FAF5] rounded-xl border border-[#CDE8D8] text-xs font-mono text-[#1C2420] whitespace-pre-wrap leading-relaxed">
                      {generateWhatsAppMessage()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{isSubmitting ? 'Preparing WhatsApp...' : 'Send Message on WhatsApp'}</span>
                  </button>

                  <a
                    href={getWhatsAppUrl(selectedLine)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-[#F3EDE2] text-[#1C2420] border border-[#E3DED6] font-semibold px-4 py-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <span>Direct Chat Link</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#54635B]" />
                  </a>
                </div>

                <p className="text-[11px] text-[#78867E] pt-1 leading-relaxed">
                  🔒 Submitting this form directly opens WhatsApp with your pre-filled inquiry. No spam, no bot loops — you will chat directly with our human care team coordinators.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
