import { FormField } from '@/components';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { BusinessData } from '@/types/business';
import { Sparkles } from 'lucide-react';

interface ManualEntryFormProps {
    businessData: Partial<BusinessData>;
    canGenerate: boolean;
    onBackToSearch: () => void;
    onBusinessDataChange: (field: keyof BusinessData, value: string) => void;
    onGenerateLandingPage: () => void;
}

const ManualEntryForm = ({
  businessData,
  canGenerate,
  onBackToSearch,
  onBusinessDataChange,
  onGenerateLandingPage
}: ManualEntryFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-white">Business Details</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToSearch}
          className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
                    ← Back to Search
        </Button>
      </div>

      <div className="space-y-4">
        <FormField
          label="Business Name"
          id="businessName"
          value={businessData.name || ''}
          onChange={(value) => onBusinessDataChange('name', value)}
          placeholder="Your business name"
          required
          className="text-left"
        />

        <FormField
          label="Business Type"
          id="businessType"
          value={businessData.type || ''}
          onChange={(value) => onBusinessDataChange('type', value)}
          className="text-left"
          required
          placeholder="e.g., Restaurant, Retail Store, Service Provider"
        />

        <FormField
          label="Address"
          id="address"
          value={businessData.address || ''}
          onChange={(value) => onBusinessDataChange('address', value)}
          placeholder="Full business address"
          className="text-left"
          required
        />

        <FormField
          label="Phone Number"
          id="phone"
          value={businessData.phone || ''}
          onChange={(value) => onBusinessDataChange('phone', value)}
          placeholder="Business phone number"
          className="text-left"
          required
        />

        <FormField
          label="Business Description"
          id="description"
          type="textarea"
          value={businessData.description || ''}
          onChange={(value) => onBusinessDataChange('description', value)}
          placeholder="Brief description of your business and services"
          className="text-left"
          required
        />

        <Button
          onClick={onGenerateLandingPage}
          disabled={!canGenerate}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Landing Page with AI
        </Button>
      </div>
    </div>
  );
};

export default ManualEntryForm; 