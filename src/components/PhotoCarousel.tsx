import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { PlacePhoto } from '@/types/business';

interface PhotoCarouselProps {
  photos: PlacePhoto[];
  businessName: string;
  businessType?: string;
}

export function PhotoCarousel({ photos, businessName, businessType = 'business' }: PhotoCarouselProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentPhotoIndex];

  const goToPrevious = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  // Generate business-type-specific Unsplash URL as fallback
  const getPlaceholderImageUrl = (options?: { maxHeight?: number; maxWidth?: number }, index: number = 0) => {
    const width = options?.maxWidth || 800;
    const height = options?.maxHeight || 600;
    
    // Map business types to relevant search terms for Unsplash
    const getSearchTerms = (type: string, photoIndex: number): string => {
      const lowerType = type.toLowerCase();
      
      if (lowerType.includes('restaurant') || lowerType.includes('food')) {
        const foodTerms = ['restaurant,food,dining', 'kitchen,chef,cooking', 'food,delicious,meal', 'restaurant,interior,ambiance', 'dining,table,elegant'];
        return foodTerms[photoIndex % foodTerms.length];
      } else if (lowerType.includes('coffee') || lowerType.includes('cafe')) {
        const cafeTerms = ['coffee,cafe,coffeehouse', 'barista,coffee,beans', 'cafe,interior,cozy', 'latte,cappuccino,coffee', 'coffee,shop,morning'];
        return cafeTerms[photoIndex % cafeTerms.length];
      } else if (lowerType.includes('hotel') || lowerType.includes('lodging')) {
        const hotelTerms = ['hotel,accommodation,hospitality', 'hotel,room,luxury', 'hotel,lobby,elegant', 'hotel,bed,comfort', 'hotel,view,scenic'];
        return hotelTerms[photoIndex % hotelTerms.length];
      } else if (lowerType.includes('retail') || lowerType.includes('store') || lowerType.includes('shop')) {
        const retailTerms = ['retail,store,shopping', 'shop,interior,products', 'store,display,merchandise', 'shopping,boutique,fashion', 'retail,storefront,business'];
        return retailTerms[photoIndex % retailTerms.length];
      } else if (lowerType.includes('health') || lowerType.includes('medical') || lowerType.includes('doctor')) {
        const medicalTerms = ['medical,healthcare,clinic', 'doctor,healthcare,professional', 'clinic,medical,clean', 'healthcare,technology,modern', 'medical,office,professional'];
        return medicalTerms[photoIndex % medicalTerms.length];
      } else if (lowerType.includes('beauty') || lowerType.includes('salon') || lowerType.includes('spa')) {
        const beautyTerms = ['beauty,salon,spa', 'spa,relaxation,wellness', 'salon,beauty,styling', 'spa,treatment,peaceful', 'beauty,care,luxury'];
        return beautyTerms[photoIndex % beautyTerms.length];
      } else if (lowerType.includes('fitness') || lowerType.includes('gym')) {
        const fitnessTerms = ['fitness,gym,exercise', 'gym,equipment,workout', 'fitness,training,health', 'gym,sport,active', 'exercise,fitness,strength'];
        return fitnessTerms[photoIndex % fitnessTerms.length];
      } else if (lowerType.includes('auto') || lowerType.includes('car')) {
        const autoTerms = ['automotive,car,garage', 'car,repair,mechanic', 'automotive,service,professional', 'car,maintenance,garage', 'automotive,tools,workshop'];
        return autoTerms[photoIndex % autoTerms.length];
      } else if (lowerType.includes('bank') || lowerType.includes('finance')) {
        const financeTerms = ['business,finance,professional', 'office,business,modern', 'finance,banking,professional', 'business,meeting,corporate', 'office,finance,technology'];
        return financeTerms[photoIndex % financeTerms.length];
      } else if (lowerType.includes('real estate')) {
        const realEstateTerms = ['realestate,property,house', 'house,home,property', 'real,estate,architecture', 'property,luxury,home', 'house,modern,architecture'];
        return realEstateTerms[photoIndex % realEstateTerms.length];
      } else if (lowerType.includes('law') || lowerType.includes('legal')) {
        const legalTerms = ['business,professional,office', 'law,legal,professional', 'office,business,corporate', 'legal,books,law', 'business,meeting,professional'];
        return legalTerms[photoIndex % legalTerms.length];
      } else if (lowerType.includes('education') || lowerType.includes('school')) {
        const educationTerms = ['education,learning,school', 'classroom,education,learning', 'school,students,education', 'learning,books,education', 'education,technology,modern'];
        return educationTerms[photoIndex % educationTerms.length];
      } else {
        const businessTerms = ['business,professional,commercial', 'office,business,modern', 'professional,work,business', 'commercial,business,corporate', 'business,team,professional'];
        return businessTerms[photoIndex % businessTerms.length];
      }
    };

    const searchTerms = getSearchTerms(businessType, index);
    return `https://source.unsplash.com/${width}x${height}/?${searchTerms}`;
  };

  // Generate business-type-specific Unsplash URL
  const getPhotoUrl = (photo: PlacePhoto, options?: { maxHeight?: number; maxWidth?: number }, index: number = 0) => {
    // Always use business-type-specific Unsplash images for consistency
    return getPlaceholderImageUrl(options, index);
  };

  return (
    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white flex items-center">
          📸 Photos
          <span className="ml-2 text-sm text-gray-400">({photos.length})</span>
        </h3>
      </div>

      <div className="p-0">
        {/* Main Photo Display */}
        <div className="relative aspect-video bg-gray-900">
                     <img
             src={getPhotoUrl(currentPhoto, { maxHeight: 600, maxWidth: 800 }, currentPhotoIndex)}
             alt={`${businessName} photo ${currentPhotoIndex + 1}`}
             className="w-full h-full object-cover"
             loading="lazy"
           />
          
          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Photo Counter */}
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentPhotoIndex + 1} / {photos.length}
          </div>

          {/* Photo Attribution */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            <div className="flex items-center space-x-1">
              <ExternalLink className="w-3 h-3" />
              <span>Photo by Unsplash</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {photos.length > 1 && (
          <div className="p-4 bg-card">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {photos.map((photo, index) => (
                <button
                  key={photo.name}
                  onClick={() => goToPhoto(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentPhotoIndex
                      ? 'border-blue-400 ring-2 ring-blue-400/30'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                                     <img
                     src={getPhotoUrl(photo, { maxHeight: 80, maxWidth: 80 }, index)}
                     alt={`${businessName} thumbnail ${index + 1}`}
                     className="w-full h-full object-cover"
                     loading="lazy"
                   />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotoCarousel; 