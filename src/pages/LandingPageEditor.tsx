import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratedContent } from '@/types/content';
import { BusinessData } from '@/types/business';
import { landingPageStorage } from '@/lib/landingPageStorage';

function LandingPageEditor() {
  const [searchParams] = useSearchParams();
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    // Check if we have a UUID-based route first
    if (pageId) {
      try {
        const landingPageData = landingPageStorage.getLandingPage(pageId);
        
        if (landingPageData) {
          setBusinessData(landingPageData.businessData);
          setContent(landingPageData.content);
          setCurrentPageId(pageId);
        } else {
          console.error('Landing page not found:', pageId);
          navigate('/generate');
        }
      } catch (error) {
        console.error('Failed to load landing page:', error);
        navigate('/generate');
      }
    } else {
      // Fallback to old parameter-based approach for backwards compatibility
      const businessDataParam = searchParams.get('businessData');
      const generatedContentParam = searchParams.get('generatedContent');
      
      if (businessDataParam && generatedContentParam) {
        try {
          const parsedBusinessData = JSON.parse(businessDataParam);
          const parsedContent = JSON.parse(generatedContentParam);
          setBusinessData(parsedBusinessData);
          setContent(parsedContent);
          setCurrentPageId(null); // No existing page ID
        } catch (error) {
          console.error('Failed to parse data:', error);
          navigate('/generate');
        }
      } else {
        navigate('/generate');
      }
    }
  }, [pageId, searchParams, navigate]);

  if (!businessData || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-white">Loading...</h2>
          <p className="text-gray-400">Preparing your content editor</p>
        </div>
      </div>
    );
  }

  const updateContent = (section: keyof GeneratedContent, value: any) => {
    setContent(prev => prev ? ({ ...prev, [section]: value }) : null);
  };

  const updateValueProposition = (index: number, value: string) => {
    const newProps = [...content.valuePropositions];
    newProps[index] = value;
    updateContent('valuePropositions', newProps);
  };

  const addValueProposition = () => {
    updateContent('valuePropositions', [...content.valuePropositions, 'New value proposition']);
  };

  const removeValueProposition = (index: number) => {
    const newProps = content.valuePropositions.filter((_, i) => i !== index);
    updateContent('valuePropositions', newProps);
  };

  const handleSave = () => {
    if (content && businessData) {
      let savedPageId: string;
      
      if (currentPageId) {
        // Update existing page
        const success = landingPageStorage.updateLandingPage(currentPageId, businessData, content);
        if (success) {
          savedPageId = currentPageId;
        } else {
          console.error('Failed to update landing page');
          return;
        }
      } else {
        // Create new page
        savedPageId = landingPageStorage.saveLandingPage(businessData, content);
      }
      
      // Navigate to clean UUID-based URL
      navigate(`/page/${savedPageId}`);
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
            onClick={() => navigate('/pages')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Pages
          </button>
          <Button 
            onClick={() => navigate(`/page/${currentPageId || 'preview'}`)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            View Live Page
          </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Content
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Editor
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Customize your {businessData.name} landing page content
          </p>
        </div>

        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl shadow-2xl">
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10 border border-white/20">
                <TabsTrigger 
                  value="edit" 
                  className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  ✏️ Edit Content
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  👁️ Live Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-8">
                {/* Hero Section */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Hero Section</h3>
                      <p className="text-gray-400 text-sm">The first thing visitors see</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="headline" className="text-white">Main Headline</Label>
                      <Input
                        id="headline"
                        value={content.headline}
                        onChange={(e) => updateContent('headline', e.target.value)}
                        placeholder="Enter your main headline"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subheadline" className="text-white">Supporting Subheadline</Label>
                      <Textarea
                        id="subheadline"
                        value={content.subheadline}
                        onChange={(e) => updateContent('subheadline', e.target.value)}
                        placeholder="Supporting message that explains your value"
                        rows={3}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Value Propositions */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">⭐</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Value Propositions</h3>
                        <p className="text-gray-400 text-sm">Why customers should choose you</p>
                      </div>
                    </div>
                    <Button
                      onClick={addValueProposition}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      + Add Value
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {content.valuePropositions.map((prop, index) => (
                      <div key={index} className="flex space-x-3">
                        <Input
                          value={prop}
                          onChange={(e) => updateValueProposition(index, e.target.value)}
                          placeholder={`Value proposition ${index + 1}`}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeValueProposition(index)}
                          className="border-red-400/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">🛠️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Services & Offerings</h3>
                      <p className="text-gray-400 text-sm">What you provide to customers</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {content.services.map((service, index) => (
                      <div key={index} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="space-y-3">
                          <Input
                            value={service.name}
                            onChange={(e) => {
                              const newServices = [...content.services];
                              newServices[index] = { ...service, name: e.target.value };
                              updateContent('services', newServices);
                            }}
                            placeholder="Service name"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                          />
                          <Textarea
                            value={service.description}
                            onChange={(e) => {
                              const newServices = [...content.services];
                              newServices[index] = { ...service, description: e.target.value };
                              updateContent('services', newServices);
                            }}
                            placeholder="Describe this service"
                            rows={2}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">📖</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">About Your Business</h3>
                      <p className="text-gray-400 text-sm">Tell your story and build trust</p>
                    </div>
                  </div>
                  <Textarea
                    value={content.aboutSection}
                    onChange={(e) => updateContent('aboutSection', e.target.value)}
                    placeholder="Tell visitors about your business, your mission, and what makes you special..."
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Call to Action */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Call to Action</h3>
                      <p className="text-gray-400 text-sm">What should visitors do next?</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ctaText" className="text-white">Primary Button Text</Label>
                    <Input
                      id="ctaText"
                      value={content.callToAction.primary.text}
                      onChange={(e) => {
                        const newCTA = {
                          ...content.callToAction,
                          primary: { ...content.callToAction.primary, text: e.target.value }
                        };
                        updateContent('callToAction', newCTA);
                      }}
                      placeholder="e.g., Contact Us Today, Get Started, Learn More"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button 
                    onClick={handleSave} 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    💾 Save Changes
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('preview')}
                    variant="outline"
                    className="border-white/20 text-black hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300"
                    size="lg"
                  >
                    👀 Preview
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                {/* Enhanced Preview Content with Theme */}
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 space-y-12">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2 flex items-center justify-center">
                      <span className="mr-2">👁️</span>
                      Live Preview
                    </h2>
                    <p className="text-gray-400">See how your landing page will look to visitors</p>
                  </div>

                  {/* Hero Preview */}
                  <div className="text-center space-y-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{content.headline}</h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">{content.subheadline}</p>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-8 py-3 text-lg"
                    >
                      {content.callToAction.primary.text}
                    </Button>
                  </div>

                  {/* Value Propositions Preview */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-semibold text-white text-center">
                      Why Choose {businessData.name}?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {content.valuePropositions.map((prop, index) => (
                        <div key={index} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold">✓</span>
                          </div>
                          <p className="text-white font-medium">{prop}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Preview */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-semibold text-white text-center">Our Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {content.services.map((service, index) => (
                        <div key={index} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
                          <h3 className="text-xl font-semibold mb-3 text-white">{service.name}</h3>
                          <p className="text-gray-300 leading-relaxed">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Preview */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-semibold text-white text-center">About Us</h2>
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8">
                      <p className="text-gray-300 leading-relaxed text-lg text-center max-w-4xl mx-auto">{content.aboutSection}</p>
                    </div>
                  </div>

                  {/* Contact Preview */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-semibold text-white text-center">Contact Us</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm">📞</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">Phone</p>
                            <p className="text-gray-300">{content.contactInfo.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm">📍</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">Address</p>
                            <p className="text-gray-300">{content.contactInfo.address}</p>
                          </div>
                        </div>
                        {content.contactInfo.email && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm">✉️</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">Email</p>
                              <p className="text-gray-300">{content.contactInfo.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl h-48 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-white text-2xl">🗺️</span>
                          </div>
                          <span className="text-gray-400">Interactive Map</span>
                          <p className="text-gray-500 text-sm mt-2">Google Maps integration coming soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPageEditor; 