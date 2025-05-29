'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const floorPlans = [
  { name: '1 Bedroom / 1 Bath', size: '750 sq ft', description: 'Spacious one-bedroom with open living area and private balcony.' },
  { name: '2 Bedroom / 2 Bath', size: '1050 sq ft', description: 'Ideal for roommates or families, includes walk-in closets.' },
  { name: '3 Bedroom / 2 Bath', size: '1300 sq ft', description: 'Large layout with extra storage and two full bathrooms.' },
];

const petPolicy = {
  allowed: true,
  details: 'Cats and dogs allowed. Max 2 pets per apartment. Breed restrictions apply. $300 non-refundable pet fee per pet. $25/month pet rent per pet.'
};

const qualifications = [
  'Minimum income: 3x monthly rent',
  'No recent evictions or bankruptcies',
  'Background and credit check required',
  'Valid government-issued ID',
];

const nearby = [
  { type: 'Hospital', name: 'St. Mary Medical Center', distance: '1.2 miles' },
  { type: 'Shopping', name: 'Oakwood Mall', distance: '0.8 miles' },
  { type: 'Grocery', name: 'Fresh Market', distance: '0.5 miles' },
  { type: 'Food', name: 'Bella Italia (Italian)', distance: '0.6 miles' },
  { type: 'Food', name: 'Sushi House', distance: '0.7 miles' },
  { type: 'Food', name: 'Taco Fiesta', distance: '0.9 miles' },
];

export default function CommunityInfoPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Grand Oaks Community Info</h1>

      {/* Floor Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Floor Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {floorPlans.map(plan => (
              <div key={plan.name} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{plan.size}</p>
                <p className="text-gray-700 text-sm">{plan.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pet Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Pet Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-base mb-2">
            {petPolicy.allowed ? 'Pets are welcome at Grand Oaks.' : 'No pets allowed.'}
          </p>
          <p className="text-gray-600 text-sm">{petPolicy.details}</p>
        </CardContent>
      </Card>

      {/* Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle>Qualifications for Residency</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            {qualifications.map(q => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Nearby Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Nearby Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearby.map(place => (
              <div key={place.name} className="border rounded-lg p-3 bg-white flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{place.type}</span>
                <span className="font-medium text-gray-800">{place.name}</span>
                <span className="text-xs text-gray-500">{place.distance} away</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 