import { Bot } from 'lucide-react';

interface GenerationProgressProps {
  isGenerating: boolean;
  currentStage: string;
  progress: number;
  logs: string[];
}

function GenerationProgress({ isGenerating, currentStage, progress, logs }: GenerationProgressProps) {
  if (!isGenerating) return null;

  return (
    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl mb-8">
      <div className="text-center mb-6">
        <Bot className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-semibold text-white mb-2">Fast AI Creating Your Landing Page</h2>
        <p className="text-gray-300">Our optimized AI system is generating your unique business page in seconds</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Generation Progress</span>
            <span className="text-green-400 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Stage */}
        <div className="text-center">
          <p className="text-green-400 font-medium capitalize">
            {currentStage.replace('_', ' ')}
          </p>
        </div>

        {/* Agent Logs */}
        <div className="bg-black/20 rounded-lg p-4 max-h-32 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-gray-300 text-sm mb-1 opacity-80">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GenerationProgress; 