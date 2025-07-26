import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-2 md:flex md:space-x-4 md:space-y-0">
        {steps.map((step, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const status = currentStep > stepNumber ? 'complete' : currentStep === stepNumber ? 'current' : 'upcoming';

          return (
            <li key={step} className="md:flex-1">
              <div className={`group flex flex-col border-l-4 py-2 pl-3 transition-colors md:border-l-0 md:border-t-4 md:pl-0 md:pt-2 md:pb-0 ${
                  status === 'complete' ? 'border-gray-800' :
                  status === 'current' ? 'border-gray-900' :
                  'border-gray-400 hover:border-gray-600'
              }`}>
                <span className={`text-xs font-bold transition-colors font-mono ${
                  status === 'complete' ? 'text-gray-800' :
                  status === 'current' ? 'text-gray-900' :
                  'text-gray-600 group-hover:text-gray-700'
                }`}>
                  Step {stepNumber}
                </span>
                <span className="text-sm font-bold text-gray-900 font-mono">{step}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;