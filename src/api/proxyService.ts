/**
 * Proxy Service for secure API calls through our backend server
 * This replaces direct OpenAI and Google Maps API calls for production security
 */

const API_BASE_URL = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:3001';

interface OpenAIResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface GoogleMapsAutocompleteResponse {
  predictions: Array<{
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }>;
}

interface GoogleMapsSearchResponse {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    business_status: string;
    rating?: number;
    user_ratings_total?: number;
    types: string[];
  }>;
}

interface GoogleMapsPlaceDetails {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    website?: string;
    business_status: string;
    opening_hours?: {
      weekday_text: string[];
    };
    types: string[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    user_ratings_total?: number;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
    }>;
  };
}

class ProxyService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make OpenAI chat completion request through proxy
   */
  async openaiChatCompletion(params: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<OpenAIResponse> {
    const response = await fetch(`${this.baseURL}/api/openai/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OpenAI request failed');
    }

    return response.json();
  }

  /**
   * Generate content using optimized proxy endpoint
   */
  async generateContent(params: {
    businessData: any;
    analysisType: 'business_analysis' | 'content_generation' | 'html_generation';
    headline?: string;
  }): Promise<OpenAIResponse> {
    const response = await fetch(`${this.baseURL}/api/openai/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Content generation failed');
    }

    return response.json();
  }

  /**
   * Get Google Places autocomplete suggestions through proxy
   */
  async googlePlacesAutocomplete(input: string): Promise<GoogleMapsAutocompleteResponse> {
    const response = await fetch(
      `${this.baseURL}/api/google-maps/places/autocomplete?input=${encodeURIComponent(input)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Places autocomplete failed');
    }

    return response.json();
  }

  /**
   * Search Google Places through proxy
   */
  async googlePlacesSearch(query: string): Promise<GoogleMapsSearchResponse> {
    const response = await fetch(
      `${this.baseURL}/api/google-maps/places/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Places search failed');
    }

    return response.json();
  }

  /**
   * Get Google Place details through proxy
   */
  async googlePlaceDetails(placeId: string): Promise<GoogleMapsPlaceDetails> {
    const response = await fetch(
      `${this.baseURL}/api/google-maps/places/details/${encodeURIComponent(placeId)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Place details request failed');
    }

    return response.json();
  }

  /**
   * Check server health
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
    const response = await fetch(`${this.baseURL}/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  /**
   * Test connection to proxy server
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const proxyService = new ProxyService();

// Helper function to check if we should use proxy
export const shouldUseProxy = (): boolean => {
  // Use proxy in production or when API_SERVER_URL is set
  return import.meta.env.PROD || !!import.meta.env.VITE_API_SERVER_URL;
};

// Export types for use in other files
export type {
    GoogleMapsAutocompleteResponse, GoogleMapsPlaceDetails, GoogleMapsSearchResponse, OpenAIResponse
};
