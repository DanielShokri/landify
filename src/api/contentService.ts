import type { ContentGenerationRequest, GeneratedContent } from '@/types/content';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Content Service - Backend API Client
 * 
 * Calls the backend content generation service for secure, server-side AI processing
 */
class ContentService {
  /**
   * Generate landing page content via backend API
   */
  async generateLandingPageWithAgents(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const response = await fetch(`${API_BASE_URL}/api/content-generation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessData: request.businessData
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get agent capabilities from backend
   */
  async getAgentCapabilities(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/content-generation/capabilities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const contentService = new ContentService(); 