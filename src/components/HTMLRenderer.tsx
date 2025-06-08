import React from 'react';

interface HTMLRendererProps {
    htmlContent: string;
    className?: string;
    isPreview?: boolean;
}

const HTMLRenderer: React.FC<HTMLRendererProps> = ({ htmlContent, className = '', isPreview = false }) => {
  if (!htmlContent) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Generating beautiful landing page...</p>
        </div>
      </div>
    );
  }

  // Extract the body content from the full HTML document
  const extractBodyContent = (html: string): string => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1];
    }
    return html; // Return full content if no body tag found
  };

  // Extract head content for inline styles and scripts
  const extractHeadContent = (html: string): string => {
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (headMatch && headMatch[1]) {
      return headMatch[1];
    }
    return '';
  };

  const bodyContent = extractBodyContent(htmlContent);
  const headContent = extractHeadContent(htmlContent);

  // Adjust content for preview mode
  const adjustedContent = isPreview
    ? bodyContent
      .replace(/height:\s*100vh/g, 'height: 80vh')
      .replace(/min-height:\s*100vh/g, 'min-height: 80vh')
      .replace(/h-screen/g, 'h-[80vh]')
      .replace(/min-h-screen/g, 'min-h-[80vh]')
    : bodyContent;

  return (
    <div className={`w-full ${className}`}>
      {/* Inject head content (styles, scripts) */}
      <div dangerouslySetInnerHTML={{ __html: headContent }} />

      {/* Render body content directly */}
      <div
        className={isPreview ? 'max-h-[80vh] overflow-y-auto' : ''}
        dangerouslySetInnerHTML={{ __html: adjustedContent }}
      />
    </div>
  );
};

export default HTMLRenderer; 