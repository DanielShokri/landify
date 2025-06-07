import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBusinessSearch } from '@/hooks/useBusinessSearch';
import { BusinessData, BusinessSearchResult } from '@/types/business';
import { MapPin, Star, Check } from 'lucide-react';
import { googleMapsService } from '@/api/googleMapsService';

function BusinessOnboarding() {
  const navigate = useNavigate();
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

  const handleSelectBusiness = async (business: BusinessSearchResult) => {
    setSelectedBusiness(business);
    
    // Set basic business data immediately
    setBusinessData({
      name: business.name,
      address: business.address,
      type: business.type,
      rating: business.rating,
      reviews: business.reviews,
    });

    // Fetch detailed information including photos and social media
    try {
      const placeDetails = await googleMapsService.getPlaceDetails(business.placeId);
      
      if (placeDetails) {
        // Generate business-type-specific placeholder photos
        const businessType = placeDetails.types?.[0] || 'business';
        
        // Generate 3-5 placeholder photos with different variations
        const placeholderCount = Math.floor(Math.random() * 3) + 3; // 3-5 photos
        const photos = Array.from({ length: placeholderCount }, (_, index) => ({
          name: `business_photo_${index}`,
          widthPx: 800,
          heightPx: 600,
          authorAttributions: [{
            displayName: 'Unsplash',
            uri: 'https://unsplash.com'
          }],
          getURI: (options?: { maxHeight?: number; maxWidth?: number }) => {
            // Return empty string - PhotoCarousel will handle generating the appropriate Unsplash URL
            return '';
          }
        }));

        // Enhanced social media extraction from website and other sources
        const socialMedia: BusinessData['socialMedia'] = {};
        
        if (placeDetails.website) {
          socialMedia.website = placeDetails.website;
          
          // Try to detect social media patterns in the website URL
          const url = placeDetails.website.toLowerCase();
          if (url.includes('facebook.com')) socialMedia.facebook = placeDetails.website;
          if (url.includes('instagram.com')) socialMedia.instagram = placeDetails.website;
          if (url.includes('twitter.com') || url.includes('x.com')) socialMedia.twitter = placeDetails.website;
          if (url.includes('linkedin.com')) socialMedia.linkedin = placeDetails.website;
          if (url.includes('youtube.com')) socialMedia.youtube = placeDetails.website;
          if (url.includes('tiktok.com')) socialMedia.tiktok = placeDetails.website;
          if (url.includes('yelp.com')) socialMedia.yelp = placeDetails.website;
        }
        
        // Add common social media search suggestions based on business name
        const businessName = business.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (businessName) {
          // These could be used for suggested links or future enhancement
          const suggestedSocial = {
            facebook: `https://facebook.com/${businessName}`,
            instagram: `https://instagram.com/${businessName}`,
            twitter: `https://twitter.com/${businessName}`,
            yelp: `https://yelp.com/biz/${businessName}`
          };
        }

        // Extract business hours from Google Places data
        const extractedHours: BusinessData['hours'] = {};
        if (placeDetails.opening_hours?.weekday_text) {
          placeDetails.opening_hours.weekday_text.forEach((dayText, index) => {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
            const dayName = days[index];
            if (dayName && dayText) {
              // Extract just the hours part (remove day name)
              const hoursMatch = dayText.match(/:\s*(.+)/);
              if (hoursMatch && extractedHours) {
                (extractedHours as any)[dayName] = hoursMatch[1];
              }
            }
          });
        }

        // Extract amenities/features from Google Places types
        const amenities: string[] = [];
        if (placeDetails.types) {
          placeDetails.types.forEach(type => {
            switch (type) {
              case 'meal_delivery':
                amenities.push('Delivery Available');
                break;
              case 'meal_takeaway':
                amenities.push('Takeout Available');
                break;
              case 'wheelchair_accessible_entrance':
                amenities.push('Wheelchair Accessible');
                break;
              case 'accepts_credit_cards':
                amenities.push('Credit Cards Accepted');
                break;
              case 'parking':
                amenities.push('Parking Available');
                break;
              case 'wifi':
                amenities.push('Free WiFi');
                break;
              case 'outdoor_seating':
                amenities.push('Outdoor Seating');
                break;
              case 'reservations':
                amenities.push('Reservations Accepted');
                break;
            }
          });
        }

        // Update business data with all extracted information
        setBusinessData(prev => ({
          ...prev,
          phone: placeDetails.formatted_phone_number || prev.phone,
          website: placeDetails.website || prev.website,
          hours: extractedHours,
          amenities: amenities.length > 0 ? amenities : undefined,
          photos: photos,
          socialMedia: socialMedia,
          coordinates: {
            lat: placeDetails.geometry.location.lat,
            lng: placeDetails.geometry.location.lng
          }
        }));


      }
    } catch (error) {
      console.error('Failed to fetch place details:', error);
      // Continue with basic data even if detailed fetch fails
    }
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

    // Navigate to content generation with business data
    const params = new URLSearchParams({
      businessData: JSON.stringify(businessData)
    });
    navigate(`/generate?${params.toString()}`);
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
          <button onClick={() => navigate('/')} className="text-gray-300 hover:text-white transition-colors">← Back to Home</button>
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
            <p className="text-xl text-center text-gray-300">
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
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
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
                          className="min-w-[100px] px-4 py-2 text-sm sm:min-w-[120px] sm:px-6 sm:py-3 sm:text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          {isLoading ? (
                            <>
                              <span className="hidden sm:inline">Searching...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            'Search'
                          )}
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
                              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                              {result.rating}
                            </span>
                            <span>({result.reviews} reviews)</span>
                          </div>
                          {selectedBusiness?.placeId === result.placeId && (
                            <div className="flex items-center mt-3">
                              <Check className="w-4 h-4 text-green-400 mr-2" />
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
                        <Check className="w-5 h-5 mr-2" />
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