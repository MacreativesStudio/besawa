import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Package } from '../../types';
import { Button } from '../common/Button';
import { PriceDisplay } from '../common/PriceDisplay';
import { useCurrency } from '../../context/CurrencyContext';

interface PackageCardProps {
  pkg: Package;
  onSelect: (pkg: Package) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect }) => {
  const perSession = Math.round(pkg.price / pkg.number_of_sessions);
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white rounded-2xl p-7 border border-[#E3DED6] shadow-sm hover:border-[#2D5A46] transition-all flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#2D5A46]" />
          Care Pathway • {pkg.number_of_sessions} Sessions
        </div>

        <h3 className="text-xl font-bold text-[#1C2420] mb-2">{pkg.name}</h3>
        <p className="text-sm text-[#54635B] leading-relaxed mb-6">
          {pkg.description}
        </p>

        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2 text-sm text-[#1C2420]">
            <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0" />
            <span>Structured continuity with your dedicated therapist</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#1C2420]">
            <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0" />
            <span>Flexible scheduling across {pkg.validity_days} days</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#1C2420]">
            <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0" />
            <span>{formatPrice(perSession)} / session effective rate</span>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#EDE9E1] flex items-center justify-between">
        <div>
          <div className="text-xs text-[#78867E]">Complete Package</div>
          <PriceDisplay amount={pkg.price} size="large" />
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onSelect(pkg)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Select Pathway
        </Button>
      </div>
    </div>
  );
};
