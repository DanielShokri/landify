import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit3, Menu, X, Settings, Share, Eye, Download } from 'lucide-react';

interface FloatingActionButtonProps {
  pageId: string;
  businessName: string;
}

export function FloatingActionButton({ pageId, businessName }: FloatingActionButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleEdit = () => {
    navigate(`/editor/${pageId}`);
    setIsMenuOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${businessName} - Landing Page`,
        text: `Check out the landing page for ${businessName}`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
      alert('Page URL copied to clipboard!');
    }
    setIsMenuOpen(false);
  };

  const handleViewPages = () => {
    navigate('/pages');
    setIsMenuOpen(false);
  };

  const handleDownload = () => {
    try {
      // Get the current page content
      const pageContent = document.documentElement.outerHTML;
      
      // Create a cleaned HTML version
      const cleanedHTML = generateCleanHTML(pageContent, businessName);
      
      // Create and trigger download
      const blob = new Blob([cleanedHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_landing_page.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Failed to download landing page:', error);
      // Fallback: copy content to clipboard
      if (navigator.clipboard) {
        const pageContent = document.documentElement.outerHTML;
        navigator.clipboard.writeText(pageContent).then(() => {
          alert('Download failed, but page HTML has been copied to clipboard!');
        });
      } else {
        alert('Download failed. Please try again or contact support.');
      }
    }
    setIsMenuOpen(false);
  };

  // Generate a clean, self-contained HTML file
  const generateCleanHTML = (originalHTML: string, businessName: string): string => {
    // Create a clean HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${businessName} - Professional landing page">
    <title>${businessName} - Landing Page</title>
    
    <!-- Tailwind CSS CDN for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom styles extracted from the page -->
    <style>
        /* Remove floating action button and development artifacts */
        [data-floating-button], 
        [data-dev-tools],
        .floating-action-button {
            display: none !important;
        }
        
        /* Ensure responsive design */
        body {
            margin: 0;
            padding: 0;
            font-family: Inter, system-ui, -apple-system, sans-serif;
        }
        
        /* Custom gradient backgrounds */
        .bg-gradient-to-br {
            background: linear-gradient(to bottom right, var(--tw-gradient-stops));
        }
        
        /* Backdrop blur effect */
        .backdrop-blur-sm {
            backdrop-filter: blur(4px);
        }
        
        /* Animation classes */
        .animate-fade-in {
            animation: fadeIn 0.6s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Ensure all interactive elements work */
        button:hover {
            transform: translateY(-2px);
            transition: all 0.3s ease;
        }
        
        /* Print styles */
        @media print {
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <!-- Generated Landing Page Content -->
    ${extractMainContent(originalHTML)}
    
    <!-- Footer note -->
    <div style="text-align: center; padding: 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0; margin-top: 4rem;">
        <p style="color: #64748b; font-size: 0.875rem; margin: 0;">
            Landing page generated by Landify • <a href="https://landify.ai" style="color: #3b82f6;">Visit Landify</a>
        </p>
    </div>
    
    <script>
        // Basic interactivity for the exported page
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Add fade-in animation to sections
            const sections = document.querySelectorAll('section, .section');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                    }
                });
            });
            
            sections.forEach(section => {
                observer.observe(section);
            });
        });
    </script>
</body>
</html>`;
  };

  // Extract the main content without development artifacts
  const extractMainContent = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove floating action button and other development elements
    const elementsToRemove = [
      '[data-floating-button]',
      '.floating-action-button',
      '[data-dev-tools]',
      'script[src*="vite"]',
      'script[src*="localhost"]',
      'script[src*="@vite"]'
    ];
    
    elementsToRemove.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Get the main content (usually the body content)
    const mainContent = doc.querySelector('body')?.innerHTML || '';
    
    return mainContent;
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50" data-floating-button>
      {/* Menu Items */}
      {isMenuOpen && (
        <div className="absolute bottom-16 right-0 mb-4 space-y-3 animate-in slide-in-from-bottom duration-200">
          {/* Edit Button */}
          <div className="flex items-center justify-end space-x-3">
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap opacity-90">
              Edit Page
            </div>
            <Button
              onClick={handleEdit}
              size="sm"
              aria-label="Edit this landing page"
              className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
            >
              <Edit3 className="h-5 w-5" />
            </Button>
          </div>

          {/* Share Button */}
          <div className="flex items-center justify-end space-x-3">
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap opacity-90">
              Share Page
            </div>
            <Button
              onClick={handleShare}
              size="sm"
              aria-label="Share this landing page"
              className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>

          {/* Download Button */}
          <div className="flex items-center justify-end space-x-3">
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap opacity-90">
              Download HTML
            </div>
            <Button
              onClick={handleDownload}
              size="sm"
              aria-label="Download landing page as HTML file"
              className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>

          {/* View All Pages */}
          <div className="flex items-center justify-end space-x-3">
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap opacity-90">
              All Pages
            </div>
            <Button
              onClick={handleViewPages}
              size="sm"
              aria-label="View all landing pages"
              className="h-12 w-12 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={toggleMenu}
        aria-label={isMenuOpen ? 'Close menu' : 'Open page options menu'}
        className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105 ${
          isMenuOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-180'
            : 'bg-indigo-500 hover:bg-indigo-600'
        } text-white`}
      >
        {isMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Backdrop for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default FloatingActionButton; 