import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { landingPageStorage } from '@/lib/landingPageStorage';
import { BusinessData } from '@/types/business';
import { GeneratedContent } from '@/types/content';
import { MapPin, Star, Check, Phone, Mail, Plus, AlertCircle } from 'lucide-react';

// Different layout components for different business structures
function HeroFocusedLayout({ businessData, content }: { businessData: BusinessData; content: GeneratedContent }) {
  const { theme, getCardClasses, getButtonClasses, getContainerClasses, getSectionSpacing, getCardPadding } = useTheme();
  const navigate = useNavigate();

  const handleCallToAction = () => {
    if (businessData.phone) {
      window.open(`tel:${businessData.phone}`, '_self');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
      {theme.effects.gradientBackground && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.primary }}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.secondary }}></div>
        </div>
      )}

      {/* Minimal Navigation */}
      <nav className={`relative z-10 flex justify-between items-center p-6 ${getContainerClasses()}`}>
        <div className="font-bold text-2xl" style={{ color: theme.colors.text }}>
          {businessData.name}
        </div>
        <Button 
          onClick={handleCallToAction}
          className={`theme-button-primary ${getButtonClasses()}`}
        >
          {content.callToAction.primary.text}
        </Button>
      </nav>

      {/* Large Hero Section */}
      <div className={`relative z-10 ${getContainerClasses()}`}>
        <header className="text-center pt-32 pb-20">
          <h1 className="text-7xl md:text-8xl font-bold mb-8 leading-tight" style={{ color: theme.colors.text }}>
            {content.headline}
          </h1>
          <p className="text-2xl mb-16 max-w-4xl mx-auto leading-relaxed theme-text-secondary">
            {content.subheadline}
          </p>
          <Button 
            size="lg" 
            onClick={handleCallToAction}
            className={`theme-button-primary px-12 py-6 text-xl ${getButtonClasses()}`}
          >
            {content.callToAction.primary.text}
          </Button>
        </header>

        {/* Inline Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {content.valuePropositions.map((proposition, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 theme-background-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" style={{ color: theme.colors.background }} />
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text }}>{proposition}</h3>
            </div>
          ))}
        </div>

        {/* Contact Bar */}
        <div className={`${getCardClasses()} ${getCardPadding()} text-center`}>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center">
              <Phone className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
              <span className="text-xl theme-text-secondary">{content.contactInfo.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
              <span className="text-xl theme-text-secondary">{content.contactInfo.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantMenuLayout({ businessData, content }: { businessData: BusinessData; content: GeneratedContent }) {
  const { theme, getCardClasses, getButtonClasses, getContainerClasses, getSectionSpacing, getCardPadding } = useTheme();

  const handleCallToAction = () => {
    if (businessData.phone) {
      window.open(`tel:${businessData.phone}`, '_self');
    }
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
      {/* Header with restaurant info */}
      <header className={`theme-card mx-auto mb-0 ${getCardClasses()}`} style={{ borderRadius: '0' }}>
        <div className={`${getContainerClasses()} py-8`}>
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4" style={{ color: theme.colors.text }}>
              {content.headline}
            </h1>
            <p className="text-xl mb-6 theme-text-secondary">{content.subheadline}</p>
            
            {businessData.rating && (
              <div className="flex items-center justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-6 h-6"
                    style={{ color: star <= Math.floor(businessData.rating!) ? theme.colors.accent : theme.colors.textSecondary }}
                    fill="currentColor"
                  />
                ))}
                <span className="ml-2 text-lg font-semibold" style={{ color: theme.colors.text }}>
                  {businessData.rating} ({businessData.reviews} reviews)
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCallToAction}
                className={`theme-button-primary px-8 py-3 text-lg ${getButtonClasses()}`}
              >
                Order Now
              </Button>
              <Button 
                variant="outline"
                className="border-2 px-8 py-3 text-lg"
                style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}
              >
                View Location
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu/Services Grid */}
      <div className={`${getContainerClasses()} py-16`}>
        <h2 className="text-4xl font-bold text-center mb-12" style={{ color: theme.colors.text }}>Our Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.services.map((service, index) => (
            <div key={index} className={`${getCardClasses()} ${getCardPadding()}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-semibold" style={{ color: theme.colors.text }}>{service.name}</h3>
                {service.price && (
                  <span className="text-2xl font-bold" style={{ color: theme.colors.accent }}>{service.price}</span>
                )}
              </div>
              <p className="theme-text-secondary text-lg leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="theme-card mx-auto" style={{ borderRadius: '0' }}>
        <div className={`${getContainerClasses()} py-16 text-center`}>
          <h2 className="text-4xl font-bold mb-8" style={{ color: theme.colors.text }}>Our Story</h2>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto theme-text-secondary">
            {content.aboutSection}
          </p>
        </div>
      </div>

      {/* Contact Footer */}
      <footer className={`${getContainerClasses()} py-12`}>
        <div className={`${getCardClasses()} ${getCardPadding()} text-center`}>
          <h3 className="text-2xl font-bold mb-6" style={{ color: theme.colors.text }}>Visit Us Today</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
                <span className="text-lg theme-text-secondary">{content.contactInfo.address}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Phone className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
                <span className="text-lg theme-text-secondary">{content.contactInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceGridLayout({ businessData, content }: { businessData: BusinessData; content: GeneratedContent }) {
  const { theme, getCardClasses, getButtonClasses, getContainerClasses, getSectionSpacing, getCardPadding } = useTheme();

  const handleCallToAction = () => {
    if (businessData.phone) {
      window.open(`tel:${businessData.phone}`, '_self');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
      {theme.effects.gradientBackground && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.primary }}></div>
        </div>
      )}

      {/* Compact Header */}
      <header className={`relative z-10 ${getContainerClasses()} py-12 text-center`}>
        <h1 className="text-5xl font-bold mb-4" style={{ color: theme.colors.text }}>
          {businessData.name}
        </h1>
        <p className="text-xl theme-text-secondary mb-8">{content.subheadline}</p>
        <Button 
          onClick={handleCallToAction}
          className={`theme-button-primary px-8 py-3 ${getButtonClasses()}`}
        >
          {content.callToAction.primary.text}
        </Button>
      </header>

      {/* Large Services Grid */}
      <div className={`relative z-10 ${getContainerClasses()} pb-20`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services.map((service, index) => (
            <div key={index} className={`${getCardClasses()} ${getCardPadding()} text-center group hover:scale-105 transition-transform duration-300`}>
              <div className="w-16 h-16 theme-background-gradient rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl" style={{ color: theme.colors.background }}>
                  {['🚀', '⭐', '🎯', '💼', '🔧', '📈'][index % 6]}
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text }}>{service.name}</h3>
              <p className="theme-text-secondary leading-relaxed mb-6">{service.description}</p>
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 text-left">
                  {service.features.slice(0, 3).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center theme-text-secondary">
                      <Check className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: theme.colors.accent }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Value Props Row */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.valuePropositions.map((proposition, index) => (
            <div key={index} className={`${getCardClasses()} ${getCardPadding()} text-center`}>
              <h4 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>{proposition}</h4>
              <p className="theme-text-secondary">Experience excellence in every interaction.</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-20 text-center">
          <div className={`${getCardClasses()} ${getCardPadding()} max-w-2xl mx-auto`}>
            <h3 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>Ready to Get Started?</h3>
            <p className="text-xl theme-text-secondary mb-8">{content.aboutSection}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3" style={{ color: theme.colors.primary }} />
                <span className="theme-text-secondary">{content.contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3" style={{ color: theme.colors.primary }} />
                <span className="theme-text-secondary">{content.contactInfo.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactFirstLayout({ businessData, content }: { businessData: BusinessData; content: GeneratedContent }) {
  const { theme, getCardClasses, getButtonClasses, getContainerClasses, getSectionSpacing, getCardPadding } = useTheme();

  const handleCallToAction = () => {
    if (businessData.phone) {
      window.open(`tel:${businessData.phone}`, '_self');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
      {/* Contact-First Header */}
      <header className={`${getContainerClasses()} py-20 text-center`}>
        <h1 className="text-6xl font-bold mb-6" style={{ color: theme.colors.text }}>
          {content.headline}
        </h1>
        <p className="text-2xl theme-text-secondary mb-12 max-w-3xl mx-auto">{content.subheadline}</p>
        
        {/* Prominent Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className={`${getCardClasses()} ${getCardPadding()} text-center group hover:scale-105 transition-transform duration-300`}>
            <div className="w-16 h-16 theme-background-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8" style={{ color: theme.colors.background }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>Call Now</h3>
            <p className="text-lg theme-text-secondary mb-4">{content.contactInfo.phone}</p>
            <Button 
              onClick={handleCallToAction}
              className={`w-full theme-button-primary ${getButtonClasses()}`}
            >
              Call Today
            </Button>
          </div>

          <div className={`${getCardClasses()} ${getCardPadding()} text-center`}>
            <div className="w-16 h-16 theme-background-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8" style={{ color: theme.colors.background }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>Visit Us</h3>
            <p className="text-lg theme-text-secondary mb-4">{content.contactInfo.address}</p>
            <Button 
              variant="outline"
              className="w-full border-2"
              style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}
            >
              Get Directions
            </Button>
          </div>

          <div className={`${getCardClasses()} ${getCardPadding()} text-center`}>
            <div className="w-16 h-16 theme-background-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" style={{ color: theme.colors.background }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>Email Us</h3>
            <p className="text-lg theme-text-secondary mb-4">{content.contactInfo.email || 'info@business.com'}</p>
            <Button 
              variant="outline"
              className="w-full border-2"
              style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}
            >
              Send Email
            </Button>
          </div>
        </div>
      </header>

      {/* Services Summary */}
      <div className={`${getContainerClasses()} py-16`}>
        <h2 className="text-4xl font-bold text-center mb-12" style={{ color: theme.colors.text }}>What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {content.services.map((service, index) => (
            <div key={index} className={`${getCardClasses()} ${getCardPadding()}`}>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text }}>{service.name}</h3>
              <p className="theme-text-secondary leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About & Values */}
      <div className={`${getContainerClasses()} py-16`}>
        <div className={`${getCardClasses()} ${getCardPadding()} max-w-4xl mx-auto text-center`}>
          <h2 className="text-4xl font-bold mb-8" style={{ color: theme.colors.text }}>Why Choose {businessData.name}?</h2>
          <p className="text-xl leading-relaxed theme-text-secondary mb-8">{content.aboutSection}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.valuePropositions.map((proposition, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 theme-background-gradient rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" style={{ color: theme.colors.background }} />
                </div>
                <p className="font-semibold" style={{ color: theme.colors.text }}>{proposition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic Layout Renderer
function DynamicLayoutRenderer({ businessData, content }: { businessData: BusinessData; content: GeneratedContent }) {
  const layoutStructure = content.theme.layout.structure;

  switch (layoutStructure) {
    case 'restaurant-menu':
      return <RestaurantMenuLayout businessData={businessData} content={content} />;
    case 'service-grid':
      return <ServiceGridLayout businessData={businessData} content={content} />;
    case 'contact-first':
      return <ContactFirstLayout businessData={businessData} content={content} />;
    case 'hero-focused':
    default:
      return <HeroFocusedLayout businessData={businessData} content={content} />;
  }
}

// Main Component
function ThemedLandingPageContent({ businessData, content, pageId }: { businessData: BusinessData; content: GeneratedContent; pageId: string }) {
  return <DynamicLayoutRenderer businessData={businessData} content={content} />;
}

function GeneratedLandingPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a UUID-based route first
    if (pageId && pageId !== 'preview') {
      try {
        const landingPageData = landingPageStorage.getLandingPage(pageId);
        
        if (landingPageData) {
          setBusinessData(landingPageData.businessData);
          setContent(landingPageData.content);
        } else {
          setError('Landing page not found');
        }
      } catch (error) {
        console.error('Failed to load landing page:', error);
        setError('Failed to load landing page');
      }
    } else {
      // Fallback to URL parameters for backwards compatibility
      const businessDataParam = searchParams.get('businessData');
      const generatedContentParam = searchParams.get('generatedContent');
      
      if (businessDataParam && generatedContentParam) {
        try {
          const parsedBusinessData = JSON.parse(businessDataParam);
          const parsedContent = JSON.parse(generatedContentParam);
          setBusinessData(parsedBusinessData);
          setContent(parsedContent);
        } catch (error) {
          console.error('Failed to parse data:', error);
          setError('Invalid page data');
        }
      } else {
        setError('No page data provided');
      }
    }
  }, [pageId, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-white">{error}</h2>
          <p className="text-gray-400 mb-6">The requested landing page could not be found or loaded.</p>
          <Button onClick={() => navigate('/pages')} className="bg-blue-600 hover:bg-blue-700 text-white">
            View All Pages
          </Button>
        </div>
      </div>
    );
  }

  if (!businessData || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2 text-white">Loading...</h2>
          <p className="text-gray-400">Preparing your landing page</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={content.theme}>
      <ThemedLandingPageContent 
        businessData={businessData} 
        content={content} 
        pageId={pageId || 'preview'} 
      />
    </ThemeProvider>
  );
}

export default GeneratedLandingPage; 