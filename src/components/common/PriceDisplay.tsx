import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export const PriceDisplay: React.FC<{ amount: number; className?: string; size?: 'default' | 'large' }> = ({ amount, className = '', size = 'default' }) => {
  const { formatPrice, formatBasePrice, isEstimate } = useCurrency();
  return <div className={className}>
    <div className={size === 'large' ? 'text-2xl font-bold text-[#1C2420]' : 'text-lg font-bold text-[#1C2420]'}>{formatPrice(amount)}</div>
    {isEstimate && <div className="text-[11px] text-[#78867E] mt-0.5">≈ {formatBasePrice(amount)} · estimate</div>}
  </div>;
};
