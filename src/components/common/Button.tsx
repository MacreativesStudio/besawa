import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
  };

  const variantClasses = {
    primary:
      'bg-[#2D5A46] text-white hover:bg-[#234838] shadow-sm disabled:bg-[#54635B]/30 disabled:text-white/60 focus-visible:ring-2 focus-visible:ring-[#2D5A46] focus-visible:ring-offset-2',
    secondary:
      'bg-[#9E5D43] text-white hover:bg-[#854D36] shadow-sm disabled:bg-[#9E5D43]/40 focus-visible:ring-2 focus-visible:ring-[#9E5D43] focus-visible:ring-offset-2',
    outline:
      'bg-transparent border border-[#E3DED6] text-[#1C2420] hover:bg-[#F4EFEA] hover:border-[#78867E] disabled:border-[#E3DED6]/50 disabled:text-[#78867E]/40',
    ghost:
      'bg-transparent text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] disabled:text-[#78867E]/40',
    destructive:
      'bg-[#A63B30] text-white hover:bg-[#8A2E25] shadow-sm disabled:bg-[#A63B30]/40 focus-visible:ring-2 focus-visible:ring-[#A63B30] focus-visible:ring-offset-2',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="mr-2 shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon ? <span className="ml-2 shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
