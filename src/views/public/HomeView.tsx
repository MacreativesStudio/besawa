import React, { useEffect, useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Video,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
  Phone,
  MessageCircle,
  Users,
  Smile,
  GraduationCap,
  Sparkle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api';
import { Service, PublicTherapist, Package, Testimonial } from '../../types';
import { Button } from '../../components/common/Button';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { TherapistCard } from '../../components/cards/TherapistCard';
import { SwipableTherapistShowcase } from '../../components/therapists/SwipableTherapistShowcase';
import { PackageCard } from '../../components/cards/PackageCard';

interface HomeViewProps {
  navigate: (path: string, params?: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<PublicTherapist[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const primaryPhone = '0710759422';
  const displayPhone = '0710 759 422';
  const whatsappUrl = `https://wa.me/254${primaryPhone}?text=${encodeURIComponent(
    'Hello Be Sawa, I would like to inquire about booking a counselling session.'
  )}`;

  useEffect(() => {
    Promise.all([
      api.getServices(),
      api.getPublicTherapists(),
      api.getPackages(),
      api.getTestimonials(),
    ])
      .then(([sRes, tRes, pRes, testRes]) => {
        setServices(sRes.services);
        setTherapists(tRes.therapists);
        setPackages(pRes.packages);
        setTestimonials(testRes.testimonials);
      })
      .catch((err) => console.error('Failed loading home data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 border-b border-[#E3DED6] bg-[#FBF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3.5 py-1.5 rounded-full border border-[#2D5A46]/20">
                <HeartHandshake className="w-4 h-4 text-[#2D5A46]" />
                <span>Safe Space. Real Talk. Lasting Change.</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C2420] tracking-tight leading-[1.15]">
                A safe space to <span className="text-[#2D5A46]">breathe</span>, heal, and <span className="text-[#9E5D43]">become</span>.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-[#54635B] leading-relaxed max-w-2xl">
                Compassionate, confidential, and professional psychological support for <strong>kids, teens, and adults</strong> in Nairobi and online across Kenya. Led by verified licensed practitioners.
              </p>

              {/* Value / Confidentiality Highlight */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#1C2420] font-medium bg-white/80 p-3.5 rounded-2xl border border-[#EDE9E1]">
                <span className="inline-flex items-center gap-1.5 text-[#2D5A46] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#286E47]" />
                  Licensed & Confidential:
                </span>
                <span>Kids • Teens • Adults</span>
                <span className="hidden sm:inline text-[#EDE9E1]">•</span>
                <span className="text-[#78867E] text-xs">In-person Nairobi & Telehealth nationwide</span>
              </div>

              {/* Primary Dual Conversion CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  id="hero-whatsapp-cta"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Book via WhatsApp ({displayPhone})</span>
                </a>

                <Button
                  id="hero-booking-cta"
                  variant="primary"
                  size="lg"
                  leftIcon={<Calendar className="w-5 h-5" />}
                  onClick={() => navigate('/book')}
                >
                  Schedule Online
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#E3DED6]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C2420]">
                  <ShieldCheck className="w-4 h-4 text-[#286E47] shrink-0" />
                  <span>Verified Kenyan Psychologists</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C2420]">
                  <Lock className="w-4 h-4 text-[#2D5A46] shrink-0" />
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C2420] col-span-2 sm:col-span-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#286E47] shrink-0" />
                  <span>Kids • Teens • Adults</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E1]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#C89D57]/40 shadow-xs bg-[#FAF8F5] shrink-0">
                        <img
                          src="/besawa-emblem.jpg"
                          alt="BeSawa Mental Wellness"
                          loading="eager"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.endsWith('/besawa-emblem.jpg')) {
                              target.src = '/images/brand/besawa-emblem.jpg';
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#1C2420]">BeSawa Care Sanctuary</h4>
                        <p className="text-xs text-[#54635B]">Licensed Psychological Practice</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-[#FAF2E4] text-[#9E6B1F] px-2.5 py-1 rounded-full">
                      Accepting Clients
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smile className="w-4 h-4 text-[#2D5A46]" />
                        <span className="text-xs font-medium text-[#1C2420]">Kids Emotional Care (Ages 6–12)</span>
                      </div>
                      <span className="text-xs font-semibold text-[#54635B]">45–60 min</span>
                    </div>
                    <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-[#9E5D43]" />
                        <span className="text-xs font-medium text-[#1C2420]">Teen & Adolescent Support (13–17)</span>
                      </div>
                      <span className="text-xs font-semibold text-[#54635B]">45–60 min</span>
                    </div>
                    <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-[#2D5A46]" />
                        <span className="text-xs font-medium text-[#1C2420]">Individual Adult Therapy (18+)</span>
                      </div>
                      <span className="text-xs font-semibold text-[#54635B]">45–60 min</span>
                    </div>
                  </div>

                  {/* Gentle Reassurance */}
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EDE9E1] text-xs text-[#54635B] leading-relaxed">
                    <strong className="text-[#2D5A46]">Our promise to you:</strong> No clinical judgment, no rush. We provide a calm, dignified sanctuary to unpack what hurts and rediscover balance.
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={() => navigate('/book')}
                    >
                      Book Session
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      onClick={() => navigate('/services')}
                    >
                      All Services
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE PILLARS: KIDS, TEENS, ADULTS */}
      <section className="py-16 md:py-20 bg-white border-b border-[#E3DED6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9E5D43]">
              Specialized Care at Every Stage of Life
            </div>
            <h2 className="text-3xl font-extrabold text-[#1C2420] tracking-tight">
              Better Minds. Brighter Futures.
            </h2>
            <p className="text-sm text-[#54635B]">
              Mental wellness is not one-size-fits-all. Our therapeutic methodologies adapt to the emotional world of childhood, adolescence, and adulthood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Kids */}
            <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#EDE9E1] hover:border-[#2D5A46]/30 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
                  <Smile className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9E5D43]">Ages 6 to 12</span>
                  <h3 className="text-xl font-bold text-[#1C2420]">Kids Emotional Care</h3>
                </div>
                <p className="text-sm text-[#54635B] leading-relaxed">
                  Helping children express, understand & manage their emotions through play, creative communication, gentle validation, and parent alignment.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Big Feelings</span>
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">School Anxiety</span>
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Behavioral Changes</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#EDE9E1] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#54635B]">45–60 min session</span>
                <button
                  onClick={() => navigate('/services')}
                  className="text-xs font-bold text-[#2D5A46] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pillar 2: Teens */}
            <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#EDE9E1] hover:border-[#9E5D43]/30 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF2E4] text-[#9E6B1F] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9E5D43]">Ages 13 to 17</span>
                  <h3 className="text-xl font-bold text-[#1C2420]">Teen & Adolescent Therapy</h3>
                </div>
                <p className="text-sm text-[#54635B] leading-relaxed">
                  Supporting teens through life challenges, identity & confidence, peer pressure, academic anxiety, and navigating family communication.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Identity & Self-Worth</span>
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Exam Stress</span>
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Social Pressure</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#EDE9E1] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#54635B]">45–60 min session</span>
                <button
                  onClick={() => navigate('/services')}
                  className="text-xs font-bold text-[#2D5A46] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pillar 3: Adults */}
            <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#EDE9E1] hover:border-[#2D5A46]/30 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9E5D43]">Ages 18 and Above</span>
                  <h3 className="text-xl font-bold text-[#1C2420]">Individual Adult Therapy</h3>
                </div>
                <p className="text-sm text-[#54635B] leading-relaxed">
                  Guiding adults to overcome anxiety, chronic burnout, emotional baggage, and relationship transitions to live deeply fulfilling, balanced lives.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Anxiety & Burnout</span>
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Relationship Healing</span>
                  <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#EDE9E1] text-[#1C2420]">Life Transitions</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#EDE9E1] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#54635B]">45–60 min session</span>
                <button
                  onClick={() => navigate('/services')}
                  className="text-xs font-bold text-[#2D5A46] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ALL CORE SERVICES */}
      <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#E3DED6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#9E5D43] mb-2">
                Our Counselling Disciplines
              </div>
              <h2 className="text-3xl font-extrabold text-[#1C2420] tracking-tight">
                Counselling tailored to your unique journey
              </h2>
              <p className="text-sm text-[#54635B] mt-2 max-w-xl">
                Every person experiences life through their own story. We offer evidence-based individual, couples, adolescent, and child counselling at an accessible fee.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/services')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Full Details
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={(serviceId) => navigate('/book', { serviceId })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. MEET OUR THERAPISTS (SWIPABLE PROFILE SHOWCASE) */}
      <section className="py-16 md:py-24 bg-white border-b border-[#E3DED6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SwipableTherapistShowcase
            therapists={therapists}
            onSelectTherapist={(therapistId) => navigate('/book', { therapistId })}
            title="Meet your support team"
            subtitle="Explore our verified Kenyan psychological counsellors. Each practitioner provides warm relational safety, confidentiality, and evidence-based clinical care."
            showFounderHighlight={false}
          />

          {/* Low-Key Founder Vision Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/founder')}
              className="text-xs font-semibold text-[#54635B] hover:text-[#2D5A46] inline-flex items-center gap-1.5 cursor-pointer underline transition-colors"
            >
              <span>Learn about Be Sawa's founding vision with Muthoni Maina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. HOW BE SAWA WORKS (4 CALM STEPS) */}
      <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#E3DED6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9E5D43]">
              Simple & Pressure-Free
            </div>
            <h2 className="text-3xl font-extrabold text-[#1C2420] tracking-tight">
              How Be Sawa works for you
            </h2>
            <p className="text-sm text-[#54635B]">
              Starting therapy should feel grounding, not complicated. We have designed a transparent, gentle four-step path to support your wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#EDE9E1] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-[#1C2420]">Choose Your Support</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                Explore whether you need individual adult therapy, teen guidance, kids emotional support, or couples relationship alignment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EDE9E1] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#9E5D43] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-[#1C2420]">Connect on WhatsApp or Web</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                Reach out via WhatsApp ({displayPhone}) or book through our minimal, privacy-conscious scheduler in under 2 minutes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EDE9E1] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-[#1C2420]">Consult In-Person or Online</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                Meet your therapist in our serene Nairobi consultation rooms or join a confidential video session from anywhere in Kenya.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EDE9E1] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#9E5D43] text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-[#1C2420]">Heal, Grow & Become</h3>
              <p className="text-xs text-[#54635B] leading-relaxed">
                Experience real, lasting change with structured check-ins, evidence-based coping tools, and empathetic psychological accompaniment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CARE PATHWAYS / PACKAGES */}
      <section className="py-16 md:py-24 bg-white border-b border-[#E3DED6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9E5D43]">
              Sustained Healing
            </div>
            <h2 className="text-3xl font-extrabold text-[#1C2420] tracking-tight">
              Curated Wellness Pathways
            </h2>
            <p className="text-sm text-[#54635B]">
              True personal transformation takes rhythm. Our multi-session care pathways offer dedicated therapist continuity, structured goals, and bundle savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {packages.slice(0, 2).map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={() => navigate('/packages')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE BE SAWA */}
      <section className="py-16 md:py-20 bg-[#FAF7F2] border-b border-[#E3DED6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#2D5A46]">
                The Be Sawa Distinction
              </div>
              <h2 className="text-3xl font-extrabold text-[#1C2420] tracking-tight">
                Why Nairobi trusts Be Sawa for mental wellness
              </h2>
              <p className="text-sm text-[#54635B] leading-relaxed">
                We bridge clinical excellence with deep human warmth. Whether you are dealing with quiet anxiety, acute burnout, or helping your child through a difficult transition, you will find genuine understanding here.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#2D5A46] hover:underline cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  Ask us anything on WhatsApp ({displayPhone})
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] space-y-2">
                <ShieldCheck className="w-6 h-6 text-[#2D5A46]" />
                <h4 className="text-sm font-bold text-[#1C2420]">100% Confidential</h4>
                <p className="text-xs text-[#54635B]">
                  Privileged client confidentiality protected under the Kenya Data Protection Act 2019.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] space-y-2">
                <HeartHandshake className="w-6 h-6 text-[#9E5D43]" />
                <h4 className="text-sm font-bold text-[#1C2420]">Culturally Grounded</h4>
                <p className="text-xs text-[#54635B]">
                  Therapy that understands the realities, family expectations, and nuances of Kenyan life.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] space-y-2">
                <Clock className="w-6 h-6 text-[#2D5A46]" />
                <h4 className="text-sm font-bold text-[#1C2420]">Accessible & Transparent</h4>
                <p className="text-xs text-[#54635B]">
                  Clear, upfront session fees with zero hidden intake costs, sliding options, and structured multi-session pathways.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EDE9E1] space-y-2">
                <Video className="w-6 h-6 text-[#9E5D43]" />
                <h4 className="text-sm font-bold text-[#1C2420]">Flexible Formats</h4>
                <p className="text-xs text-[#54635B]">
                  Choose between serene in-person rooms in Nairobi or secure end-to-end encrypted video calls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-16 md:py-20 bg-white border-b border-[#E3DED6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold text-[#1C2420] tracking-tight">
              Voices of Healing
            </h2>
            <p className="text-sm text-[#54635B]">
              Anonymized client feedback reflecting real therapeutic journeys with Be Sawa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#EDE9E1] shadow-sm flex flex-col justify-between">
                <p className="text-sm text-[#1C2420] italic leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-[#EDE9E1] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D5A46]">{t.client_alias}</span>
                  <span className="text-[11px] text-[#78867E]">{t.session_category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. EMPATHETIC CLOSING CTA BANNER */}
      <section className="py-16 bg-[#2D5A46] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            You don't have to carry it all alone.
          </h2>
          <p className="text-base text-[#EBF2EE] max-w-2xl mx-auto leading-relaxed">
            Let's talk. Let's heal. Let's grow together. Connect directly with our compassionate care team today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              id="footer-whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>WhatsApp: {displayPhone}</span>
            </a>

            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Calendar className="w-5 h-5" />}
              onClick={() => navigate('/book')}
            >
              Book an Appointment
            </Button>

            <a
              href={`tel:${primaryPhone}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
            >
              <Phone className="w-4 h-4 text-[#C89D57]" />
              <span>Call: {displayPhone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
