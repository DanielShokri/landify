import type { ReactNode } from 'react';

interface BusinessInformationFormProps {
    children: ReactNode;
    className?: string;
}

const BusinessInformationForm = ({ children, className = '' }: BusinessInformationFormProps) => {
  return (
    <div className={`backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Business Information</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default BusinessInformationForm; 