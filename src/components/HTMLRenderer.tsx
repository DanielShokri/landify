import React, { useEffect, useRef } from 'react';

interface HTMLRendererProps {
    htmlContent: string;
    className?: string;
}

const HTMLRenderer: React.FC<HTMLRendererProps> = ({ htmlContent, className = '' }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current && htmlContent) {
            const iframe = iframeRef.current;

            // Write the HTML content to the iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(htmlContent);
                iframeDoc.close();

                // Auto-resize iframe to content height
                const resizeIframe = () => {
                    try {
                        const body = iframeDoc.body;
                        const html = iframeDoc.documentElement;
                        if (body && html) {
                            const height = Math.max(
                                body.scrollHeight,
                                body.offsetHeight,
                                html.clientHeight,
                                html.scrollHeight,
                                html.offsetHeight
                            );
                            iframe.style.height = `${height}px`;
                        }
                    } catch (error) {
                        console.warn('Could not resize iframe:', error);
                        // Fallback height
                        iframe.style.height = '100vh';
                    }
                };

                // Initial resize after content loads
                setTimeout(resizeIframe, 100);

                // Listen for content changes and resize
                const observer = new MutationObserver(resizeIframe);
                observer.observe(iframeDoc.body || iframeDoc.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });

                // Cleanup observer on unmount
                return () => observer.disconnect();
            }
        }
    }, [htmlContent]);

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

    return (
        <div className={`w-full ${className}`}>
            <iframe
                ref={iframeRef}
                className="w-full border-0 rounded-lg shadow-lg"
                style={{ minHeight: '600px', height: 'auto' }}
                title="Generated Landing Page"
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
            />
        </div>
    );
};

export default HTMLRenderer; 