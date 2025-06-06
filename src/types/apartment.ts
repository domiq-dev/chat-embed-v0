export interface ApartmentReviews {
  googleRating: number;
  googleReviewCount: number;
  googlePlaceId: string;
  lastUpdated: string;
}

export interface ApartmentConfig {
  name: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    google?: string;
  };
  reviews: ApartmentReviews;
  agent: {
    name: string;
    title: string;
    avatar: string;
  };
}

// Default configuration
export const DEFAULT_APARTMENT_CONFIG: ApartmentConfig = {
  name: 'Grand Oaks',
  socialLinks: {
    facebook: 'https://www.facebook.com/grandoaksburlington',
    google: 'https://g.page/grandoaksburlington',
  },
  reviews: {
    googleRating: 4.4,
    googleReviewCount: 128,
    googlePlaceId: '', // To be filled when implementing Google Places API
    lastUpdated: new Date().toISOString(),
  },
  agent: {
    name: 'Ava',
    title: 'Your leasing specialist',
    avatar: '/realtor.png',
  },
};
