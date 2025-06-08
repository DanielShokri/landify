export interface GeneratedContent {
  htmlDocument?: string; // Full HTML document with TailwindCSS
  layout?: AILayoutInstructions;
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
  trustSignals?: TrustSignals;
  locationHighlights?: LocationHighlights;
  businessHours?: BusinessHoursInfo;
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
  hours?: {
    [key: string]: string;
  };
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
  layout: {
    type: 'single-page' | 'multi-section' | 'sidebar';
    structure: 'hero-focused' | 'service-grid' | 'story-driven' | 'feature-list' | 'testimonial-heavy' | 'restaurant-menu' | 'portfolio-showcase' | 'contact-first' | 'product-catalog';
    heroStyle: 'full-screen' | 'split-content' | 'minimal-text' | 'image-background' | 'video-background' | 'centered-compact';
    sectionOrder: string[];
    contentLayout: 'single-column' | 'two-column' | 'grid-3' | 'grid-4' | 'asymmetric' | 'sidebar-left' | 'sidebar-right';
    navigationStyle: 'top-bar' | 'side-menu' | 'minimal' | 'sticky-header' | 'hidden-scroll';
    ctaPlacement: 'hero-only' | 'multiple-sections' | 'floating-button' | 'footer-focus' | 'inline-content';
  };
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

import type { BusinessData } from './business';

export interface TrustSignals {
  rating: number;
  reviewCount: number;
  established: string;
  specialties: string[];
  guarantees: string[];
}

export interface LocationHighlights {
  neighborhood: string;
  accessibility: string;
  parking: string;
  nearbyLandmarks: string;
}

export interface BusinessHoursInfo {
  schedule: string;
  specialHours: string;
  availability: string;
}

export interface AILayoutInstructions {
  type: 'hero-centric' | 'service-focused' | 'story-driven' | 'contact-first' | 'visual-portfolio' | 'minimal-modern' | 'full-immersive';
  pageFlow: 'vertical-scroll' | 'sectioned-blocks' | 'card-based' | 'magazine-style';
  sections: AILayoutSection[];
  globalStyle: {
    containerWidth: 'max-w-7xl' | 'max-w-6xl' | 'max-w-5xl' | 'max-w-4xl' | 'full-width';
    sectionSpacing: 'space-y-8' | 'space-y-12' | 'space-y-16' | 'space-y-20';
    borderRadius: 'rounded-none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl';
    shadowIntensity: 'shadow-none' | 'shadow-md' | 'shadow-lg' | 'shadow-xl';
    animationStyle: 'none' | 'subtle' | 'moderate' | 'dynamic';
  };
  responsiveBreakpoints: {
    mobile: 'block' | 'hidden';
    tablet: 'md:block' | 'md:hidden';
    desktop: 'lg:block' | 'lg:hidden';
  };
}

export interface AILayoutSection {
  id: 'hero' | 'services' | 'about' | 'contact' | 'trust' | 'menu' | 'portfolio' | 'features' | 'hours' | string;
  order: number;
  variant: string;
  [key: string]: any; // Allow additional properties for specific section types
}

export interface HeroLayoutSection extends AILayoutSection {
  id: 'hero';
  variant: 'full-screen' | 'split-content' | 'minimal-centered' | 'image-overlay' | 'video-background' | 'compact-banner';
  contentAlignment: 'center' | 'left' | 'right';
  backgroundType: 'solid' | 'gradient' | 'image' | 'video';
  heightClass: 'h-screen' | 'h-96' | 'h-80' | 'h-64';
  paddingClass: 'p-4' | 'p-8' | 'p-12' | 'p-16';
  textAlignment: 'text-center' | 'text-left' | 'text-right';
}

export interface ServicesLayoutSection extends AILayoutSection {
  id: 'services';
  variant: 'card-grid' | 'list-view' | 'carousel' | 'masonry' | 'table-view' | 'icon-blocks';
  columns: 1 | 2 | 3 | 4;
  spacing: 'gap-4' | 'gap-6' | 'gap-8' | 'gap-12';
  cardStyle: 'elevated' | 'bordered' | 'minimal' | 'glassmorphism';
  layoutPattern: 'equal-width' | 'featured-first' | 'alternating' | 'pyramid';
}

export interface AboutLayoutSection extends AILayoutSection {
  id: 'about';
  variant: 'text-image' | 'image-text' | 'centered-text' | 'timeline' | 'stats-focused';
  imagePosition: 'left' | 'right' | 'top' | 'background';
  textColumns: 1 | 2;
  emphasis: 'text' | 'visual' | 'balanced';
}

export interface ContactLayoutSection extends AILayoutSection {
  id: 'contact';
  variant: 'form-focused' | 'info-blocks' | 'map-integrated' | 'minimal-footer' | 'cta-banner';
  layout: 'horizontal' | 'vertical' | 'grid';
  ctaStyle: 'button' | 'banner' | 'floating' | 'inline';
} 