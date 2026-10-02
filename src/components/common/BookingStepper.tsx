import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface BookingStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (stepId: number) => void;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({
  currentStep,
  steps,
  onStepClick,
}) => {
  return (
    <div className="w-full py-4">
      {/* Mobile progress indicator */}
      <div className="md:hidden flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-xs text-[#54635B] font-medium">
          {steps[currentStep - 1]?.label}
        </span>
      </div>
      <div className="md:hidden w-full bg-[#E3DED6] h-1.5 rounded-full overflow-hidden mb-4">
        <div
          className="bg-[#2D5A46] h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Desktop step pill sequence */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#E3DED6] -z-0" />

        {steps.map((s) => {
          const isCompleted = currentStep > s.id;
          const isCurrent = currentStep === s.id;
          const isUpcoming = currentStep < s.id;

          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                disabled={isUpcoming || !onStepClick}
                onClick={() => onStepClick && isCompleted && onStepClick(s.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCompleted
                    ? 'bg-[#2D5A46] text-white cursor-pointer'
                    : isCurrent
                    ? 'bg-[#2D5A46] text-white ring-4 ring-[#EBF2EE]'
                    : 'bg-white border-2 border-[#E3DED6] text-[#78867E] cursor-not-allowed'
                }`}
                aria-label={`Step ${s.id}: ${s.label}`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.id}
              </button>
              <span
                className={`text-xs mt-2 font-medium text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#2D5A46] font-bold'
                    : isCompleted
                    ? 'text-[#1C2420]'
                    : 'text-[#78867E]'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
