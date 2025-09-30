import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress" className="mb-6">
      <ol role="list" className="flex space-x-1">
        {steps.map((step, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const status = currentStep > stepNumber ? 'complete' : currentStep === stepNumber ? 'current' : 'upcoming';

          return (
            <li key={step} className="flex-1">
              <div className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                  status === 'complete' ? 'bg-emerald-50 border border-emerald-200' :
                  status === 'current' ? 'bg-blue-50 border border-blue-200 shadow-sm' :
                  'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                  status === 'complete' ? 'bg-emerald-100 text-emerald-700' :
                  status === 'current' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {status === 'complete' ? '✓' : stepNumber}
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${
                  status === 'complete' ? 'text-emerald-700' :
                  status === 'current' ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;