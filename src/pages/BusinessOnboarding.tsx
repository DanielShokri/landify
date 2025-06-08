import { googleMapsService } from '@/api/googleMapsService';
import {
  AIFeaturesInfo,
  BusinessInformationForm,
  Layout,
  ManualEntryForm,
  PageContainer,
  SearchBusinessForm
} from '@/components';
import GenerationProgress from '@/components/GenerationProgress';
import { useAgenticsGeneration } from '@/hooks/useAgenticsGeneration';
import { useBusinessSearch } from '@/hooks/useBusinessSearch';
import { landingPageStorage } from '@/lib/landingPageStorage';
import { BusinessData, BusinessSearchResult as BusinessSearchResultType } from '@/types/business';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BusinessOnboarding() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const [businessData, setBusinessData] = useState<Partial<BusinessData>>({});
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSearchResultType | null>(null);
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

  const {
    generateWithAgents,
    currentStage,
    progress,
    logs,
    isLoading: isGenerating
  } = useAgenticsGeneration();

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
    searchBusiness(suggestion.description);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && hasAutocompleteSuggestions) {
      setShowAutocomplete(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowAutocomplete(false), 150);
  };

  const handleSelectBusiness = async (business: BusinessSearchResultType) => {
    setSelectedBusiness(business);

    setBusinessData({
      name: business.name,
      address: business.address,
      type: business.type,
      rating: business.rating,
      reviews: business.reviews,
    });

    // Fetch detailed information
    try {
      const placeDetails = await googleMapsService.getPlaceDetails(business.placeId);

      if (placeDetails) {
        const placeholderCount = Math.floor(Math.random() * 3) + 3;
        const photos = Array.from({ length: placeholderCount }, (_, index) => ({
          name: `business_photo_${index}`,
          widthPx: 800,
          heightPx: 600,
          authorAttributions: [{
            displayName: 'Unsplash',
            uri: 'https://unsplash.com'
          }],
          getURI: () => ''
        }));

        const socialMedia: BusinessData['socialMedia'] = {};
        if (placeDetails.website) {
          socialMedia.website = placeDetails.website;
          const url = placeDetails.website.toLowerCase();
          if (url.includes('facebook.com')) socialMedia.facebook = placeDetails.website;
          if (url.includes('instagram.com')) socialMedia.instagram = placeDetails.website;
          if (url.includes('twitter.com') || url.includes('x.com')) socialMedia.twitter = placeDetails.website;
          if (url.includes('linkedin.com')) socialMedia.linkedin = placeDetails.website;
          if (url.includes('youtube.com')) socialMedia.youtube = placeDetails.website;
          if (url.includes('tiktok.com')) socialMedia.tiktok = placeDetails.website;
          if (url.includes('yelp.com')) socialMedia.yelp = placeDetails.website;
        }

        const extractedHours: BusinessData['hours'] = {};
        if (placeDetails.opening_hours?.weekday_text) {
          placeDetails.opening_hours.weekday_text.forEach((dayText, index) => {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
            const dayName = days[index];
            if (dayName && dayText) {
              const hoursMatch = dayText.match(/:\s*(.+)/);
              if (hoursMatch && extractedHours) {
                (extractedHours as any)[dayName] = hoursMatch[1];
              }
            }
          });
        }

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

        setBusinessData(prev => ({
          ...prev,
          phone: placeDetails.formatted_phone_number || prev.phone || '',
          website: placeDetails.website || prev.website || '',
          hours: extractedHours,
          amenities: amenities.length > 0 ? amenities : [],
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

  const handleGenerateLandingPage = async () => {
    if (!businessData.name) return;

    try {
      const request = { businessData: businessData as BusinessData };
      const content = await generateWithAgents(request);
      const pageId = landingPageStorage.saveLandingPage(businessData as BusinessData, content);
      navigate(`/page/${pageId}`);
    } catch (error) {
      console.error('Failed to generate landing page:', error);
    }
  };

  const canGenerate = !!businessData.name && (!!selectedBusiness || manualEntry);

  return (
    <Layout variant="landing" showFooter={false}>
      <PageContainer maxWidth="2xl" centerContent className="pt-20">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tell Us About Your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Business
            </span>
          </h1>
          <p className="text-xl text-center text-gray-300">
            {isGenerating
              ? 'Our AI is creating your perfect landing page...'
              : 'Enter your business info and get a professional landing page in minutes'
            }
          </p>
        </div>

        {/* Generation Progress */}
        <GenerationProgress
          isGenerating={isGenerating}
          currentStage={currentStage}
          progress={progress}
          logs={logs}
        />

        {/* Business Information Form */}
        {!isGenerating && (
          <BusinessInformationForm>
            {!manualEntry ? (
              <SearchBusinessForm
                searchQuery={searchQuery}
                showAutocomplete={showAutocomplete}
                hasAutocompleteSuggestions={hasAutocompleteSuggestions}
                autocompleteSuggestions={autocompleteSuggestions}
                isLoading={isLoading}
                error={error}
                searchResults={searchResults}
                selectedBusiness={selectedBusiness}
                canGenerate={canGenerate}
                onInputChange={handleInputChange}
                onInputFocus={handleInputFocus}
                onInputBlur={handleInputBlur}
                onSearch={handleSearch}
                onAutocompleteSelect={handleAutocompleteSelect}
                onSelectBusiness={handleSelectBusiness}
                onManualEntry={handleManualEntry}
                onGenerateLandingPage={handleGenerateLandingPage}
              />
            ) : (
              <ManualEntryForm
                businessData={businessData}
                canGenerate={canGenerate}
                onBackToSearch={handleBackToSearch}
                onBusinessDataChange={handleBusinessDataChange}
                onGenerateLandingPage={handleGenerateLandingPage}
              />
            )}
          </BusinessInformationForm>
        )}

        {/* AI Features Info */}
        {!isGenerating && <AIFeaturesInfo />}
      </PageContainer>
    </Layout>
  );
}

export default BusinessOnboarding;