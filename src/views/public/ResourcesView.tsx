import React from 'react';
import {
  BookOpen,
  Video,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

interface ResourcesViewProps {
  navigate: (path: string, params?: any) => void;
}

interface ResourceItem {
  id: string;
  title: string;
  category: 'Article' | 'Guide' | 'Workshop Insight';
  readTime: string;
  description: string;
  keyTakeaway: string;
  actionLabel: string;
  format: 'read' | 'pdf' | 'video';
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ navigate }) => {
  // Real approved V1 psychoeducational resources
  const resources: ResourceItem[] = [
    {
      id: 'res_understanding_therapy',
      title: 'What Actually Happens in Your First Counselling Session?',
      category: 'Guide',
      readTime: '4 min read',
      description:
        'Demystifying the therapy room. A transparent walkthrough of intake, confidentiality boundaries, pacing, and what you can expect during your initial appointment.',
      keyTakeaway:
        'You are never forced to unpack trauma immediately; safety and nervous system regulation always come first.',
      actionLabel: 'Read Complete Guide',
      format: 'read',
    },
    {
      id: 'res_teens_anxiety',
      title: 'Supporting Your Adolescent Child Through Academic & Social Pressure',
      category: 'Article',
      readTime: '5 min read',
      description:
        'Grounded guidance for parents navigating adolescent emotional withdrawal, school performance stress, and sensory overload in contemporary Nairobi.',
      keyTakeaway:
        'Teens rarely open up when questioned face-to-face; car rides and side-by-side activities create less pressure.',
      actionLabel: 'Read Article',
      format: 'read',
    },
    {
      id: 'res_couples_communication',
      title: 'Breaking the Conflict Loop: Moving from Criticism to Relational Safety',
      category: 'Article',
      readTime: '6 min read',
      description:
        'Exploring how Emotionally Focused Therapy (EFT) helps partners identify defensive triggers, de-escalate shouting, and hear unspoken attachment needs.',
      keyTakeaway:
        'Marriages rarely struggle because love is absent, but because defensive cycles drown out emotional vulnerability.',
      actionLabel: 'Read Article',
      format: 'read',
    },
    {
      id: 'res_somatic_grounding',
      title: 'Five Grounding Practices for Sudden Panic and Stress Overwhelm',
      category: 'Guide',
      readTime: '3 min read',
      description:
        'Practical, evidence-backed nervous system resets (5-4-3-2-1 sensory grounding, box breathing, and physiological sighs) you can use anywhere.',
      keyTakeaway:
        'Panic is physiological; engage the body and vagus nerve before attempting cognitive reasoning.',
      actionLabel: 'View Exercises',
      format: 'read',
    },
  ];

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3.5 py-1.5 rounded-full">
          <BookOpen className="w-3.5 h-3.5 text-[#2D5A46]" />
          <span>Psychoeducational Library</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1C2420] tracking-tight">
          Mental Wellness Resources &amp; Guides
        </h1>
        <p className="text-base text-[#54635B] leading-relaxed">
          Clear, grounded reflections on mental health, parenting, emotional agility, and relationship care from our clinical team.
        </p>
      </div>

      {/* Featured Visual Resource: Be Sawa Community Psychoeducational Poster */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3DED6] shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm rounded-2xl overflow-hidden border-2 border-[#C89D57]/40 shadow-lg ring-4 ring-[#FAF2E4] bg-[#FAF8F5]">
              <img
                src="/images/resources/besawapost.jpg?v=20261002"
                alt="Be Sawa Mental Wellness Community Poster"
                loading="eager"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('/images/resources/besawapost.jpg')) {
                    target.src = '/besawapost.jpg?v=20261002';
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-[#2D5A46] shadow-sm flex items-center gap-1.5 border border-[#E3DED6]">
                <Sparkles className="w-3.5 h-3.5 text-[#C89D57]" />
                Official Be Sawa Resource
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E6B1F] bg-[#FAF2E4] px-3.5 py-1.5 rounded-full border border-[#E8D4B0]/60">
              <Sparkles className="w-3.5 h-3.5" />
              Community Infographic &amp; Guide
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2420] tracking-tight">
              Be Sawa Community Awareness &amp; Healing Guide
            </h2>

            <p className="text-sm text-[#54635B] leading-relaxed">
              Designed for families, schools, and individuals across Kenya, this comprehensive visual guide provides immediate grounding techniques, destigmatizes mental wellness, and outlines accessible paths to professional psychological care.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1]">
                <strong className="text-[#2D5A46] block font-bold mb-0.5">Compassionate Guidance:</strong>
                <span className="text-[#54635B]">Clear indicators for when to seek counseling for anxiety, grief, and life transitions.</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE9E1]">
                <strong className="text-[#2D5A46] block font-bold mb-0.5">Safe &amp; Confidential:</strong>
                <span className="text-[#54635B]">Culturally respectful care honoring client autonomy and dignity.</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a
                href="/images/resources/besawapost.jpg?v=20261002"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#2D5A46] text-white hover:bg-[#1E3E30] transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                View Full Poster (High-Res)
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/therapists')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Meet Our Practitioners
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] shadow-xs flex flex-col justify-between hover:border-[#2D5A46]/30 hover:shadow-md transition-all space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#9E5D43] uppercase tracking-wider bg-[#FFF8F0] px-3 py-1 rounded-full border border-[#9E5D43]/20">
                  {item.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[#78867E]">
                  <Clock className="w-3.5 h-3.5" />
                  {item.readTime}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#1C2420] leading-snug">
                {item.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#54635B] leading-relaxed">
                {item.description}
              </p>

              {/* Key Takeaway Pill */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EDE9E1] text-xs text-[#1C2420]">
                <strong className="text-[#2D5A46] block mb-0.5">Core Principle:</strong>
                <span className="italic text-[#54635B]">"{item.keyTakeaway}"</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDE9E1] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#286E47] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Clinical Insight</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/services')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Explore Support
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking CTA Banner */}
      <div className="bg-[#EBF2EE] p-8 sm:p-10 rounded-3xl border border-[#2D5A46]/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="text-xl font-bold text-[#1C2420]">
            Ready to Speak with a Licensed Practitioner?
          </h3>
          <p className="text-xs sm:text-sm text-[#54635B] max-w-xl">
            Educational articles offer clarity, but real healing unfolds in relationship. Connect with our verified counselors today.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/book')}
          leftIcon={<Calendar className="w-4 h-4" />}
          className="shrink-0"
        >
          Book a Session
        </Button>
      </div>
    </div>
  );
};
