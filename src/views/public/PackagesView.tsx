import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Package } from '../../types';
import { PackageCard } from '../../components/cards/PackageCard';
import { Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface PackagesViewProps {
  navigate: (path: string, params?: any) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({ navigate }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getPackages()
      .then((res) => {
        setPackages(res.packages);
      })
      .catch((err) => console.error('Failed loading packages:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9E5D43] bg-[#F7EFEA] px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#9E5D43]" />
          Care Pathways & Bundles
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
          Sustained Mental Wellness Journeys
        </h1>
        <p className="text-base text-[#54635B] mt-3 leading-relaxed">
          Therapeutic healing is an unfolding relationship, not a one-off quick fix. Our structured packages provide predictable continuity with your chosen practitioner, scheduled accountability, and discounted session rates.
        </p>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#2D5A46]" />
          <p className="text-sm">Loading care pathways...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={() => navigate('/book')}
            />
          ))}
        </div>
      )}

      {/* Package Benefits Details */}
      <div className="bg-white rounded-3xl p-8 border border-[#E3DED6] shadow-sm">
        <h3 className="text-xl font-bold text-[#1C2420] mb-6">What is included in every Be Sawa Pathway?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-[#1C2420]">Dedicated Practitioner</h4>
            <p className="text-xs text-[#54635B] leading-relaxed">
              You work with the same trusted therapist throughout your entire journey. You never have to re-explain your story from scratch.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-[#1C2420]">Flexible Rescheduling</h4>
            <p className="text-xs text-[#54635B] leading-relaxed">
              We understand life happens in Nairobi. Reschedule up to 24 hours prior to session time directly with no forfeit.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-[#1C2420]">Continuity Plan & Takeaways</h4>
            <p className="text-xs text-[#54635B] leading-relaxed">
              Personalized reflective exercises, grounding techniques, and structured milestones between each session.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#EDE9E1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#54635B]">
            <ShieldCheck className="w-4 h-4 text-[#286E47]" />
            <span>All sessions are fully protected under Kenyan psychological clinical privacy guidelines.</span>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/book')}
          >
            Start Your Pathway
          </Button>
        </div>
      </div>
    </div>
  );
};
