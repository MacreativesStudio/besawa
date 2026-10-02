import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Smartphone,
  AlertCircle,
  HeartHandshake,
  Download,
  Copy,
  Check,
  MessageCircle,
  RefreshCw,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api';
import { Service, PublicTherapist, AvailabilitySlot, Booking } from '../../types';
import { Button } from '../../components/common/Button';
import { BookingStepper } from '../../components/common/BookingStepper';
import { ResponsiveImage } from '../../components/common/ResponsiveImage';
import { useToast } from '../../context/ToastContext';

interface BookingFlowViewProps {
  initialServiceId?: string;
  initialTherapistId?: string;
  navigate: (path: string) => void;
}

const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Therapist' },
  { id: 3, label: 'Date & Mode' },
  { id: 4, label: 'Time Slot' },
  { id: 5, label: 'Details' },
  { id: 6, label: 'Review' },
  { id: 7, label: 'Request sent' },
];

export const BookingFlowView: React.FC<BookingFlowViewProps> = ({
  initialServiceId,
  initialTherapistId,
  navigate,
}) => {
  const { showToast } = useToast();
  const topContainerRef = useRef<HTMLDivElement>(null);

  // Core wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<PublicTherapist[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>(initialTherapistId || '');
  const [deliveryMode, setDeliveryMode] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Slots state
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Client Details Form
  const [clientDetails, setClientDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    agreedToTerms: false,
  });

  // Created Booking & Payment State
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [whatsappBookingUrl, setWhatsappBookingUrl] = useState('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isPromptingMpesa, setIsPromptingMpesa] = useState(false);
  const [mpesaPromptResult, setMpesaPromptResult] = useState<any>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'STK' | 'MANUAL'>('STK');
  const [manualTransCode, setManualTransCode] = useState('');
  const [copiedTill, setCopiedTill] = useState(false);
  const [copiedReference, setCopiedReference] = useState(false);

  // Scroll to top on step change to prevent stranded/messy page positions
  useEffect(() => {
    if (topContainerRef.current) {
      topContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  // Load initial data
  useEffect(() => {
    Promise.all([api.getServices(), api.getPublicTherapists()])
      .then(([sRes, tRes]) => {
        setServices(sRes.services);
        setTherapists(tRes.therapists);

        if (initialServiceId) {
          setSelectedServiceId(initialServiceId);
        }
        if (initialTherapistId) {
          setSelectedTherapistId(initialTherapistId);
          if (initialServiceId) setCurrentStep(3);
          else setCurrentStep(1);
        }
      })
      .catch(() => {
        showToast('Failed to load booking catalog. Please try again.', 'error');
      })
      .finally(() => setIsLoadingInitial(false));

    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [initialServiceId, initialTherapistId]);

  // Fetch slots whenever Therapist, Service, or Date changes
  useEffect(() => {
    if (!selectedTherapistId || !selectedServiceId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    api
      .getSlots(selectedTherapistId, selectedServiceId, selectedDate)
      .then((res) => {
        setAvailableSlots(res.slots);
      })
      .catch((err) => {
        console.error('Failed fetching slots:', err);
        setAvailableSlots([]);
      })
      .finally(() => setIsLoadingSlots(false));
  }, [selectedTherapistId, selectedServiceId, selectedDate]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedTherapist = therapists.find((t) => t.id === selectedTherapistId);

  const buildDirectWhatsAppUrl = () => {
    const message = [
      'Hello Be Sawa Care Team, I would like to book a counselling session.',
      selectedService && `Service: ${selectedService.name}`,
      selectedTherapist && `Practitioner: ${selectedTherapist.full_name}`,
      selectedDate && `Preferred date: ${selectedDate}`,
      selectedTime && `Preferred time: ${selectedTime} (EAT)`,
      `Format: ${deliveryMode === 'ONLINE' ? 'Online session' : 'In-person session'}`,
      clientDetails.name && `Name: ${clientDetails.name}`,
      clientDetails.phone && `Phone: ${clientDetails.phone}`,
      clientDetails.email && `Email: ${clientDetails.email}`,
      clientDetails.notes && `Note: ${clientDetails.notes}`,
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/254710759422?text=${encodeURIComponent(message)}`;
  };

  // Step 6: Trigger Booking Creation on backend
  const handleProceedToPayment = async () => {
    if (!selectedService || !selectedTherapist || !selectedDate || !selectedTime) {
      showToast('Booking details incomplete.', 'error');
      return;
    }

    // WhatsApp is the primary booking channel. Open it first so a catalog or
    // validation problem can never prevent a client from reaching the care team.
    window.open(buildDirectWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    setIsCreatingBooking(true);
    try {
      const res = await api.createBooking({
        service_id: selectedService.id,
        therapist_id: selectedTherapist.id,
        date: selectedDate,
        time: selectedTime,
        delivery_mode: deliveryMode,
        client_name: clientDetails.name,
        client_phone: clientDetails.phone,
        client_email: clientDetails.email,
        client_notes: clientDetails.notes,
      });

      setCreatedBooking(res.booking);
      setWhatsappBookingUrl(res.whatsappUrl);
      setPaymentPhone(clientDetails.phone);
      setCurrentStep(7);
      showToast('Your booking details have been saved and WhatsApp is ready for you.', 'success');
    } catch (err: any) {
      showToast('WhatsApp has opened with your booking details. The care team can complete your request there.', 'info');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Step 7: Initiate M-Pesa STK Push
  const handleInitiateMpesa = async () => {
    if (!createdBooking || !paymentPhone) {
      showToast('Phone number required for M-Pesa.', 'error');
      return;
    }

    setIsPromptingMpesa(true);
    try {
      const res = await api.initiateMpesaStk(createdBooking.id, paymentPhone);
      setMpesaPromptResult(res);
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch M-Pesa prompt.', 'error');
    } finally {
      setIsPromptingMpesa(false);
    }
  };

  // Verify Payment (Both for STK completion and Manual Till transaction code)
  const handleVerifyPayment = async () => {
    if (!createdBooking) return;
    setIsVerifyingPayment(true);
    try {
      const res = await api.verifyMpesaTest(createdBooking.id, manualTransCode.trim() || undefined);
      showToast(res.message, 'success');
      setCreatedBooking(res.result.booking);
      setCurrentStep(8);
    } catch (err: any) {
      showToast(err.message || 'Payment verification failed. Please check details or retry.', 'error');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const copyToClipboard = (text: string, type: 'till' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'till') {
      setCopiedTill(true);
      setTimeout(() => setCopiedTill(false), 2000);
    } else {
      setCopiedReference(true);
      setTimeout(() => setCopiedReference(false), 2000);
    }
    showToast('Copied to clipboard', 'info');
  };

  if (isLoadingInitial) {
    return (
      <div className="py-28 flex flex-col items-center justify-center text-[#54635B]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2D5A46] mb-4" />
        <p className="text-sm font-medium">Preparing booking environment...</p>
      </div>
    );
  }

  return (
    <div ref={topContainerRef} className="py-8 md:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stepper Header */}
      <div className="mb-8">
        {/* WhatsApp Fast-Track Banner */}
        <div className="mb-6 p-4 bg-[#EBF2EE] border border-[#2D5A46]/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1C2420]">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-bold text-[#2D5A46]">Prefer an immediate conversation?</span>
              <p className="text-[11px] text-[#54635B]">Our care coordination team can assist you with your booking directly on WhatsApp.</p>
            </div>
          </div>
          <a
            href={`https://wa.me/254710759422?text=${encodeURIComponent(
              `Hello Be Sawa, I would like to book a counselling session${
                selectedService ? ` for ${selectedService.name}` : ''
              }${selectedTherapist ? ` with ${selectedTherapist.full_name}` : ''}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Book on WhatsApp (0710 759 422)</span>
          </a>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2420] text-center mb-1">
          Book a Psychological Session
        </h1>
        <p className="text-xs sm:text-sm text-[#54635B] text-center max-w-lg mx-auto">
          Confidential appointment scheduling with licensed practitioners in Nairobi & online. Clear, upfront rates with flexible payment options.
        </p>

        <div className="mt-6">
          <BookingStepper
            currentStep={currentStep}
            steps={STEPS}
            onStepClick={(id) => {
              if (id < currentStep && currentStep < 7) {
                setCurrentStep(id);
              }
            }}
          />
        </div>
      </div>

      {/* STEP CONTAINER */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3DED6] shadow-sm">
        {/* ================================================================= */}
        {/* STEP 1: SELECT SERVICE */}
        {/* ================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1C2420]">1. Choose a Service</h2>
              <p className="text-xs text-[#54635B] mt-1">
                Select the therapy discipline that best matches what you are navigating.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((s) => {
                const isSelected = selectedServiceId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2D5A46] bg-[#EBF2EE] ring-2 ring-[#2D5A46]'
                        : 'border-[#E3DED6] hover:border-[#78867E] bg-[#FBF9F5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#9E5D43] uppercase tracking-wider">
                          {s.category_name}
                        </span>
                        <span className="text-xs font-bold text-[#1C2420]">
                          {s.currency} {s.price.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#1C2420] mb-1">{s.name}</h3>
                      <p className="text-xs text-[#54635B] line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E3DED6] flex items-center justify-between mt-3 text-xs text-[#78867E]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {s.duration_minutes} Minutes
                      </span>
                      <span className="font-semibold text-[#2D5A46]">
                        {isSelected ? '✓ Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-3 z-20 -mx-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 rounded-2xl border border-[#EDE9E1] bg-white/95 p-3 shadow-lg backdrop-blur">
              <Button
                variant="primary"
                size="md"
                disabled={!selectedServiceId}
                onClick={() => setCurrentStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Continue to Therapist
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: SELECT THERAPIST */}
        {/* ================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#1C2420]">2. Select Your Therapist</h2>
                <p className="text-xs text-[#54635B] mt-1">
                  Every practitioner is thoroughly vetted and holds verified credentials.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)} className="self-start sm:self-auto">
                Change Service
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapists.map((t) => {
                const isSelected = selectedTherapistId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTherapistId(t.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2D5A46] bg-[#EBF2EE] ring-2 ring-[#2D5A46]'
                        : 'border-[#E3DED6] hover:border-[#78867E] bg-[#FBF9F5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-3.5">
                        <div className="w-20 h-24 rounded-2xl overflow-hidden border border-[#C89D57]/30 shadow-xs shrink-0 bg-[#FAF8F5]">
                          <ResponsiveImage
                            src={t.profile_photo_url || ''}
                            alt={`Portrait of ${t.full_name}`}
                            fallbackType="person"
                            aspectRatio="portrait"
                            className="w-full h-full object-cover"
                            imageClassName="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#286E47] mb-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>
                              {t.verification_status === 'VERIFIED'
                                ? 'Board Verified'
                                : 'Approved Practitioner'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#1C2420] truncate">{t.full_name}</h3>
                          <p className="text-xs text-[#54635B] truncate mt-0.5">{t.title}</p>
                          <div className="text-[11px] text-[#78867E] mt-1">
                            {t.years_experience}+ Yrs Exp • {t.languages.join(', ')}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#54635B] line-clamp-2 leading-relaxed mb-3">
                        {t.bio}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {t.areas_of_practice.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white text-[#54635B] px-2 py-0.5 rounded border border-[#EDE9E1]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E3DED6] flex items-center justify-between text-xs text-[#78867E]">
                      <span>{t.years_experience}+ Years Experience</span>
                      <span className="font-semibold text-[#2D5A46]">
                        {isSelected ? '✓ Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-3 z-20 -mx-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-[#EDE9E1] bg-white/95 p-3 shadow-lg backdrop-blur">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!selectedTherapistId}
                onClick={() => setCurrentStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Continue to Format & Date
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: DELIVERY MODE & DATE */}
        {/* ================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1C2420]">3. Mode & Consultation Date</h2>
              <p className="text-xs text-[#54635B] mt-1">
                Choose how and when you would like to connect with {selectedTherapist?.full_name}.
              </p>
            </div>

            {/* Mode selection */}
            <div>
              <label className="block text-xs font-bold text-[#1C2420] mb-2 uppercase tracking-wider">
                Select Session Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('ONLINE')}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                    deliveryMode === 'ONLINE'
                      ? 'border-[#2D5A46] bg-[#EBF2EE] ring-2 ring-[#2D5A46]'
                      : 'border-[#E3DED6] bg-[#FBF9F5]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2D5A46] shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1C2420]">Online Video / Audio</div>
                    <div className="text-xs text-[#54635B] mt-0.5">
                      Encrypted telehealth link sent directly to your email/SMS.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode('IN_PERSON')}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                    deliveryMode === 'IN_PERSON'
                      ? 'border-[#2D5A46] bg-[#EBF2EE] ring-2 ring-[#2D5A46]'
                      : 'border-[#E3DED6] bg-[#FBF9F5]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#9E5D43] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1C2420]">In-Person Consulting Rooms</div>
                    <div className="text-xs text-[#54635B] mt-0.5">
                      Private, tranquil clinic rooms located in Kilimani, Nairobi.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-bold text-[#1C2420] mb-2 uppercase tracking-wider">
                Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full max-w-sm bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-3 text-sm font-semibold text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
              />
              <p className="text-xs text-[#78867E] mt-1.5">
                Appointments can be booked up to 30 days in advance.
              </p>
            </div>

            <div className="sticky bottom-3 z-20 -mx-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-[#EDE9E1] bg-white/95 p-3 shadow-lg backdrop-blur">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!selectedDate}
                onClick={() => setCurrentStep(4)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                View Available Slots
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: TIME SLOT SELECTION */}
        {/* ================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1C2420]">4. Select a Time Slot</h2>
              <p className="text-xs text-[#54635B] mt-1">
                Real-time slots for {selectedTherapist?.full_name} on{' '}
                <strong className="text-[#1C2420]">{selectedDate}</strong>.
              </p>
            </div>

            {isLoadingSlots ? (
              <div className="py-16 flex flex-col items-center justify-center text-[#54635B]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
                <p className="text-xs">Computing live calendar availability...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="py-12 text-center bg-[#FBF9F5] rounded-2xl border border-[#E3DED6] p-6">
                <AlertCircle className="w-8 h-8 text-[#9E6B1F] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#1C2420]">No Slots Available on this Date</h4>
                <p className="text-xs text-[#54635B] mt-1">
                  {selectedTherapist?.full_name} is fully booked or unavailable on {selectedDate}.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                  className="mt-4"
                >
                  Choose Another Date
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        !slot.available
                          ? 'bg-[#F4EFEA] border-[#EDE9E1] text-[#78867E]/50 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#2D5A46] bg-[#2D5A46] text-white font-bold ring-2 ring-[#2D5A46]'
                          : 'border-[#E3DED6] bg-[#FBF9F5] text-[#1C2420] hover:border-[#2D5A46] font-semibold cursor-pointer'
                      }`}
                    >
                      <div className="text-sm">{slot.formattedTime}</div>
                      <div className="text-[10px] mt-0.5">
                        {slot.available ? 'Available' : slot.reason || 'Booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="sticky bottom-3 z-20 -mx-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-[#EDE9E1] bg-white/95 p-3 shadow-lg backdrop-blur">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(3)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!selectedTime}
                onClick={() => setCurrentStep(5)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Enter Details
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: CLIENT DETAILS */}
        {/* ================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1C2420]">5. Your Confidential Details</h2>
              <p className="text-xs text-[#54635B] mt-1">
                We collect only essential contact info. In line with clinical ethics, no sensitive diagnostic history is requested here.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wangari Maathai"
                  value={clientDetails.name}
                  onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                    Phone Number (Safaricom / M-Pesa) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0712345678"
                    value={clientDetails.phone}
                    onChange={(e) => setClientDetails({ ...clientDetails, phone: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                  />
                  <span className="text-[11px] text-[#78867E]">Used for M-Pesa STK push and SMS confirmation</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                    Email Address (optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. wangari@example.com"
                    value={clientDetails.email}
                    onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                  />
                  <span className="text-[11px] text-[#78867E]">Optional: where a calendar invite can be sent</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                  Brief Note for Therapist (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Managing workplace anxiety, navigating a life transition... (Keep brief and general)"
                  value={clientDetails.notes}
                  onChange={(e) => setClientDetails({ ...clientDetails, notes: e.target.value })}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3.5 text-sm text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                />
              </div>

              {/* Terms check */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientDetails.agreedToTerms}
                    onChange={(e) =>
                      setClientDetails({ ...clientDetails, agreedToTerms: e.target.checked })
                    }
                    className="w-4 h-4 text-[#2D5A46] rounded mt-0.5 focus:ring-[#2D5A46]"
                  />
                  <span className="text-xs text-[#54635B] leading-relaxed">
                    I understand this is a scheduled psychological counseling consultation. I understand that Be Sawa is not an emergency casualty triage facility, and I agree to the 24-hour cancellation policy.
                  </span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-3 z-20 -mx-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-[#EDE9E1] bg-white/95 p-3 shadow-lg backdrop-blur">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(4)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={
                  !clientDetails.name ||
                  !clientDetails.phone ||
                  !clientDetails.agreedToTerms
                }
                onClick={() => setCurrentStep(6)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Review Summary
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 6: REVIEW SUMMARY */}
        {/* ================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1C2420]">6. Review Booking Summary</h2>
              <p className="text-xs text-[#54635B] mt-1">
                Please verify your session details before sending your request to the Be Sawa care team on WhatsApp.
              </p>
            </div>

            <div className="bg-[#FBF9F5] rounded-2xl p-6 border border-[#E3DED6] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#EDE9E1]">
                <div>
                  <span className="text-xs text-[#78867E]">Service</span>
                  <div className="text-base font-bold text-[#1C2420]">{selectedService?.name}</div>
                  <div className="text-xs text-[#54635B]">{selectedService?.duration_minutes} Minutes Duration</div>
                </div>

                <div>
                  <span className="text-xs text-[#78867E]">Licensed Therapist</span>
                  <div className="text-base font-bold text-[#1C2420]">{selectedTherapist?.full_name}</div>
                  <div className="text-xs text-[#54635B]">{selectedTherapist?.title}</div>
                </div>

                <div>
                  <span className="text-xs text-[#78867E]">Date & Time</span>
                  <div className="text-base font-bold text-[#1C2420]">
                    {selectedDate} at {selectedTime}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[#78867E]">Delivery Mode</span>
                  <div className="text-base font-bold text-[#1C2420]">
                    {deliveryMode === 'ONLINE' ? 'Online Telehealth (Encrypted Link)' : 'In-Person (Kilimani, Nairobi)'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#EDE9E1]">
                <div>
                  <span className="text-xs text-[#78867E]">Client Name</span>
                  <div className="text-sm font-semibold text-[#1C2420]">{clientDetails.name}</div>
                </div>
                <div>
                  <span className="text-xs text-[#78867E]">Contact Details</span>
                  <div className="text-sm font-semibold text-[#1C2420]">
                    {clientDetails.phone} • {clientDetails.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs text-[#78867E]">Payable Session Fee</div>
                  <div className="text-2xl font-black text-[#2D5A46]">
                    {selectedService?.currency} {selectedService?.price.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-xs text-[#54635B]">
                  <span className="font-semibold text-[#1C2420]">WhatsApp confirmation</span>
                  <div className="text-[11px] text-[#78867E]">Payment is verified with the care team</div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-3 z-20 -mx-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-[#EDE9E1] bg-white/95 p-3 shadow-lg backdrop-blur">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(5)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Edit Details
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isCreatingBooking}
                onClick={handleProceedToPayment}
                rightIcon={<CreditCard className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Continue to WhatsApp
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 7: M-PESA PAYMENT (REDESIGNED, CLEAN & BALANCED) */}
        {/* ================================================================= */}
        {false && currentStep === 7 && createdBooking && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE9E1]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A46]">
                  Step 7 of 8: Secure Checkout
                </span>
                <h2 className="text-2xl font-bold text-[#1C2420] mt-0.5">Safaricom M-Pesa Payment</h2>
                <p className="text-xs text-[#54635B]">
                  Booking Reference:{' '}
                  <span className="font-mono font-bold text-[#2D5A46]">{createdBooking.booking_reference}</span>
                </p>
              </div>

              <div className="bg-[#FBF9F5] px-4 py-2.5 rounded-2xl border border-[#EDE9E1] text-right sm:text-right">
                <span className="text-[11px] text-[#78867E] uppercase block font-semibold">Amount to Pay</span>
                <span className="text-xl font-black text-[#2D5A46]">
                  {createdBooking.currency} {createdBooking.amount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setPaymentMethodTab('STK')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  paymentMethodTab === 'STK'
                    ? 'bg-[#2D5A46] text-white border-[#2D5A46] shadow-sm'
                    : 'bg-[#FBF9F5] text-[#54635B] border-[#E3DED6] hover:bg-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>M-Pesa STK Prompt</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethodTab('MANUAL')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  paymentMethodTab === 'MANUAL'
                    ? 'bg-[#2D5A46] text-white border-[#2D5A46] shadow-sm'
                    : 'bg-[#FBF9F5] text-[#54635B] border-[#E3DED6] hover:bg-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy Goods Till (Manual)</span>
              </button>
            </div>

            {/* Tab 1: STK Push Mode */}
            {paymentMethodTab === 'STK' && (
              <div className="max-w-xl mx-auto bg-[#FBF9F5] p-6 sm:p-8 rounded-2xl border border-[#E3DED6] space-y-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1C2420]">Express STK Push Prompt</h3>
                  <p className="text-xs text-[#54635B]">
                    Enter your Safaricom number. We will send an instant payment request directly to your phone screen.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                    M-Pesa Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-white border border-[#E3DED6] rounded-xl px-4 py-3 text-sm font-semibold text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  isLoading={isPromptingMpesa}
                  onClick={handleInitiateMpesa}
                  className="w-full"
                  leftIcon={<Smartphone className="w-4 h-4" />}
                >
                  Send STK Prompt to Phone
                </Button>

                {mpesaPromptResult && (
                  <div className="bg-[#E8F3ED] border border-[#286E47] p-4 rounded-xl space-y-2 text-xs text-[#1C2420]">
                    <div className="flex items-center gap-2 font-bold text-[#286E47]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>STK Prompt Dispatched to {paymentPhone}</span>
                    </div>
                    <p className="text-[#54635B] leading-relaxed">
                      Please unlock your phone, enter your 4-digit M-Pesa PIN, and tap send. Once completed, click the verification button below.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-[#EDE9E1] space-y-2">
                  <span className="text-[11px] text-[#78867E] block text-center">
                    Entered your PIN? Click to confirm and receive your receipt.
                  </span>
                  <Button
                    variant="secondary"
                    size="md"
                    isLoading={isVerifyingPayment}
                    onClick={handleVerifyPayment}
                    className="w-full"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    I Have Entered My PIN — Verify Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 2: Manual Till Payment Mode */}
            {paymentMethodTab === 'MANUAL' && (
              <div className="max-w-xl mx-auto bg-[#FBF9F5] p-6 sm:p-8 rounded-2xl border border-[#E3DED6] space-y-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1C2420]">Pay via Lipa na M-Pesa Till</h3>
                  <p className="text-xs text-[#54635B]">
                    Follow these simple steps from your Safaricom SIM Toolkit or M-Pesa App:
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#EDE9E1] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#78867E] uppercase font-bold">Buy Goods Till Number</div>
                      <div className="text-2xl font-black text-[#2D5A46] tracking-wider">174379</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('174379', 'till')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EBF2EE] text-[#2D5A46] hover:bg-[#D8E6DE] transition-colors cursor-pointer"
                    >
                      {copiedTill ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTill ? 'Copied' : 'Copy Till'}</span>
                    </button>
                  </div>
                  <div className="pt-2 border-t border-[#EDE9E1] text-xs text-[#54635B] space-y-1">
                    <div>1. Go to <strong>M-Pesa</strong> &gt; <strong>Lipa na M-Pesa</strong> &gt; <strong>Buy Goods and Services</strong></div>
                    <div>2. Enter Till Number: <strong>174379</strong></div>
                    <div>3. Enter Amount: <strong>KES {createdBooking.amount?.toLocaleString()}</strong></div>
                    <div>4. Enter your PIN and confirm payment</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
                    M-Pesa Transaction Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualTransCode}
                    onChange={(e) => setManualTransCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SLK89204KJ"
                    className="w-full bg-white border border-[#E3DED6] rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
                  />
                  <span className="text-[11px] text-[#78867E]">Found in your Safaricom SMS receipt</span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  isLoading={isVerifyingPayment}
                  onClick={handleVerifyPayment}
                  className="w-full"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Verify Transaction & Finalize Booking
                </Button>
              </div>
            )}

            {/* Bottom Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#EDE9E1]">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(6)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Back to Review Summary
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-[#54635B]">
                <ShieldCheck className="w-4 h-4 text-[#286E47]" />
                <span>Protected by Safaricom Daraja 256-bit TLS Encryption</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 7: WHATSAPP-LED REQUEST CONFIRMATION */}
        {/* ================================================================= */}
        {currentStep === 7 && createdBooking && (
          <div className="space-y-8 max-w-2xl mx-auto animate-fade-in">
            {/* Header Status */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#E8F3ED] text-[#286E47] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#286E47]">
                Booking Request Received
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1C2420]">
                Thank You for Reaching Out
              </h2>
              <p className="text-xs sm:text-sm text-[#54635B] max-w-md mx-auto">
                Your request is with the Be Sawa care team. Please message us on WhatsApp so we can confirm availability, payment, and next steps with you.
              </p>
            </div>

            {/* Prominent Reference & Summary Card */}
            <div className="bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 border-2 border-[#2D5A46]/30 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE9E1]">
                <div>
                  <span className="text-[11px] font-bold text-[#78867E] uppercase tracking-wider">
                    Booking Reference Number
                  </span>
                  <div className="text-2xl font-mono font-black text-[#2D5A46] tracking-wider mt-0.5">
                    {createdBooking.booking_reference}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdBooking.booking_reference, 'ref')}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E3DED6] hover:border-[#2D5A46] text-[#1C2420] transition-colors cursor-pointer"
                >
                  {copiedReference ? <Check className="w-4 h-4 text-[#286E47]" /> : <Copy className="w-4 h-4 text-[#78867E]" />}
                  <span>{copiedReference ? 'Reference Copied' : 'Copy Reference'}</span>
                </button>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[#78867E] font-medium">Therapy Service:</span>
                  <div className="font-bold text-[#1C2420] text-sm">{selectedService?.name}</div>
                  <div className="text-[#54635B]">{selectedService?.duration_minutes} Minutes Duration</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[#78867E] font-medium">Practitioner:</span>
                  <div className="font-bold text-[#1C2420] text-sm">{selectedTherapist?.full_name}</div>
                  <div className="text-[#54635B]">{selectedTherapist?.title}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[#78867E] font-medium">Session Date & Time:</span>
                  <div className="font-bold text-[#1C2420] text-sm">
                    {createdBooking.date} at {createdBooking.time}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[#78867E] font-medium">Format:</span>
                  <div className="font-bold text-[#1C2420] text-sm">
                    {createdBooking.delivery_mode === 'ONLINE'
                      ? 'Online Telehealth (Encrypted Link)'
                      : 'In-Person (Kilimani, Nairobi Rooms)'}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[#78867E] font-medium">Client:</span>
                  <div className="font-semibold text-[#1C2420]">{clientDetails.name}</div>
                  <div className="text-[#54635B]">{clientDetails.phone} • {clientDetails.email}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[#78867E] font-medium">Care-team confirmation:</span>
                  <div className="inline-flex items-center gap-1.5 font-bold text-[#9E6B1F] bg-[#FAF2E4] px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending — {createdBooking.currency} {createdBooking.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next - 3 Step Guidance */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE9E1] space-y-3 text-left">
              <h3 className="text-sm font-bold text-[#1C2420]">What happens next?</h3>
              <div className="space-y-2 text-xs text-[#54635B]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EBF2EE] text-[#2D5A46] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong>Message our care team:</strong> Send your booking reference on WhatsApp so we can confirm the requested slot and guide you on payment.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EBF2EE] text-[#2D5A46] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong>Receive confirmation:</strong> We will confirm your practitioner, time, format, and any joining or location details before your appointment.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EBF2EE] text-[#2D5A46] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong>Need to change something?</strong> Keep this reference and contact us on WhatsApp. We will help with any change before the appointment is confirmed.
                  </div>
                </div>
              </div>
            </div>

            {/* Pristine Responsive Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/lookup')}
                leftIcon={<FileText className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                View in Lookup Portal
              </Button>

              <a
                href={whatsappBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Booking to WhatsApp</span>
              </a>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto"
              >
                Return to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
