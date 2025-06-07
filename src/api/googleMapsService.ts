import { Loader } from '@googlemaps/js-api-loader';
import { GoogleMapsPlace, BusinessSearchResult } from '../types/business';

class GoogleMapsService {
  private apiKey: string;
  private loader: Loader;
  private placesService: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private isInitialized = false;

  /**
   * Helper method to check if a place is currently open
   * Replaces the deprecated open_now field functionality
   */
  private isPlaceOpenNow(openingHours?: google.maps.places.PlaceOpeningHours): boolean {
    if (!openingHours) return false;
    
    // Use the modern isOpen() method if available
    if (openingHours.isOpen) {
      return openingHours.isOpen() || false;
    }
    
    // Fallback: basic check using periods (not as accurate but better than nothing)
    if (openingHours.periods && openingHours.periods.length > 0) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
      
      const todayPeriods = openingHours.periods.filter(period => 
        period.open && period.open.day === currentDay
      );
      
      for (const period of todayPeriods) {
        if (period.open && period.close) {
          const openTime = parseInt(period.open.time || '0000');
          const closeTime = parseInt(period.close.time || '2359');
          
          if (currentTime >= openTime && currentTime <= closeTime) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    this.loader = new Loader({
      apiKey: this.apiKey,
      version: 'weekly',
      libraries: ['places'],
    });
  }

  private async initializeGoogleMaps(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loader.load();
      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(dummyDiv);
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      throw new Error('Failed to initialize Google Maps');
    }
  }

  async searchBusiness(query: string): Promise<BusinessSearchResult[]> {
    try {
      await this.initializeGoogleMaps();
      
      if (!this.placesService) {
        throw new Error('Google Maps Places service not initialized');
      }

      return new Promise((resolve, reject) => {
        const request: google.maps.places.TextSearchRequest = {
          query
        };

        this.placesService!.textSearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
          console.log('🔍 Google Places Text Search Response:');
          console.log('Status:', status);
          console.log('Raw Results:', results);
          console.log('Number of results:', results?.length || 0);
          
          if (results && results.length > 0) {
            console.log('📍 First Place Result (detailed):', JSON.stringify(results[0], null, 2));
          }

          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const mappedResults: BusinessSearchResult[] = results.map((place: google.maps.places.PlaceResult) => ({
              placeId: place.place_id || '',
              name: place.name || '',
              address: place.formatted_address || '',
              rating: place.rating || 0,
              reviews: place.user_ratings_total || 0,
              type: place.types?.[0] || 'business',
              coordinates: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              },
              photos: []
            }));
            resolve(mappedResults);
          } else {
            console.error('Google Maps Places API Error:', status);
            reject(new Error(`Google Maps API Error: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Google Maps API Error:', error);
      throw new Error('Failed to search places');
    }
  }

  async getPlaceDetails(placeId: string): Promise<GoogleMapsPlace | null> {
    try {
      await this.initializeGoogleMaps();
      
      if (!this.placesService) {
        throw new Error('Google Maps Places service not initialized');
      }

      return new Promise((resolve, reject) => {
        const request = {
          placeId,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'business_status',
            'types',
            // Modern fields that replace deprecated ones
            'opening_hours',        // Instead of opening_hours.open_now
            'utc_offset_minutes'    // Instead of utc_offset
          ]
        };

        this.placesService!.getDetails(request, (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
          console.log('🏢 Google Places Details Response:');
          console.log('Status:', status);
          console.log('Raw Place Details:', place);
          console.log('Place Details (formatted):', JSON.stringify(place, null, 2));

          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const result: GoogleMapsPlace = {
              place_id: place.place_id || '',
              name: place.name || '',
              formatted_address: place.formatted_address || '',
              geometry: {
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0
                }
              },
              formatted_phone_number: place.formatted_phone_number || '',
              website: place.website || '',
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              business_status: place.business_status || 'OPERATIONAL',
              types: place.types || [],
              // Handle opening hours with modern approach  
              opening_hours: place.opening_hours ? {
                periods: place.opening_hours.periods,
                weekday_text: place.opening_hours.weekday_text,
                // Note: The modern isOpen() method is available on the Google Maps PlaceResult
                // This replaces the deprecated open_now property
                isOpen: place.opening_hours.isOpen
              } : undefined,
              // Use modern utc_offset_minutes instead of deprecated utc_offset
              utc_offset_minutes: place.utc_offset_minutes
            };
            resolve(result);
          } else {
            console.error('Google Maps Place Details API Error:', status);
            reject(new Error(`Google Maps API Error: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Google Maps API Error:', error);
      throw new Error('Failed to get place details');
    }
  }

  async getAutocompleteSuggestions(input: string): Promise<google.maps.places.AutocompletePrediction[]> {
    try {
      await this.initializeGoogleMaps();
      
      if (!this.autocompleteService) {
        throw new Error('Google Maps Autocomplete service not initialized');
      }

      if (input.trim().length < 2) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const request: google.maps.places.AutocompletionRequest = {
          input,
          types: ['establishment'],
          // No country restrictions - allows global results
        };

        this.autocompleteService!.getPlacePredictions(request, (predictions, status) => {
          console.log('🔮 Google Places Autocomplete Response:');
          console.log('Status:', status);
          console.log('Input query:', input);
          console.log('Raw Predictions:', predictions);
          console.log('Number of predictions:', predictions?.length || 0);
          
          if (predictions && predictions.length > 0) {
            console.log('📝 Autocomplete Predictions (detailed):');
            predictions.forEach((prediction, index) => {
              console.log(`${index + 1}.`, {
                description: prediction.description,
                place_id: prediction.place_id,
                structured_formatting: prediction.structured_formatting,
                types: prediction.types
              });
            });
          }

          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.error('Google Maps Autocomplete API Error:', status);
            reject(new Error(`Autocomplete API Error: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Google Maps Autocomplete Error:', error);
      throw new Error('Failed to get autocomplete suggestions');
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      await this.initializeGoogleMaps();
      
      const geocoder = new google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            console.error('Geocoding Error:', status);
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Geocoding Error:', error);
      throw new Error('Failed to geocode address');
    }
  }
}

export const googleMapsService = new GoogleMapsService();
export default googleMapsService;
