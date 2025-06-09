import { ProgressSteps } from '@/components';
import { Bot } from 'lucide-react';

const AIFeaturesInfo = () => {
  const aiSteps = [
    {
      text: 'Our AI analyzes your business type and location for unique insights',
      color: 'bg-blue-400'
    },
    {
      text: 'Creates custom content, colors, and layout specifically for your business',
      color: 'bg-purple-400'
    },
    {
      text: 'Generates a professional landing page in under 30 seconds',
      color: 'bg-green-400'
    }
  ];

  return (
    <ProgressSteps
      title="What happens next?"
      titleIcon={<Bot className="w-5 h-5 text-blue-400" />}
      steps={aiSteps}
      className="mt-8"
    />
  );
};

export default AIFeaturesInfo; 