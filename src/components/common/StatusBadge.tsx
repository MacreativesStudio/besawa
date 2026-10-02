import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Ban,
  HelpCircle,
} from 'lucide-react';
import { BookingStatus, VerificationStatus, SettlementStatus, PaymentStatus } from '../../types';

type AnyStatus = BookingStatus | VerificationStatus | SettlementStatus | PaymentStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  let config = {
    label: normalized.replace(/_/g, ' '),
    bg: '#F4EFEA',
    text: '#54635B',
    border: '#E3DED6',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
  };

  switch (normalized) {
    case 'VERIFIED':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'PAID':
      config = {
        label: normalized === 'VERIFIED' ? 'Verified Practitioner' : normalized === 'PAID' ? 'Disbursed / Paid' : normalized,
        bg: '#E8F3ED',
        text: '#286E47',
        border: '#286E47',
        icon: normalized === 'VERIFIED' ? <ShieldCheck className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />,
      };
      break;

    case 'PENDING':
    case 'PENDING_PAYMENT':
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    case 'APPROVED':
      config = {
        label: normalized === 'PENDING_PAYMENT' ? 'Awaiting Payment' : normalized === 'UNDER_REVIEW' ? 'Under Review' : normalized === 'SUBMITTED' ? 'Profile Submitted' : normalized,
        bg: '#FAF2E4',
        text: '#9E6B1F',
        border: '#D6A54A',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
      break;

    case 'DRAFT':
    case 'INACTIVE':
    case 'ON_HOLD':
    case 'NO_SHOW':
    case 'EXPIRED':
      config = {
        label: normalized === 'DRAFT' ? 'Draft Profile' : normalized === 'INACTIVE' ? 'Inactive' : normalized,
        bg: '#F4EFEA',
        text: '#78867E',
        border: '#C7BFB3',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      };
      break;

    case 'CANCELLED':
    case 'FAILED':
    case 'PAYMENT_FAILED':
    case 'REJECTED':
    case 'SUSPENDED':
      config = {
        label: normalized === 'PAYMENT_FAILED' ? 'Payment Failed' : normalized,
        bg: '#FCECE9',
        text: '#A63B30',
        border: '#E89086',
        icon: <XCircle className="w-3.5 h-3.5" />,
      };
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${padding}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <span className="shrink-0">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
