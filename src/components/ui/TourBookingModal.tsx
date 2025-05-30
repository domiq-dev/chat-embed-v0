import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User } from 'lucide-react';

interface TourBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tourData: { 
    name: string; 
    email: string; 
    tourType: 'in_person' | 'self_guided' | 'video';
    preferredDate?: string;
    preferredTime?: string;
  }) => void;
  analytics: {
    trackTourBooked: (tourType: 'in_person' | 'self_guided' | 'video') => void;
  };
}

const TourBookingModal: React.FC<TourBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  analytics 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tourType: 'in_person' as 'in_person' | 'self_guided' | 'video',
    preferredDate: '',
    preferredTime: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tourOptions = [
    {
      type: 'in_person' as const,
      title: 'In-Person Tour',
      description: 'Meet with our leasing team for a guided tour',
      icon: User,
      duration: '30-45 minutes'
    },
    {
      type: 'self_guided' as const,
      title: 'Self-Guided Tour',
      description: 'Explore at your own pace with digital access',
      icon: MapPin,
      duration: '15-30 minutes'
    },
    {
      type: 'video' as const,
      title: 'Virtual Tour',
      description: 'Live video tour with our leasing specialist',
      icon: Calendar,
      duration: '20-30 minutes'
    }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (formData.tourType !== 'video' && !formData.preferredDate) {
      newErrors.preferredDate = 'Please select a preferred date';
    }
    
    if (formData.tourType !== 'video' && !formData.preferredTime) {
      newErrors.preferredTime = 'Please select a preferred time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Track tour booking with analytics (with error handling)
    try {
      analytics.trackTourBooked(formData.tourType);
    } catch (error) {
      console.warn('Tour booking analytics error:', error);
    }
    
    // Submit form data
    onSubmit({
      name: formData.name,
      email: formData.email,
      tourType: formData.tourType,
      preferredDate: formData.preferredDate || undefined,
      preferredTime: formData.preferredTime || undefined
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      tourType: 'in_person',
      preferredDate: '',
      preferredTime: ''
    });
    setErrors({});
    onClose();
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Your Tour</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Choose the type of tour that works best for you!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tour Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Tour Type
            </label>
            <div className="space-y-3">
              {tourOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <label
                    key={option.type}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.tourType === option.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.type}
                      checked={formData.tourType === option.type}
                      onChange={(e) => setFormData({ ...formData, tourType: e.target.value as typeof formData.tourType })}
                      className="sr-only"
                    />
                    <IconComponent className="w-5 h-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.title}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {option.duration}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Scheduling (for in-person and self-guided only) */}
          {formData.tourType !== 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  min={minDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.preferredDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.preferredTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>}
              </div>
            </div>
          )}

          {/* Video Tour Note */}
          {formData.tourType === 'video' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Virtual Tour</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We'll contact you within 24 hours to schedule your live virtual tour at a time that works for you.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Tour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourBookingModal; 