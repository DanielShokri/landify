import FeatureCard from '@/components/FeatureCard';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Clock, Lightbulb, Palette, Puzzle, Search, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Layout variant="landing">
      {/* Hero Section */}
      <header className="text-center pt-20 pb-32">
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        AI-Driven Landing Pages
          </span>
          <br />
                    Tailored for Your Business.
        </h1>
        <p className="text-xl text-center text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
                    Our AI automatically generates unique designs and content for every business.
                    From your business info to a professional landing page in under 15 seconds - completely automated.
        </p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center mb-16">
          <Button
            onClick={() => navigate('/onboarding')}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 text-base md:px-10 md:py-4 md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full md:w-auto"
          >
            <span className="hidden sm:inline">Generate My Landing Page</span>
            <span className="sm:hidden">Create Page</span>
          </Button>
          <Button
            onClick={() => navigate('/pages')}
            variant="outline"
            size="lg"
            className="border-white/20 text-black hover:bg-white/10 hover:text-white px-6 py-3 text-base md:px-10 md:py-4 md:text-lg font-medium transition-all duration-300 w-full md:w-auto"
          >
            <span className="hidden sm:inline">View Examples</span>
            <span className="sm:hidden">Examples</span>
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            icon={Zap}
            title="Fully Automated"
            description="AI handles everything - design, content, and optimization automatically"
            variant="landing"
            gradientFrom="blue-400"
            gradientTo="blue-600"
          />

          <FeatureCard
            icon={Palette}
            title="Unique Every Time"
            description="Every landing page gets a custom design tailored to the business"
            variant="landing"
            gradientFrom="purple-400"
            gradientTo="purple-600"
          />

          <FeatureCard
            icon={Clock}
            title="Lightning Fast"
            description="From business info to professional landing page in under 15 seconds"
            variant="landing"
            gradientFrom="green-400"
            gradientTo="emerald-600"
          />
        </div>
      </header>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        <FeatureCard
          icon={Search}
          title="Smart Business Search"
          description="Find your business on Google Maps instantly or enter details manually. We automatically gather all the information needed for your perfect landing page."
          variant="detailed"
          gradientFrom="blue-400"
          gradientTo="blue-600"
        />

        <FeatureCard
          icon={Lightbulb}
          title="AI Content Generation"
          description="Our advanced AI creates compelling headlines, value propositions, and marketing copy perfectly tailored to your business and target audience."
          variant="detailed"
          gradientFrom="purple-400"
          gradientTo="purple-600"
        />

        <FeatureCard
          icon={Puzzle}
          title="Professional Design"
          description="Get a beautifully designed landing page with professional layouts, optimized for conversions and mobile responsiveness."
          variant="detailed"
          gradientFrom="indigo-400"
          gradientTo="indigo-600"
        />
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
            <div className="hidden md:block absolute top-8 left-[63%] w-[88%] h-0.5 bg-gradient-to-r from-blue-400/50 to-purple-400/50 z-0"></div>
          </div>

          <div className="relative">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 relative z-10">
                                2
              </div>
              <h3 className="text-xl font-semibent text-white mb-3">Customize Content</h3>
              <p className="text-gray-300 leading-relaxed max-w-sm">
                                Choose your preferred tone, style, and target audience for personalized AI content generation
              </p>
            </div>
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[63%] w-[88%] h-0.5 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 z-0"></div>
          </div>

          <div className="relative">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 relative z-10">
                                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Generate & Publish</h3>
              <p className="text-gray-300 leading-relaxed max-w-sm">
                                AI creates your professional landing page with optimized content and design, ready to go live instantly
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
          className="bg-white text-slate-900 hover:bg-gray-100 px-6 py-3 text-base md:px-10 md:py-4 md:text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full max-w-xs md:w-auto"
          onClick={() => navigate('/onboarding')}
        >
          <span className="hidden sm:inline">Start Building Now</span>
          <span className="sm:hidden">Start Now</span>
        </Button>
      </div>
    </Layout>
  );
}

export default LandingPage; 