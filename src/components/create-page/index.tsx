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
import { useBusinessSearch } from '@/hooks/useBusinessSearch';
import { useFastGeneration } from '@/hooks/useFastGeneration';
import { landingPageStorage } from '@/lib/landingPageStorage';
import type { BusinessData, BusinessSearchResult as BusinessSearchResultType } from '@/types/business';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePage() {
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
    } = useFastGeneration();

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
            reviews: business.reviews
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

    if (isGenerating) {
        return (
            <Layout variant="landing">
                <PageContainer>
                    <GenerationProgress
                        isGenerating={isGenerating}
                        currentStage={currentStage}
                        progress={progress}
                        logs={logs}
                    />
                </PageContainer>
            </Layout>
        );
    }

    return (
        <Layout variant="landing">
            <PageContainer>
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-4xl font-bold mb-4">
                            Generate Your Landing Page
                        </h1>
                        <p className="text-lg text-gray-300">
                            Search for your business or enter details manually to create a professional landing page
                        </p>
                    </div>

                    {!manualEntry && !selectedBusiness && (
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
                    )}

                    {manualEntry && (
                        <ManualEntryForm
                            businessData={businessData}
                            onBusinessDataChange={handleBusinessDataChange}
                            onBackToSearch={handleBackToSearch}
                            onGenerateLandingPage={handleGenerateLandingPage}
                            canGenerate={canGenerate}
                        />
                    )}

                    {selectedBusiness && !manualEntry && (
                        <BusinessInformationForm>
                            <div className="text-center">
                                <p className="text-white mb-4">Selected: {selectedBusiness.name}</p>
                                <button
                                    onClick={handleGenerateLandingPage}
                                    disabled={!canGenerate}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-base md:text-lg"
                                >
                                    Generate Landing Page
                                </button>
                            </div>
                        </BusinessInformationForm>
                    )}

                    <AIFeaturesInfo />
                </div>
            </PageContainer>
        </Layout>
    );
}

export default CreatePage; 