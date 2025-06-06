export interface GeneratedContent {
  headline: string;
  subheadline: string;
  valuePropositions: string[];
  services: Service[];
  callToAction: CallToAction;
  aboutSection: string;
  contactInfo: ContactInfo;
  testimonials?: Testimonial[];
  features?: Feature[];
  theme: LandingPageTheme;
}

export interface Service {
  name: string;
  description: string;
  price?: string;
  duration?: string;
  features?: string[];
}

export interface CallToAction {
  primary: {
    text: string;
    action: string;
  };
  secondary?: {
    text: string;
    action: string;
  };
}

export interface ContactInfo {
  phone: string;
  email?: string;
  address: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface ContentGenerationRequest {
  businessData: BusinessData;
  tone?: 'professional' | 'friendly' | 'casual' | 'luxury';
  style?: 'modern' | 'classic' | 'minimalist' | 'bold';
  targetAudience?: string;
  industry?: string;
  specialRequests?: string;
}

export interface LandingPageTheme {
  id: string;
  name: string;
  businessType: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    cardBackground: string;
    cardBorder: string;
    gradientFrom: string;
    gradientTo: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'single-page' | 'multi-section' | 'sidebar';
  spacing: {
    sectionGap: string;
    cardPadding: string;
    containerMaxWidth: string;
  };
  effects: {
    cardBlur: boolean;
    gradientBackground: boolean;
    animations: boolean;
    shadows: 'soft' | 'medium' | 'strong' | 'none';
  };
}

import { BusinessData } from './business'; 