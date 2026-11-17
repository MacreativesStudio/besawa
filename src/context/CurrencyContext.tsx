import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const supportedCurrencies = [
  { code: 'KES', label: 'Kenyan Shilling', rateFromKes: 1 },
  { code: 'USD', label: 'US Dollar', rateFromKes: 1 / 129 },
  { code: 'EUR', label: 'Euro', rateFromKes: 1 / 140 },
  { code: 'GBP', label: 'British Pound', rateFromKes: 1 / 166 },
  { code: 'CAD', label: 'Canadian Dollar', rateFromKes: 1 / 93 },
  { code: 'AUD', label: 'Australian Dollar', rateFromKes: 1 / 84 },
  { code: 'AED', label: 'UAE Dirham', rateFromKes: 1 / 35 },
] as const;

type CurrencyCode = (typeof supportedCurrencies)[number]['code'];
interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (kesAmount: number) => string;
  formatBasePrice: (kesAmount: number) => string;
  isEstimate: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const storageKey = 'be-sawa-display-currency';

function formatCurrency(amount: number, code: CurrencyCode) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', maximumFractionDigits: code === 'KES' ? 0 : 2 }).format(amount);
}

export const CurrencyProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('KES');
  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as CurrencyCode | null;
    if (saved && supportedCurrencies.some((item) => item.code === saved)) setCurrencyState(saved);
  }, []);
  const setCurrency = (nextCurrency: CurrencyCode) => {
    setCurrencyState(nextCurrency);
    window.localStorage.setItem(storageKey, nextCurrency);
  };
  const value = useMemo<CurrencyContextValue>(() => {
    const selected = supportedCurrencies.find((item) => item.code === currency)!;
    return { currency, setCurrency, formatPrice: (kesAmount) => formatCurrency(kesAmount * selected.rateFromKes, currency), formatBasePrice: (kesAmount) => `KES ${Math.round(kesAmount).toLocaleString('en-KE')}`, isEstimate: currency !== 'KES' };
  }, [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
