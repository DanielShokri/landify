import React from 'react';
import { Clock, Calendar, Phone } from 'lucide-react';
import { BusinessHoursInfo } from '@/types/content';
import { useTheme } from '@/components/ThemeProvider';

interface BusinessHoursProps {
  businessHours: BusinessHoursInfo;
  hours?: { [key: string]: string };
}

export function BusinessHours({ businessHours, hours }: BusinessHoursProps) {
  const { theme, getCardClasses, getCardPadding } = useTheme();

  const formatHoursForDisplay = (hoursData?: { [key: string]: string }) => {
    if (!hoursData) return null;

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = {
      monday: 'Monday',
      tuesday: 'Tuesday', 
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    return dayOrder
      .filter(day => hoursData[day])
      .map(day => ({
        day: dayNames[day as keyof typeof dayNames],
        hours: hoursData[day]
      }));
  };

  const formattedHours = formatHoursForDisplay(hours);

  return (
    <div className={`${getCardClasses()} ${getCardPadding()}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
             style={{ backgroundColor: `${theme.colors.primary}20` }}>
          <Clock className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        <h3 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
          Business Hours
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Detailed Hours Schedule */}
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center" style={{ color: theme.colors.text }}>
            <Calendar className="w-5 h-5 mr-2" style={{ color: theme.colors.secondary }} />
            Weekly Schedule
          </h4>
          
          {formattedHours && formattedHours.length > 0 ? (
            <div className="space-y-2">
              {formattedHours.map(({ day, hours: dayHours }) => (
                <div key={day} className="flex justify-between items-center py-2 border-b border-opacity-20"
                     style={{ borderColor: theme.colors.cardBorder }}>
                  <span className="font-medium" style={{ color: theme.colors.text }}>
                    {day}
                  </span>
                  <span className="theme-text-secondary">
                    {dayHours}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="theme-text-secondary mb-4">
                {businessHours.schedule}
              </p>
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 mr-2" style={{ color: theme.colors.primary }} />
                <span className="text-sm theme-text-secondary">
                  Call for specific hours
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div>
          <h4 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
            Additional Information
          </h4>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
              <h5 className="font-medium mb-2" style={{ color: theme.colors.text }}>
                Special Hours
              </h5>
              <p className="text-sm theme-text-secondary">
                {businessHours.specialHours}
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
              <h5 className="font-medium mb-2" style={{ color: theme.colors.text }}>
                Availability
              </h5>
              <p className="text-sm theme-text-secondary">
                {businessHours.availability}
              </p>
            </div>

            {/* Current Status */}
            <div className="p-4 rounded-lg text-center" 
                 style={{ backgroundColor: `${theme.colors.accent}20` }}>
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 rounded-full mr-2"
                     style={{ backgroundColor: theme.colors.accent }}>
                </div>
                <span className="font-medium" style={{ color: theme.colors.text }}>
                  Contact Us Today
                </span>
              </div>
              <p className="text-sm theme-text-secondary">
                We're here to help when you need us
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessHours; 