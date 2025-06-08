import type { ReactNode } from 'react';

interface Step {
    icon?: ReactNode;
    text: string;
    color?: string;
}

interface ProgressStepsProps {
    title: string;
    titleIcon?: ReactNode;
    steps: Step[];
    className?: string;
}

const ProgressSteps = ({
  title,
  titleIcon,
  steps,
  className = ''
}: ProgressStepsProps) => {
  return (
    <div className={`backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        {titleIcon && <span className="mr-2">{titleIcon}</span>}
        {title}
      </h3>
      <div className="space-y-3 text-sm text-gray-300">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            {step.icon ? (
              <span className="mt-2 flex-shrink-0">{step.icon}</span>
            ) : (
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${step.color || 'bg-blue-400'
                }`}
              />
            )}
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps; 