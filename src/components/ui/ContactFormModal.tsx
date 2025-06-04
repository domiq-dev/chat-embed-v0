import React, { useState } from 'react';
import { X, Mail, Phone } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  method: 'email' | 'phone';
  moveInDate?: string;
};

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contactData: {
    name: string;
    email?: string;
    phone?: string;
    method: 'email' | 'phone';
  }) => void;
  analytics: {
    trackContactCapture: (method: 'email' | 'phone', isValid: boolean) => void;
  };
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  analytics,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    method: 'email',
    moveInDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.method === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (formData.method === 'phone') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[\d\s\-\(\)\+]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Track contact capture with analytics (with error handling)
    try {
      analytics.trackContactCapture(formData.method, true);
    } catch (error) {
      console.warn('Contact capture analytics error:', error);
    }

    // Submit form data
    onSubmit({
      name: formData.name,
      email: formData.method === 'email' ? formData.email : undefined,
      phone: formData.method === 'phone' ? formData.phone : undefined,
      method: formData.method,
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      method: 'email',
      moveInDate: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Get In Touch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Let's stay connected! How would you like us to reach out?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={formData.method === 'email'}
                  onChange={(e) => setFormData({ ...formData, method: 'email' })}
                  className="text-blue-600"
                />
                <Mail className="w-4 h-4 mx-2 text-blue-600" />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="phone"
                  checked={formData.method === 'phone'}
                  onChange={(e) => setFormData({ ...formData, method: 'phone' })}
                  className="text-blue-600"
                />
                <Phone className="w-4 h-4 mx-2 text-blue-600" />
                <span className="text-sm">Phone</span>
              </label>
            </div>
          </div>

          {formData.method === 'email' && (
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
          )}

          {formData.method === 'phone' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desired Move-In Date
            </label>
            <input
              type="date"
              name="moveInDate"
              placeholder="Desired move-in date"
              onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
            />
          </div>

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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
