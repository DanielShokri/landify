import React from 'react';
import { MapPin, Car, Navigation, Landmark } from 'lucide-react';
import { LocationHighlights as LocationHighlightsType } from '@/types/content';
import { useTheme } from '@/components/ThemeProvider';

interface LocationHighlightsProps {
  locationHighlights: LocationHighlightsType;
}

export function LocationHighlights({ locationHighlights }: LocationHighlightsProps) {
  const { theme, getCardClasses, getCardPadding } = useTheme();

  const highlights = [
    {
      icon: MapPin,
      title: 'Neighborhood',
      description: locationHighlights.neighborhood,
      color: theme.colors.primary
    },
    {
      icon: Navigation,
      title: 'Accessibility',
      description: locationHighlights.accessibility,
      color: theme.colors.secondary
    },
    {
      icon: Car,
      title: 'Parking',
      description: locationHighlights.parking,
      color: theme.colors.accent
    },
    {
      icon: Landmark,
      title: 'Nearby',
      description: locationHighlights.nearbyLandmarks,
      color: theme.colors.primary
    }
  ];

  return (
    <div className={`${getCardClasses()} ${getCardPadding()}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Location & Convenience
        </h3>
        <p className="theme-text-secondary">
          Everything you need to know about visiting us
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map(({ icon: Icon, title, description, color }, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-8 h-8" style={{ color }} />
            </div>
            <h4 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
              {title}
            </h4>
            <p className="text-sm theme-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Location Benefits */}
      <div className="mt-8 pt-8 border-t" style={{ borderColor: theme.colors.cardBorder }}>
        <div className="text-center">
          <h4 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
            Why Our Location Works for You
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
              <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.colors.primary}20` }}>
                <Navigation className="w-4 h-4" style={{ color: theme.colors.primary }} />
              </div>
              <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
                Easy to Find
              </p>
              <p className="text-xs theme-text-secondary mt-1">
                Clear directions and visible signage
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
              <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.colors.secondary}20` }}>
                <Car className="w-4 h-4" style={{ color: theme.colors.secondary }} />
              </div>
              <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
                Convenient Access
              </p>
              <p className="text-xs theme-text-secondary mt-1">
                Multiple transportation options
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
              <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.colors.accent}20` }}>
                <Landmark className="w-4 h-4" style={{ color: theme.colors.accent }} />
              </div>
              <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
                Prime Location
              </p>
              <p className="text-xs theme-text-secondary mt-1">
                In the heart of the community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationHighlights; 