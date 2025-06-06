import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-white font-bold text-xl">
          Landify
        </div>
        <div className="flex items-center space-x-8">
          <a href="/pages" className="text-gray-300 hover:text-white transition-colors">My Pages</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a>
          <Button 
            variant="outline" 
            className="border-gray-600 text-black-300 hover:bg-white hover:text-slate-900 transition-all duration-300"
            onClick={() => window.location.href = '/onboarding'}
          >
            Get Started
          </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <header className="text-center pt-20 pb-32">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Create Stunning Landing Pages with
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Automation
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed mb-10">
            Our AI automatically generates unique designs and content for every business. 
            From your business info to a professional landing page in minutes - completely automated.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={() => navigate('/onboarding')}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Generate My Landing Page
            </Button>
            <Button 
              onClick={() => navigate('/pages')}
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-10 py-4 text-lg font-medium transition-all duration-300"
            >
              View Examples
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fully Automated</h3>
              <p className="text-gray-300">AI handles everything - design, content, and optimization automatically</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0V4a2 2 0 012-2h2a2 2 0 012 2v2M7 7l3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Unique Every Time</h3>
              <p className="text-gray-300">Every landing page gets a custom design tailored to the business</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready in Minutes</h3>
              <p className="text-gray-300">From business info to professional landing page in under 5 minutes</p>
            </div>
          </div>
        </header>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <div className="group p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Smart Business Search</h3>
            <p className="text-gray-300 leading-relaxed">
              Find your business on Google Maps instantly or enter details manually. 
              We automatically gather all the information needed for your perfect landing page.
            </p>
          </div>

          <div className="group p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">AI Content Generation</h3>
            <p className="text-gray-300 leading-relaxed">
              Our advanced AI creates compelling headlines, value propositions, and 
              marketing copy perfectly tailored to your business and target audience.
            </p>
          </div>

          <div className="group p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Visual Page Editor</h3>
            <p className="text-gray-300 leading-relaxed">
              Customize and preview your generated content with our intuitive 
              visual editor before publishing your professional landing page.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 relative z-10">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Search Your Business</h3>
                <p className="text-gray-300 leading-relaxed max-w-sm">
                  Enter your business name and location to automatically gather all necessary information from Google Maps
                </p>
              </div>
              {/* Connecting line */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-400/50 to-purple-400/50 z-0"></div>
            </div>
            
            <div className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 relative z-10">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Customize Content</h3>
                <p className="text-gray-300 leading-relaxed max-w-sm">
                  Choose your preferred tone, style, and target audience for personalized AI content generation
                </p>
              </div>
              {/* Connecting line */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 z-0"></div>
            </div>
            
            <div className="relative">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 relative z-10">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Generate & Publish</h3>
                <p className="text-gray-300 leading-relaxed max-w-sm">
                  AI creates your professional content, then customize it with our visual editor before going live
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your business?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that have already created their professional landing pages with Landify
          </p>
          <Button 
            size="lg" 
            className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-4 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => window.location.href = '/onboarding'}
          >
            Start Building Now
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center pb-12 text-gray-400 border-t border-white/10 pt-12">
          <p>© 2024 Landify. AI-powered landing pages made simple.</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage; 