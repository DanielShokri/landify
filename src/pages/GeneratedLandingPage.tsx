import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GeneratedContent } from '@/types/content';
import { BusinessData } from '@/types/business';
import { landingPageStorage } from '@/lib/landingPageStorage';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

function ThemedLandingPageContent({ businessData, content, pageId }: { businessData: BusinessData; content: GeneratedContent; pageId: string }) {
  const navigate = useNavigate();
  const { theme, getCardClasses, getButtonClasses, getContainerClasses, getSectionSpacing, getCardPadding } = useTheme();

  const handleCallToAction = () => {
    if (businessData.phone) {
      window.open(`tel:${businessData.phone}`, '_self');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
      {/* Background Effects */}
      {theme.effects.gradientBackground && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.primary }}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.secondary }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5 rounded-full blur-3xl" style={{ backgroundColor: theme.colors.accent }}></div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`relative z-10 flex justify-between items-center p-6 ${getContainerClasses()}`}>
        <div className="font-bold text-xl" style={{ color: theme.colors.text }}>
          {businessData.name}
        </div>
        <div className="flex items-center space-x-8">
          <a href="#about" className="theme-text-secondary hover:opacity-80 transition-colors">About</a>
          <a href="#services" className="theme-text-secondary hover:opacity-80 transition-colors">Services</a>
          <a href="#contact" className="theme-text-secondary hover:opacity-80 transition-colors">Contact</a>
          <Button 
            onClick={handleCallToAction}
            className={`theme-button-primary ${getButtonClasses()}`}
          >
            {content.callToAction.primary.text}
          </Button>
        </div>
      </nav>

      <div className={`relative z-10 ${getContainerClasses()}`}>
        {/* Hero Section */}
        <header className={`text-center pt-20 ${getSectionSpacing()}`}>
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight" style={{ color: theme.colors.text }}>
            {content.headline}
          </h1>
          <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed theme-text-secondary">
            {content.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleCallToAction}
              className={`theme-button-primary px-8 py-3 text-lg ${getButtonClasses()}`}
            >
              {content.callToAction.primary.text}
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="theme-text-secondary hover:opacity-80 px-8 py-3 text-lg font-medium transition-all duration-300"
            >
              Learn more
              <span className="ml-2">↓</span>
            </Button>
          </div>
        </header>

        {/* Value Propositions */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${getSectionSpacing()}`}>
          {content.valuePropositions.map((proposition, index) => (
            <div key={index} className={`group theme-card ${getCardClasses()} ${getCardPadding()}`}>
              <div className="w-12 h-12 theme-background-gradient rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" style={{ color: theme.colors.background }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: theme.colors.text }}>{proposition}</h3>
              <p className="theme-text-secondary leading-relaxed">
                Experience the difference with our professional approach and commitment to excellence.
              </p>
            </div>
          ))}
        </div>

        {/* Services Section */}
        <div id="services" className={getSectionSpacing()}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.colors.text }}>Our Services</h2>
            <p className="text-xl max-w-2xl mx-auto theme-text-secondary">
              We offer comprehensive solutions tailored to your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.services.map((service, index) => (
              <div key={index} className={`theme-card ${getCardClasses()} ${getCardPadding()}`}>
                <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text }}>{service.name}</h3>
                <p className="theme-text-secondary mb-6 leading-relaxed">{service.description}</p>
                {service.features && service.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium mb-3" style={{ color: theme.colors.text }}>Features:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center theme-text-secondary">
                          <svg className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: theme.colors.accent }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div id="about" className={getSectionSpacing()}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.colors.text }}>About {businessData.name}</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className={`theme-card ${getCardClasses()} ${getCardPadding()} text-center`}>
              <p className="text-xl leading-relaxed mb-8 theme-text-secondary">
                {content.aboutSection}
              </p>
              {businessData.rating && (
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5`}
                        style={{ color: star <= Math.floor(businessData.rating!) ? theme.colors.accent : theme.colors.textSecondary }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium" style={{ color: theme.colors.text }}>{businessData.rating} out of 5</span>
                  <span className="theme-text-secondary">({businessData.reviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className={getSectionSpacing()}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.colors.text }}>Get in Touch</h2>
            <p className="text-xl theme-text-secondary">
              Ready to get started? Contact us today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className={`theme-card ${getCardClasses()} ${getCardPadding()}`}>
              <h3 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text }}>Contact Information</h3>
              <div className="space-y-4">
                {content.contactInfo.phone && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" style={{ color: theme.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span className="theme-text-secondary">{content.contactInfo.phone}</span>
                  </div>
                )}
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5" style={{ color: theme.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="theme-text-secondary">{content.contactInfo.address}</span>
                </div>
                {content.contactInfo.email && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" style={{ color: theme.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="theme-text-secondary">{content.contactInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`theme-card ${getCardClasses()} ${getCardPadding()}`}>
              <h3 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text }}>Ready to Start?</h3>
              <p className="theme-text-secondary mb-6">
                Contact us today to learn more about how we can help you achieve your goals.
              </p>
              <Button 
                onClick={handleCallToAction}
                className={`w-full theme-button-primary ${getButtonClasses()}`}
                size="lg"
              >
                {content.callToAction.primary.text}
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center py-20 ${getSectionSpacing()}`}>
          <h2 className="text-4xl font-bold mb-6" style={{ color: theme.colors.text }}>Ready to Get Started?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto theme-text-secondary">
            Contact us today and let's discuss how we can help you achieve your goals.
          </p>
          <Button 
            size="lg" 
            onClick={handleCallToAction}
            className={`px-10 py-4 text-lg font-medium ${getButtonClasses()}`}
            style={{ 
              backgroundColor: theme.colors.background, 
              color: theme.colors.text,
              border: `2px solid ${theme.colors.primary}`
            }}
          >
            {content.callToAction.primary.text}
          </Button>
        </div>

        {/* Footer */}
        <footer className={`text-center pb-12 pt-12 ${getSectionSpacing()}`} style={{ borderTop: `1px solid ${theme.colors.cardBorder}` }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-left">
                <p className="font-semibold" style={{ color: theme.colors.text }}>{businessData.name}</p>
                <p className="text-sm theme-text-secondary">{businessData.address}</p>
              </div>
              <div className="text-center">
                <p className="theme-text-secondary">© 2024 {businessData.name}. All rights reserved.</p>
                <p className="text-sm mt-1 theme-text-secondary">Powered by Landify AI</p>
              </div>
              <div className="text-right">
                {content.contactInfo.phone && (
                  <p className="font-medium" style={{ color: theme.colors.text }}>{content.contactInfo.phone}</p>
                )}
                {content.contactInfo.email && (
                  <p className="text-sm theme-text-secondary">{content.contactInfo.email}</p>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Edit Mode Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => navigate(`/editor/${pageId}`)}
          className={`backdrop-blur-sm transition-all duration-300 ${getButtonClasses()}`}
          style={{ 
            backgroundColor: `${theme.colors.cardBackground}CC`, 
            border: `1px solid ${theme.colors.cardBorder}`,
            color: theme.colors.text
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Edit Page
        </Button>
      </div>
    </div>
  );
}

function GeneratedLandingPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);

  useEffect(() => {
    if (pageId) {
      try {
        const landingPageData = landingPageStorage.getLandingPage(pageId);
        
        if (landingPageData) {
          setBusinessData(landingPageData.businessData);
          setContent(landingPageData.content);
        } else {
          console.error('Landing page not found:', pageId);
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to load landing page:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [pageId, navigate]);

  if (!businessData || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
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
        pageId={pageId!} 
      />
    </ThemeProvider>
  );
}

export default GeneratedLandingPage; 