import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBusinessSearch } from '@/hooks/useBusinessSearch';
import { BusinessData, BusinessSearchResult } from '@/types/business';

function BusinessOnboarding() {
    const [searchQuery, setSearchQuery] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [businessData, setBusinessData] = useState<Partial<BusinessData>>({});
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSearchResult | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
  const { 
    searchBusiness, 
    isLoading, 
    searchResults, 
    error, 
    clearResults,
    autocompleteSuggestions,
    updateAutocompleteQuery,
    clearAutocomplete,
    hasAutocompleteSuggestions
  } = useBusinessSearch();
  console.log('isLoading', isLoading);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchBusiness(searchQuery);
      setShowAutocomplete(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    updateAutocompleteQuery(value);
    setShowAutocomplete(value.length >= 2);
  };

  const handleAutocompleteSelect = (suggestion: google.maps.places.AutocompletePrediction) => {
    setSearchQuery(suggestion.description);
    setShowAutocomplete(false);
    clearAutocomplete();
    // Automatically trigger search when autocomplete item is selected
    searchBusiness(suggestion.description);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && hasAutocompleteSuggestions) {
      setShowAutocomplete(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow click on autocomplete items
    setTimeout(() => setShowAutocomplete(false), 150);
  };

  const handleSelectBusiness = (business: BusinessSearchResult) => {
    setSelectedBusiness(business);
    setBusinessData({
      name: business.name,
      address: business.address,
      type: business.type,
      rating: business.rating,
      reviews: business.reviews,
    });
  };

  const handleManualEntry = () => {
    setManualEntry(true);
    clearResults();
    setSelectedBusiness(null);
    setBusinessData({});
  };

  const handleBackToSearch = () => {
    setManualEntry(false);
    setSelectedBusiness(null);
    setBusinessData({});
    setSearchQuery('');
  };

  const handleBusinessDataChange = (field: keyof BusinessData, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    console.log('Final business data for AI content generation:', businessData);
    // Navigate to content generation with business data
    const params = new URLSearchParams({
      businessData: JSON.stringify(businessData)
    });
    window.location.href = `/generate?${params.toString()}`;
  };

  const canContinue = !!businessData.name && (!!selectedBusiness || manualEntry);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-white font-bold text-xl">
          Landify
        </div>
        <div className="flex items-center space-x-8">
          <a href="/" className="text-gray-300 hover:text-white transition-colors">← Back to Home</a>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center p-8 pt-20">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tell Us About Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Business
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Let's gather some information to create your perfect landing page
            </p>
          </div>

          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Business Information</h2>
            </div>
            <div className="space-y-6">
              {!manualEntry ? (
                <>
                                    <div className="space-y-4">
                    <Label htmlFor="search" className="text-base font-medium text-white">
                      Search for your business on Google Maps
                    </Label>
                    <div className="relative">
                      <div className="flex space-x-3">
                        <div className="flex-1 relative">
                          <Input
                            id="search"
                            placeholder="Enter business name and location..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !isLoading && handleSearch()}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                          />
                          
                          {/* Autocomplete Dropdown */}
                          {showAutocomplete && hasAutocompleteSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                              {autocompleteSuggestions.map((suggestion, index) => (
                                <div
                                  key={suggestion.place_id || index}
                                  className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 border-b border-white/10 last:border-b-0"
                                  onClick={() => handleAutocompleteSelect(suggestion)}
                                >
                                  <div className="flex items-start space-x-3">
                                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white text-sm font-medium truncate">
                                        {suggestion.structured_formatting?.main_text || suggestion.description}
                                      </p>
                                      <p className="text-gray-400 text-xs truncate">
                                        {suggestion.structured_formatting?.secondary_text || ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          onClick={handleSearch} 
                          disabled={isLoading || !searchQuery.trim()}
                          className="min-w-[120px] bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        Search failed. Please try again or enter details manually.
                      </p>
                    )}
                  </div>

                  {searchResults && searchResults.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium text-white">Search Results</Label>
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-6 cursor-pointer rounded-xl transition-all duration-300 border ${
                            selectedBusiness?.placeId === result.placeId
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 ring-2 ring-blue-400/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                          onClick={() => handleSelectBusiness(result)}
                        >
                          <h3 className="font-semibold text-lg text-white">{result.name}</h3>
                          <p className="text-sm text-gray-300 mt-1">{result.address}</p>
                          <div className="flex items-center mt-3 text-sm text-gray-400">
                            <span className="mr-4 flex items-center">
                              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                              {result.rating}
                            </span>
                            <span>({result.reviews} reviews)</span>
                          </div>
                          {selectedBusiness?.placeId === result.placeId && (
                            <div className="flex items-center mt-3">
                              <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              <span className="text-sm text-green-400 font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBusiness && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
                      <h3 className="font-semibold text-green-400 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Selected Business
                      </h3>
                      <p className="text-sm text-green-300 font-medium">{selectedBusiness.name}</p>
                      <p className="text-xs text-green-400/80">{selectedBusiness.address}</p>
                    </div>
                  )}

                  <div className="flex flex-col space-y-4">
                    {selectedBusiness && (
                      <Button
                        onClick={handleContinue}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Continue with Selected Business
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleManualEntry}
                      className="w-full border-white/20 text-black-300 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300"
                    >
                      {searchResults.length > 0 ? "Don't see your business? Enter details manually" : "Can't find your business? Enter details manually"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium text-white">Business Details</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToSearch}
                        className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        ← Back to Search
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="businessName" className="text-white">Business Name *</Label>
                        <Input
                          id="businessName"
                          placeholder="Your business name"
                          value={businessData.name || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBusinessDataChange('name', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessType" className="text-white">Business Type</Label>
                        <Input
                          id="businessType"
                          placeholder="e.g., Restaurant, Retail Store, Service Provider"
                          value={businessData.type || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBusinessDataChange('type', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-white">Address</Label>
                        <Input
                          id="address"
                          placeholder="Full business address"
                          value={businessData.address || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBusinessDataChange('address', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-white">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Business phone number"
                          value={businessData.phone || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBusinessDataChange('phone', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-white">Business Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of your business and services"
                          value={businessData.description || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBusinessDataChange('description', e.target.value)}
                          rows={4}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all duration-300 resize-none"
                        />
                      </div>

                      <Button
                        onClick={handleContinue}
                        disabled={!canContinue}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to AI Content Generation
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessOnboarding;