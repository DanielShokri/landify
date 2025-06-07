import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  ExternalLink,
  Star
} from 'lucide-react';
import { SocialMediaLinks as SocialMediaLinksType } from '@/types/business';

interface SocialMediaLinksProps {
  socialMedia: SocialMediaLinksType;
  businessName: string;
}

export function SocialMediaLinks({ socialMedia, businessName }: SocialMediaLinksProps) {
  const socialPlatforms = [
    {
      name: 'Website',
      url: socialMedia.website,
      icon: ExternalLink,
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      name: 'Facebook',
      url: socialMedia.facebook,
      icon: Facebook,
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      name: 'Instagram',
      url: socialMedia.instagram,
      icon: Instagram,
      color: 'text-pink-600 hover:text-pink-700',
      bgColor: 'bg-pink-50 hover:bg-pink-100'
    },
    {
      name: 'Twitter/X',
      url: socialMedia.twitter,
      icon: Twitter,
      color: 'text-gray-900 hover:text-black',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      name: 'LinkedIn',
      url: socialMedia.linkedin,
      icon: Linkedin,
      color: 'text-blue-700 hover:text-blue-800',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      name: 'YouTube',
      url: socialMedia.youtube,
      icon: Youtube,
      color: 'text-red-600 hover:text-red-700',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      name: 'Yelp',
      url: socialMedia.yelp,
      icon: Star,
      color: 'text-red-600 hover:text-red-700',
      bgColor: 'bg-red-50 hover:bg-red-100'
    }
  ];

  const availableLinks = socialPlatforms.filter(platform => platform.url);

  if (availableLinks.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Connect with {businessName}
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {availableLinks.map((platform) => {
          const IconComponent = platform.icon;
          
          return (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                transition-all duration-200 hover:shadow-md
                ${platform.color} ${platform.bgColor}
                border border-transparent hover:border-current/20
              `}
              aria-label={`Visit ${businessName} on ${platform.name}`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="font-medium">{platform.name}</span>
            </a>
          );
        })}
      </div>
      
      {/* Compact version for mobile */}
      <div className="md:hidden mt-4">
        <div className="flex flex-wrap gap-2">
          {availableLinks.map((platform) => {
            const IconComponent = platform.icon;
            
            return (
              <a
                key={`mobile-${platform.name}`}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  p-3 rounded-full transition-all duration-200 hover:shadow-md
                  ${platform.color} ${platform.bgColor}
                  border border-transparent hover:border-current/20
                `}
                aria-label={`Visit ${businessName} on ${platform.name}`}
              >
                <IconComponent className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SocialMediaLinks; 