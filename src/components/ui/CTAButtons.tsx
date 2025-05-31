import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';

interface CTAButtonsProps {
  location: string; // 'header', 'footer', 'chat', etc.
  analytics: {
    trackEmailOfficeClick: (location: string) => void;
    trackPhoneCallClick: (location: string) => void;
  };
  onContactFormOpen?: () => void;
  onTourBookingOpen?: () => void;
  config?: {
    email?: string;
    phone?: string;
    showContactForm?: boolean;
    showTourBooking?: boolean;
    showPhoneButton?: boolean;
  };
}

const CTAButtons: React.FC<CTAButtonsProps> = ({ 
  location, 
  analytics, 
  onContactFormOpen,
  onTourBookingOpen,
  config = {
    email: 'leasing@grandoaks.com',
    phone: '+1-555-123-4567',
    showContactForm: true,
    showTourBooking: true,
    showPhoneButton: true
  }
}) => {
  const handleContactFormClick = () => {
    if (onContactFormOpen) {
      onContactFormOpen();
    }
  };

  const handleTourBookingClick = () => {
    if (onTourBookingOpen) {
      onTourBookingOpen();
    }
  };

  const handlePhoneClick = () => {
    // Track phone call clicked
    analytics.trackPhoneCallClick(location);
    
    // Open phone dialer
    if (config.phone) {
      window.location.href = `tel:${config.phone.replace(/[^\d]/g, '')}`;
    }
  };

  return (
    <div className="flex gap-1.5">
      {/* Primary CTAs - Side by Side */}
      {config.showContactForm && onContactFormOpen && (
        <button
          onClick={handleContactFormClick}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          <MessageCircle className="w-3 h-3" />
          Get In Touch
        </button>
      )}

      {config.showTourBooking && onTourBookingOpen && (
        <button
          onClick={handleTourBookingClick}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 transition-colors text-xs font-medium"
        >
          <span className="text-xs">📅</span>
          Schedule Tour
        </button>
      )}

      {/* Phone CTA */}
      {config.showPhoneButton && config.phone && (
        <button
          onClick={handlePhoneClick}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs font-medium"
        >
          <Phone className="w-3 h-3" />
          Call Now
        </button>
      )}
    </div>
  );
};

export default CTAButtons; 