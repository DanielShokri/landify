import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIDesign } from '@/hooks/useAIDesign';
import { BusinessData } from '@/types/business';
import { DesignRequest } from '@/api/aiDesignService';

interface AIDesignWizardProps {
  businessData: BusinessData;
  onApplyTheme?: (theme: any) => void;
  onClose?: () => void;
}

export function AIDesignWizard({ businessData, onApplyTheme, onClose }: AIDesignWizardProps) {
  const [designRequest, setDesignRequest] = useState<Partial<DesignRequest>>({
    businessData,
    designStyle: 'modern',
    colorPreferences: [],
    brandPersonality: [],
  });
  
  const [colorInput, setColorInput] = useState('');
  const [personalityInput, setPersonalityInput] = useState('');
  
  const { 
    suggestions, 
    generateSuggestions, 
    applyAITheme, 
    isGenerating, 
    error, 
    hasSuggestions 
  } = useAIDesign();

  const handleGenerateSuggestions = () => {
    if (!designRequest.businessData) return;
    
    generateSuggestions(designRequest as DesignRequest);
  };


  const handleApplyTheme = () => {
    if (!suggestions) return;
    
    
    const theme = applyAITheme(businessData);
    if (theme && onApplyTheme) {
      onApplyTheme(theme);
    }
  };

  const addColorPreference = () => {
    if (colorInput.trim() && designRequest.colorPreferences) {
      setDesignRequest(prev => ({
        ...prev,
        colorPreferences: [...(prev.colorPreferences || []), colorInput.trim()]
      }));
      setColorInput('');
    }
  };

  const addPersonalityTrait = () => {
    if (personalityInput.trim() && designRequest.brandPersonality) {
      setDesignRequest(prev => ({
        ...prev,
        brandPersonality: [...(prev.brandPersonality || []), personalityInput.trim()]
      }));
      setPersonalityInput('');
    }
  };

  const removeColorPreference = (index: number) => {
    setDesignRequest(prev => ({
      ...prev,
      colorPreferences: prev.colorPreferences?.filter((_, i) => i !== index)
    }));
  };

  const removePersonalityTrait = (index: number) => {
    setDesignRequest(prev => ({
      ...prev,
      brandPersonality: prev.brandPersonality?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Design Assistant</h2>
              <p className="text-gray-600">Get custom design recommendations powered by AI</p>
            </div>
            {onClose && (
              <Button variant="ghost" onClick={onClose} className="text-gray-500">
                ✕
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preferences">Design Preferences</TabsTrigger>
              <TabsTrigger value="suggestions" disabled={!hasSuggestions}>
                AI Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tell us about your design vision</CardTitle>
                  <CardDescription>
                    Help our AI understand your brand and design preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Input
                      id="target-audience"
                      placeholder="e.g., Young professionals, families, luxury clients..."
                      value={designRequest.targetAudience || ''}
                      onChange={(e) => setDesignRequest(prev => ({ 
                        ...prev, 
                        targetAudience: e.target.value 
                      }))}
                    />
                  </div>

                  {/* Design Style */}
                  <div className="space-y-2">
                    <Label>Design Style</Label>
                    <Select 
                      value={designRequest.designStyle} 
                      onValueChange={(value) => setDesignRequest(prev => ({ 
                        ...prev, 
                        designStyle: value as any 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern & Clean</SelectItem>
                        <SelectItem value="classic">Classic & Timeless</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="bold">Bold & Vibrant</SelectItem>
                        <SelectItem value="artistic">Artistic & Creative</SelectItem>
                        <SelectItem value="corporate">Corporate & Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Preferences */}
                  <div className="space-y-2">
                    <Label>Color Preferences</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a color preference..."
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addColorPreference()}
                      />
                      <Button onClick={addColorPreference} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {designRequest.colorPreferences?.map((color, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {color}
                          <button
                            onClick={() => removeColorPreference(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Brand Personality */}
                  <div className="space-y-2">
                    <Label>Brand Personality</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., trustworthy, innovative, friendly..."
                        value={personalityInput}
                        onChange={(e) => setPersonalityInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addPersonalityTrait()}
                      />
                      <Button onClick={addPersonalityTrait} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {designRequest.brandPersonality?.map((trait, index) => (
                        <span 
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {trait}
                          <button
                            onClick={() => removePersonalityTrait(index)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Custom Requests */}
                  <div className="space-y-2">
                    <Label htmlFor="custom-requests">Special Design Requests</Label>
                    <Textarea
                      id="custom-requests"
                      placeholder="Any specific design elements, styles, or requirements..."
                      value={designRequest.customRequests || ''}
                      onChange={(e) => setDesignRequest(prev => ({ 
                        ...prev, 
                        customRequests: e.target.value 
                      }))}
                      rows={3}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-red-700 font-medium text-sm">AI Design Generation Failed</p>
                      </div>
                      <p className="text-red-600 text-sm">
                        {error.message || 'Failed to generate suggestions. Please try again.'}
                      </p>
                      <p className="text-red-500 text-xs mt-1">
                        Check your internet connection and API configuration.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button 
                      onClick={handleGenerateSuggestions}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating AI Suggestions...
                        </>
                      ) : (
                        <>
                          ✨ Generate AI Design Suggestions
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isGenerating && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
                        <div>
                          <p className="text-blue-700 font-medium text-sm">AI is analyzing your business...</p>
                          <p className="text-blue-600 text-xs">This may take 10-30 seconds</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-6">
              {suggestions && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Color Palette */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🎨 Color Palette
                      </CardTitle>
                      <CardDescription>{suggestions.colorPalette.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="space-y-1">
                          <div 
                            className="w-full h-12 rounded"
                            style={{ backgroundColor: suggestions.colorPalette.primary }}
                          ></div>
                          <p className="text-xs text-center">Primary</p>
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="w-full h-12 rounded"
                            style={{ backgroundColor: suggestions.colorPalette.secondary }}
                          ></div>
                          <p className="text-xs text-center">Secondary</p>
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="w-full h-12 rounded"
                            style={{ backgroundColor: suggestions.colorPalette.accent }}
                          ></div>
                          <p className="text-xs text-center">Accent</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p><strong>Primary:</strong> {suggestions.colorPalette.primary}</p>
                          <p><strong>Secondary:</strong> {suggestions.colorPalette.secondary}</p>
                          <p><strong>Accent:</strong> {suggestions.colorPalette.accent}</p>
                        </div>
                        <div>
                          <p><strong>Background:</strong> {suggestions.colorPalette.background}</p>
                          <p><strong>Text:</strong> {suggestions.colorPalette.text}</p>
                          <p><strong>Cards:</strong> {suggestions.colorPalette.cardBackground}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Typography */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🔤 Typography
                      </CardTitle>
                      <CardDescription>{suggestions.typography.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm mb-1">Heading Font:</p>
                        <p 
                          className="text-lg"
                          style={{ fontFamily: suggestions.typography.headingFont }}
                        >
                          {suggestions.typography.headingFont}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Body Font:</p>
                        <p 
                          className="text-base"
                          style={{ fontFamily: suggestions.typography.bodyFont }}
                        >
                          {suggestions.typography.bodyFont}
                        </p>
                      </div>
                      {suggestions.typography.accentFont && (
                        <div>
                          <p className="font-semibold text-sm mb-1">Accent Font:</p>
                          <p 
                            className="text-base"
                            style={{ fontFamily: suggestions.typography.accentFont }}
                          >
                            {suggestions.typography.accentFont}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Layout Structure */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        📐 Layout Structure
                      </CardTitle>
                      <CardDescription>{suggestions.layout.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm mb-2">Structure:</p>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {suggestions.layout.structure}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2">Recommended Sections:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestions.layout.sections.map((section, index) => (
                            <span 
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2">Visual Elements:</p>
                        <ul className="text-sm space-y-1">
                          {suggestions.layout.visualElements.map((element, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-blue-500">•</span>
                              {element}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Branding Elements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🎯 Branding Elements
                      </CardTitle>
                      <CardDescription>{suggestions.brandingElements.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm mb-2">Logo Suggestions:</p>
                        <ul className="text-sm space-y-1">
                          {suggestions.brandingElements.logoSuggestions.map((logo, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-purple-500">•</span>
                              {logo}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2">Tagline Ideas:</p>
                        <ul className="text-sm space-y-1">
                          {suggestions.brandingElements.taglineSuggestions.map((tagline, index) => (
                            <li key={index} className="italic text-gray-600">
                              "{tagline}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {suggestions && (
                <div className="flex gap-4 pt-4 border-t">
                  <Button 
                    onClick={handleApplyTheme}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    size="lg"
                  >
                    ✨ Apply AI Theme
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDesignRequest(prev => ({ ...prev }))}
                    className="flex-1"
                    size="lg"
                  >
                    🔄 Generate New Suggestions
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 