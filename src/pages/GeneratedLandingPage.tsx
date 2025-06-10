import { FloatingActionButton } from '@/components/FloatingActionButton';
import HTMLRenderer from '@/components/HTMLRenderer';
import { Button } from '@/components/ui/button';
import { landingPageStorage } from '@/lib/landingPageStorage';
import type { BusinessData } from '@/types/business';
import type { GeneratedContent } from '@/types/content';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// Main Component - Now with HTML-first implementation
function ThemedLandingPageContent({ businessData, content, pageId }: { businessData: BusinessData; content: GeneratedContent; pageId: string }) {
  // If we have HTML content, render it directly
  if (content.htmlDocument) {
    const isPreview = pageId === 'preview';

    return (
      <>
        <HTMLRenderer
          htmlContent={content.htmlDocument}
          isPreview={isPreview}
        />

        {/* Only show floating button for saved pages (not preview) */}
        {!isPreview && (
          <FloatingActionButton
            businessName={businessData.name}
            htmlContent={content.htmlDocument} // Always use original HTML for export
          />
        )}
      </>
    );
  }

  // Fallback placeholder for content without HTML
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 Ready for HTML Generation</h1>
          <p className="text-xl text-gray-600 mb-6">
            Landing page for {businessData.name} is ready for HTML generation
          </p>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Content Available ✅</h2>
            <div className="text-left space-y-2 text-sm text-gray-600">
              <div>✅ Headline: {content.headline}</div>
              <div>✅ Services: {content.services.length} items</div>
              <div>✅ Value Props: {content.valuePropositions.length} items</div>
              <div>✅ Contact Info: Available</div>
            </div>
            <p className="text-blue-600 font-medium mt-4">🎯 Ready for HTML generation with complete creative freedom!</p>
          </div>
        </div>
      </div>

      {/* Only show floating button for saved pages (not preview) */}
      {pageId !== 'preview' && (
        <FloatingActionButton
          businessName={businessData.name}
        />
      )}
    </>
  );
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
    <ThemedLandingPageContent
      businessData={businessData}
      content={content}
      pageId={pageId || 'preview'}
    />
  );
}

export default GeneratedLandingPage; 