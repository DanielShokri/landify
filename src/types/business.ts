export interface BusinessData {
  id?: string;
  name: string;
  type: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  hours?: BusinessHours;
  photos?: PlacePhoto[];
  socialMedia?: SocialMediaLinks;
  amenities?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface BusinessSearchResult {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface GoogleMapsPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string; // Optional, might not always be present
  website?: string; // Optional
  rating?: number; // Optional
  user_ratings_total?: number; // Optional
  business_status?: string; // e.g., "OPERATIONAL", "CLOSED_PERMANENTLY"
  types?: string[]; // e.g., ["restaurant", "food", "point_of_interest"]
  photos?: {
    height: number;
    html_attributions: string[];
    photo_reference: string;
    width: number;
  }[];
  opening_hours?: {
    // Note: open_now is deprecated as of November 2019
    // Use the isOpen() method instead when available from Google Places API
    periods?: google.maps.places.PlaceOpeningHoursPeriod[];
    weekday_text?: string[]; // e.g., ["Monday: 9:00 AM – 5:00 PM"]
    // Modern method to check if place is open (replaces deprecated open_now)
    isOpen?: (date?: Date) => boolean | undefined;
  };
  // Added to replace deprecated utc_offset
  utc_offset_minutes?: number;
}

// Photo interfaces for Google Places API
export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions?: {
    displayName: string;
    uri?: string;
    photoUri?: string;
  }[];
  getURI?: (options?: { maxHeight?: number; maxWidth?: number }) => string;
}

export interface SocialMediaLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  yelp?: string;
  tripadvisor?: string;
}
