import type { BusinessData } from '@/types/business';
import type { GeneratedContent } from '@/types/content';
import { generateUUID } from './uuid';

export interface LandingPageData {
  id: string;
  businessData: BusinessData;
  content: GeneratedContent;
  createdAt: string;
  updatedAt: string;
}

class LandingPageStorage {
  private readonly STORAGE_PREFIX = 'landify_page_';
  private readonly INDEX_KEY = 'landify_pages_index';

  // Save landing page data and return UUID
  saveLandingPage(businessData: BusinessData, content: GeneratedContent): string {
    const id = generateUUID();
    const now = new Date().toISOString();
    
    const landingPageData: LandingPageData = {
      id,
      businessData,
      content,
      createdAt: now,
      updatedAt: now
    };

    // Save the landing page data
    localStorage.setItem(
      `${this.STORAGE_PREFIX}${id}`, 
      JSON.stringify(landingPageData)
    );

    // Update the index
    this.updateIndex(id);

    return id;
  }

  // Get landing page data by UUID
  getLandingPage(id: string): LandingPageData | null {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${id}`);
      if (!data) return null;
      
      return JSON.parse(data) as LandingPageData;
    } catch (error) {
      console.error('Failed to retrieve landing page:', error);
      return null;
    }
  }

  // Update existing landing page
  updateLandingPage(id: string, businessData: BusinessData, content: GeneratedContent): boolean {
    try {
      const existing = this.getLandingPage(id);
      if (!existing) return false;

      const updated: LandingPageData = {
        ...existing,
        businessData,
        content,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(
        `${this.STORAGE_PREFIX}${id}`, 
        JSON.stringify(updated)
      );

      return true;
    } catch (error) {
      console.error('Failed to update landing page:', error);
      return false;
    }
  }

  // Delete landing page
  deleteLandingPage(id: string): boolean {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${id}`);
      this.removeFromIndex(id);
      return true;
    } catch (error) {
      console.error('Failed to delete landing page:', error);
      return false;
    }
  }

  // Get all landing page IDs
  getAllLandingPageIds(): string[] {
    try {
      const index = localStorage.getItem(this.INDEX_KEY);
      if (!index) return [];
      
      return JSON.parse(index) as string[];
    } catch (error) {
      console.error('Failed to retrieve landing page index:', error);
      return [];
    }
  }

  // Get all landing pages
  getAllLandingPages(): LandingPageData[] {
    const ids = this.getAllLandingPageIds();
    return ids
      .map(id => this.getLandingPage(id))
      .filter((page): page is LandingPageData => page !== null);
  }

  private updateIndex(id: string): void {
    try {
      const currentIds = this.getAllLandingPageIds();
      if (!currentIds.includes(id)) {
        currentIds.push(id);
        localStorage.setItem(this.INDEX_KEY, JSON.stringify(currentIds));
      }
    } catch (error) {
      console.error('Failed to update index:', error);
    }
  }

  private removeFromIndex(id: string): void {
    try {
      const currentIds = this.getAllLandingPageIds();
      const updatedIds = currentIds.filter(existingId => existingId !== id);
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(updatedIds));
    } catch (error) {
      console.error('Failed to remove from index:', error);
    }
  }

  // Clean up old landing pages (optional - could be used for maintenance)
  cleanupOldPages(maxAgeInDays: number = 30): number {
    try {
      const allPages = this.getAllLandingPages();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

      let deletedCount = 0;
      allPages.forEach(page => {
        const createdAt = new Date(page.createdAt);
        if (createdAt < cutoffDate) {
          this.deleteLandingPage(page.id);
          deletedCount++;
        }
      });

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old pages:', error);
      return 0;
    }
  }
}

export const landingPageStorage = new LandingPageStorage(); 