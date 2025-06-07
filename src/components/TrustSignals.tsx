import React from 'react';
import { Star, Award, Shield, Users } from 'lucide-react';
import { TrustSignals as TrustSignalsType } from '@/types/content';
import { useTheme } from '@/components/ThemeProvider';

interface TrustSignalsProps {
  trustSignals: TrustSignalsType;
}

export function TrustSignals({ trustSignals }: TrustSignalsProps) {
  const { theme, getCardClasses, getCardPadding } = useTheme();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className="w-5 h-5"
        style={{ 
          color: index < Math.floor(rating) ? theme.colors.accent : theme.colors.textSecondary 
        }}
        fill="currentColor"
      />
    ));
  };

  return (
    <div className={`${getCardClasses()} ${getCardPadding()}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Rating */}
        {trustSignals.rating > 0 && (
          <div className="text-center">
            <div className="flex justify-center mb-2">
              {renderStars(trustSignals.rating)}
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              {trustSignals.rating.toFixed(1)}/5
            </div>
            <p className="text-sm theme-text-secondary">
              {trustSignals.reviewCount} Reviews
            </p>
          </div>
        )}

        {/* Experience */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: `${theme.colors.primary}20` }}>
            <Award className="w-6 h-6" style={{ color: theme.colors.primary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
            {trustSignals.established}
          </p>
        </div>

        {/* Customer Count */}
        {trustSignals.reviewCount > 0 && (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: `${theme.colors.secondary}20` }}>
              <Users className="w-6 h-6" style={{ color: theme.colors.secondary }} />
            </div>
            <div className="text-lg font-bold" style={{ color: theme.colors.text }}>
              {trustSignals.reviewCount}+
            </div>
            <p className="text-sm theme-text-secondary">Happy Customers</p>
          </div>
        )}

        {/* Guarantees */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: `${theme.colors.accent}20` }}>
            <Shield className="w-6 h-6" style={{ color: theme.colors.accent }} />
          </div>
          <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
            {trustSignals.guarantees[0] || 'Quality Guaranteed'}
          </p>
        </div>
      </div>

      {/* Specialties */}
      {trustSignals.specialties && trustSignals.specialties.length > 0 && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: theme.colors.cardBorder }}>
          <h4 className="text-lg font-semibold mb-3 text-center" style={{ color: theme.colors.text }}>
            Our Specialties
          </h4>
          <div className="flex flex-wrap justify-center gap-2">
            {trustSignals.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded-full"
                style={{ 
                  backgroundColor: `${theme.colors.primary}20`,
                  color: theme.colors.primary 
                }}
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TrustSignals; 