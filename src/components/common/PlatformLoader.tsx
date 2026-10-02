import React from 'react';
import { HeartPulse } from 'lucide-react';

export const PlatformLoader: React.FC = () => (
  <div
    className="min-h-screen bg-[#FBF9F5] text-[#1C2420] flex items-center justify-center px-6"
    role="status"
    aria-live="polite"
    aria-label="Loading Be Sawa"
  >
    <div className="w-full max-w-sm text-center">
      <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#EBF2EE] text-[#2D5A46]">
        <span className="absolute inset-0 rounded-[2rem] border border-[#2D5A46]/30 animate-loader-ring" />
        <HeartPulse className="h-9 w-9 animate-loader-heart" strokeWidth={1.7} aria-hidden="true" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2D5A46]">Be Sawa</p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Preparing your care space</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#54635B]">
        Bringing together trusted support, at your pace.
      </p>
      <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-[#E3DED6]" aria-hidden="true">
        <div className="h-full w-1/2 rounded-full bg-[#2D5A46] animate-loader-progress" />
      </div>
    </div>
  </div>
);
