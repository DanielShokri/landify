import { Loader } from '@googlemaps/js-api-loader';
import { BusinessSearchResult, GoogleMapsPlace, SocialMediaLinks } from '../types/business';

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




  /**
   * Extract social media links from business website and other sources
   */
  private async extractSocialMediaLinks(place: google.maps.places.PlaceResult): Promise<SocialMediaLinks> {
    const socialMedia: SocialMediaLinks = {};
    
    // Start with the website if available
    if (place.website) {
      socialMedia.website = place.website;
      
      // Try to detect social media patterns in the website URL
      const url = place.website.toLowerCase();
      if (url.includes('facebook.com')) socialMedia.facebook = place.website;
      if (url.includes('instagram.com')) socialMedia.instagram = place.website;
      if (url.includes('twitter.com') || url.includes('x.com')) socialMedia.twitter = place.website;
      if (url.includes('linkedin.com')) socialMedia.linkedin = place.website;
      if (url.includes('youtube.com')) socialMedia.youtube = place.website;
      if (url.includes('tiktok.com')) socialMedia.tiktok = place.website;
      if (url.includes('yelp.com')) socialMedia.yelp = place.website;
    }

    // Additional social media detection could be enhanced with:
    // - Web scraping the business website for social media links
    // - Cross-referencing with business directories
    // - Using business name to search social platforms
    
    return socialMedia;
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
              }
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
            'utc_offset_minutes',   // Instead of utc_offset
            // Additional rich data fields
            'price_level',
            'reviews',
            'editorial_summary'
          ]
        };

        this.placesService!.getDetails(request, async (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            // Extract social media
            await this.extractSocialMediaLinks(place);

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
              photos: [],
              // Handle opening hours with modern approach  
              ...(place.opening_hours && {
                opening_hours: {
                  ...(place.opening_hours.periods && { periods: place.opening_hours.periods }),
                  ...(place.opening_hours.weekday_text && { weekday_text: place.opening_hours.weekday_text }),
                  // Note: The modern isOpen() method is available on the Google Maps PlaceResult
                  // This replaces the deprecated open_now property
                  ...(place.opening_hours.isOpen && { isOpen: place.opening_hours.isOpen })
                }
              }),
              // Use modern utc_offset_minutes instead of deprecated utc_offset
              ...(place.utc_offset_minutes !== undefined && { utc_offset_minutes: place.utc_offset_minutes })
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
            const location = results[0]?.geometry?.location;
            if (location) {
              resolve({
                lat: location.lat(),
                lng: location.lng()
              });
            } else {
              console.error('Geocoding Error: No location found');
              reject(new Error('Geocoding failed: No location found'));
            }
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
