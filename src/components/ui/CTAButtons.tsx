import React from 'react';
import { MessageCircle } from 'lucide-react';

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
    showTourBooking: true
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

  return (
    <div className="flex gap-2">
      {/* Primary CTAs - Side by Side */}
      {config.showContactForm && onContactFormOpen && (
        <button
          onClick={handleContactFormClick}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Get In Touch
        </button>
      )}

      {config.showTourBooking && onTourBookingOpen && (
        <button
          onClick={handleTourBookingClick}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <span className="text-sm">📅</span>
          Schedule Tour
        </button>
      )}
    </div>
  );
};

export default CTAButtons; 