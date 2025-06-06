import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { BusinessData } from '@/types/business';
import { ContentGenerationRequest, GeneratedContent } from '@/types/content';

function ContentGeneration() {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [request, setRequest] = useState<ContentGenerationRequest>({
    businessData: {} as BusinessData,
    tone: 'professional',
    style: 'modern'
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateContent } = useContentGeneration();

  useEffect(() => {
    // Get business data from URL params
    const params = new URLSearchParams(window.location.search);
    const businessDataParam = params.get('businessData');
    
    if (businessDataParam) {
      try {
        const data = JSON.parse(businessDataParam);
        setBusinessData(data);
        setRequest(prev => ({ ...prev, businessData: data }));
      } catch (error) {
        console.error('Failed to parse business data:', error);
        navigate('/onboarding');
      }
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  const handleGenerate = async () => {
    if (!businessData) return;
    
    setIsGenerating(true);
    try {
      console.log('🚀 Generating content with automatic AI theme...');
      const content = await generateContent(request);
      setGeneratedContent(content);
      console.log('✅ Content and AI theme generated successfully');
    } catch (error) {
      console.error('Failed to generate content:', error);
      // Could add error state here
    } finally {
      setIsGenerating(false);
    }
  };

  const updateRequest = (field: keyof ContentGenerationRequest, value: string) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleContinueToEditor = () => {
    if (generatedContent) {
      const params = new URLSearchParams({
        businessData: JSON.stringify(businessData),
        generatedContent: JSON.stringify(generatedContent)
      });
      navigate(`/editor?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-white font-bold text-xl">
          Landify
        </div>
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => navigate('/onboarding')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Business Info
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center p-8 pt-20">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Content & Design
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Generation
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Our AI will create unique content and design for your landing page
            </p>
          </div>

          {businessData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Content Customization */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl">
                <h2 className="text-2xl font-semibold text-white mb-6">Content Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="tone" className="text-white">Tone & Voice</Label>
                    <Select value={request.tone} onValueChange={(value) => updateRequest('tone', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="style" className="text-white">Design Style</Label>
                    <Select value={request.style} onValueChange={(value) => updateRequest('style', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience" className="text-white">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      placeholder="Describe your ideal customers..."
                      value={request.targetAudience || ''}
                      onChange={(e) => updateRequest('targetAudience', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialRequests" className="text-white">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any specific requirements or focus areas..."
                      value={request.specialRequests || ''}
                      onChange={(e) => updateRequest('specialRequests', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Business Preview & AI Features */}
              <div className="space-y-8">
                {/* Business Info Preview */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl">
                  <h3 className="text-xl font-semibold text-white mb-4">Business Overview</h3>
                  <div className="space-y-3 text-gray-300">
                    <p><span className="text-white font-medium">Name:</span> {businessData.name}</p>
                    <p><span className="text-white font-medium">Type:</span> {businessData.type}</p>
                    <p><span className="text-white font-medium">Location:</span> {businessData.address}</p>
                    {businessData.rating && (
                      <p><span className="text-white font-medium">Rating:</span> {businessData.rating}/5 ({businessData.reviews} reviews)</p>
                    )}
                  </div>
                </div>

                {/* AI Features Info */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl">
                  <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white font-medium">Smart Content Generation</p>
                        <p className="text-gray-400 text-sm">AI creates tailored copy based on your business type and preferences</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white font-medium">Automatic Design Themes</p>
                        <p className="text-gray-400 text-sm">Unique color schemes and layouts generated for each business</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white font-medium">Industry Optimization</p>
                        <p className="text-gray-400 text-sm">Content and design optimized for your specific industry</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Controls */}
          <div className="mt-12 text-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !businessData}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-4 text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating with AI...
                </>
              ) : (
                <>
                  ✨ Generate Landing Page with AI
                </>
              )}
            </Button>
            
            {isGenerating && (
              <div className="mt-4 text-gray-300 text-sm">
                <p>🎨 Creating unique design theme...</p>
                <p>📝 Generating custom content...</p>
                <p>⚡ Optimizing for your industry...</p>
              </div>
            )}
          </div>

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className="mt-12 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Generated Content Preview</h3>
                <div className="flex items-center space-x-2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm font-medium">AI Generated</span>
                </div>
              </div>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h4 className="text-white font-medium mb-2">Headline</h4>
                  <p className="text-lg">{generatedContent.headline}</p>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Subheadline</h4>
                  <p>{generatedContent.subheadline}</p>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Key Value Propositions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedContent.valuePropositions.slice(0, 3).map((prop, index) => (
                      <li key={index}>{prop}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">AI Design Theme</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div 
                        className="w-6 h-6 rounded border-2 border-white/20"
                        style={{ backgroundColor: generatedContent.theme.colors.primary }}
                        title="Primary Color"
                      ></div>
                      <div 
                        className="w-6 h-6 rounded border-2 border-white/20"
                        style={{ backgroundColor: generatedContent.theme.colors.secondary }}
                        title="Secondary Color"
                      ></div>
                      <div 
                        className="w-6 h-6 rounded border-2 border-white/20"
                        style={{ backgroundColor: generatedContent.theme.colors.accent }}
                        title="Accent Color"
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400">{generatedContent.theme.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <Button
                  onClick={handleContinueToEditor}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Continue to Editor & Preview
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentGeneration; 