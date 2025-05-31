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
  lastMailtoClickTime?: React.MutableRefObject<number>;
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
  lastMailtoClickTime,
  config = {
    email: 'leasing@grandoaks.com',
    phone: '+1-555-123-4567',
    showContactForm: true,
    showTourBooking: true,
  }
}) => {
  const handleEmailClick = () => {
    analytics.trackEmailOfficeClick(location);
    
    if (lastMailtoClickTime) {
      lastMailtoClickTime.current = Date.now();
    }
  };

  return (
    <div className="w-[360px] flex gap-3">
      {/* Email Contact Button */}
      <a
        href={`mailto:${config.email}?subject=Inquiry about Grand Oaks Apartments`}
        onClick={handleEmailClick}
        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <MessageCircle size={16} />
        Get In Touch
      </a>

      {/* Tour Booking Button */}
      {config.showTourBooking && onTourBookingOpen && (
        <button
          onClick={() => {
            onTourBookingOpen();
          }}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          🏠 Schedule Tour
        </button>
      )}
    </div>
  );
};

export default CTAButtons; 