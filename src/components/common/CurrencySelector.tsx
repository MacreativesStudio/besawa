import React from 'react';
import { ChevronDown, Globe2 } from 'lucide-react';
import { supportedCurrencies, useCurrency } from '../../context/CurrencyContext';

export const CurrencySelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currency, setCurrency } = useCurrency();
  return <label title="Choose display currency" className={`relative inline-flex items-center text-[#2D5A46] ${compact ? 'rounded-lg border border-[#2D5A46]/15 bg-[#EBF2EE] px-1.5 py-1.5' : 'rounded-xl border border-[#2D5A46]/20 bg-[#EBF2EE] px-2.5 py-2'}`}>
    <Globe2 className="w-4 h-4 shrink-0" aria-hidden="true" />
    <select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className={`appearance-none bg-transparent font-bold focus:outline-none cursor-pointer ${compact ? 'text-sm pl-1 pr-5' : 'text-xs pl-1.5 pr-5'}`} aria-label="Display prices in">
      {supportedCurrencies.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
    </select>
    <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-1.5" aria-hidden="true" />
  </label>;
};
