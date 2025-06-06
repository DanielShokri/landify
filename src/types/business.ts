export interface BusinessData {
  id?: string;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  hours?: BusinessHours;
  photos?: string[];
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
  photos?: string[];
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
    open_now?: boolean;
    periods?: {
      close: {
        day: number;
        time: string;
      };
      open: {
        day: number;
        time: string;
      };
    }[];
    weekday_text?: string[]; // e.g., ["Monday: 9:00 AM – 5:00 PM"]
  };
}
