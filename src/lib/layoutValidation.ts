import type { AILayoutInstructions } from '@/types/content';
import { z } from 'zod';

// Section variant schemas
const HeroSectionSchema = z.object({
  id: z.literal('hero'),
  order: z.number(),
  variant: z.enum(['full-screen', 'split-content', 'minimal-centered', 'image-overlay', 'video-background', 'compact-banner']),
  contentAlignment: z.enum(['center', 'left', 'right']).optional(),
  backgroundType: z.enum(['solid', 'gradient', 'image', 'video']).optional(),
  heightClass: z.enum(['h-screen', 'h-96', 'h-80', 'h-64']).optional(),
  paddingClass: z.enum(['p-4', 'p-8', 'p-12', 'p-16']).optional(),
  textAlignment: z.enum(['text-center', 'text-left', 'text-right']).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  animationStyle: z.enum(['fadeIn', 'slideUp', 'zoomIn', 'none']).optional()
});

const ServicesSectionSchema = z.object({
  id: z.literal('services'),
  order: z.number(),
  variant: z.enum(['card-grid', 'list-view', 'carousel', 'masonry', 'table-view', 'icon-blocks']),
  columns: z.number().min(1).max(4).optional(),
  spacing: z.enum(['gap-4', 'gap-6', 'gap-8', 'gap-12']).optional(),
  cardStyle: z.enum(['elevated', 'bordered', 'minimal', 'glassmorphism']).optional(),
  layoutPattern: z.enum(['equal-width', 'featured-first', 'alternating', 'pyramid']).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

const AboutSectionSchema = z.object({
  id: z.literal('about'),
  order: z.number(),
  variant: z.enum(['text-image', 'image-text', 'centered-text', 'timeline', 'stats-focused']),
  imagePosition: z.enum(['left', 'right', 'top', 'background']).optional(),
  textColumns: z.number().min(1).max(2).optional(),
  emphasis: z.enum(['text', 'visual', 'balanced']).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

const ContactSectionSchema = z.object({
  id: z.literal('contact'),
  order: z.number(),
  variant: z.enum(['form-focused', 'info-blocks', 'map-integrated', 'minimal-footer', 'cta-banner']),
  layout: z.enum(['horizontal', 'vertical', 'grid']).optional(),
  ctaStyle: z.enum(['button', 'banner', 'floating', 'inline']).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

// Generic section schema for additional sections
const GenericSectionSchema = z.object({
  id: z.string(),
  order: z.number(),
  variant: z.string(),
  bgColor: z.string().optional()
}).passthrough(); // Allow additional properties

// Main layout validation schema
const AILayoutSchema = z.object({
  type: z.enum(['hero-centric', 'service-focused', 'story-driven', 'contact-first', 'visual-portfolio', 'minimal-modern', 'full-immersive']),
  pageFlow: z.enum(['vertical-scroll', 'sectioned-blocks', 'card-based', 'magazine-style']),
  sections: z.array(
    z.union([
      HeroSectionSchema,
      ServicesSectionSchema,
      AboutSectionSchema,
      ContactSectionSchema,
      GenericSectionSchema
    ])
  ),
  globalStyle: z.object({
    containerWidth: z.enum(['max-w-7xl', 'max-w-6xl', 'max-w-5xl', 'max-w-4xl', 'full-width']),
    sectionSpacing: z.enum(['space-y-8', 'space-y-12', 'space-y-16', 'space-y-20']),
    borderRadius: z.enum(['rounded-none', 'rounded-lg', 'rounded-xl', 'rounded-2xl']),
    shadowIntensity: z.enum(['shadow-none', 'shadow-md', 'shadow-lg', 'shadow-xl']),
    animationStyle: z.enum(['none', 'subtle', 'moderate', 'dynamic']),
    primaryFont: z.string().optional(),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
  }),
  responsiveBreakpoints: z.object({
    mobile: z.enum(['block', 'hidden']),
    tablet: z.enum(['md:block', 'md:hidden']),
    desktop: z.enum(['lg:block', 'lg:hidden'])
  })
});

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  sanitizedLayout?: AILayoutInstructions;
}

export function validateAILayout(layout: any): ValidationResult {
  try {
    const validated = AILayoutSchema.parse(layout);
    
    // Additional business logic validation
    const errors: string[] = [];
    
    // Check section order uniqueness
    const orders = validated.sections.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push('Section orders must be unique');
    }
    
    // Check for required hero section
    const hasHero = validated.sections.some(s => s.id === 'hero');
    if (!hasHero) {
      errors.push('Layout must include a hero section');
    }
    
    // Validate column count for grid layouts
    validated.sections.forEach(section => {
      if (section.id === 'services' && 'variant' in section && section.variant === 'card-grid' && 'columns' in section) {
        const columns = (section as any).columns;
        if (typeof columns === 'number' && (columns < 1 || columns > 4)) {
          errors.push(`Invalid column count for section ${section.id}`);
        }
      }
    });
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return {
      isValid: true,
      sanitizedLayout: validated as AILayoutInstructions
    };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { isValid: false, errors };
    }
    
    return { 
      isValid: false, 
      errors: ['Unknown validation error'] 
    };
  }
}

export function createFallbackLayout(): AILayoutInstructions {
  return {
    type: 'hero-centric',
    pageFlow: 'vertical-scroll',
    sections: [
      {
        id: 'hero',
        order: 1,
        variant: 'full-screen',
        contentAlignment: 'center',
        backgroundType: 'gradient',
        heightClass: 'h-screen',
        paddingClass: 'p-8',
        textAlignment: 'text-center'
      },
      {
        id: 'services',
        order: 2,
        variant: 'card-grid',
        columns: 3,
        spacing: 'gap-6',
        cardStyle: 'elevated',
        layoutPattern: 'equal-width'
      },
      {
        id: 'about',
        order: 3,
        variant: 'text-image',
        imagePosition: 'right',
        textColumns: 1,
        emphasis: 'balanced'
      },
      {
        id: 'contact',
        order: 4,
        variant: 'info-blocks',
        layout: 'horizontal',
        ctaStyle: 'button'
      }
    ],
    globalStyle: {
      containerWidth: 'max-w-6xl',
      sectionSpacing: 'space-y-12',
      borderRadius: 'rounded-lg',
      shadowIntensity: 'shadow-md',
      animationStyle: 'subtle'
    },
    responsiveBreakpoints: {
      mobile: 'block',
      tablet: 'md:block',
      desktop: 'lg:block'
    }
  };
} 