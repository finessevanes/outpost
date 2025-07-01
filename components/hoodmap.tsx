import { useState } from 'react';
import { ReviewModal } from './review-modal';

interface MapPin {
  id: number;
  lat: number;
  lng: number;
  title: string;
  category: 'safe' | 'caution' | 'avoid' | 'recommend';
  rating: number;
  description: string;
  reports: number;
  price: string;
  type: 'hotel' | 'hostel' | 'guesthouse';
}

const mockMapData: MapPin[] = [
  {
    id: 1,
    lat: -8.6544,
    lng: 115.1311,
    title: "FRii Bali Echo Beach Hotel",
    category: 'recommend',
    rating: 4.7,
    description: "Beachfront hotel with stunning sunset views, perfect for solo travelers",
    reports: 34,
    price: "$85/night",
    type: 'hotel'
  },
  {
    id: 2,
    lat: -8.6580,
    lng: 115.1250,
    title: "The Lawn Canggu",
    category: 'safe',
    rating: 4.5,
    description: "Trendy beachside hotel with pool, great for digital nomads",
    reports: 28,
    price: "$120/night",
    type: 'hotel'
  },
  {
    id: 3,
    lat: -8.6501,
    lng: 115.1365,
    title: "Mad Monkey Hostel Canggu",
    category: 'recommend',
    rating: 4.3,
    description: "Social hostel with rooftop bar, perfect for meeting other travelers",
    reports: 52,
    price: "$25/night",
    type: 'hostel'
  },
  {
    id: 4,
    lat: -8.6495,
    lng: 115.1358,
    title: "Koa D'Surfer Hotel",
    category: 'safe',
    rating: 4.4,
    description: "Surf-themed hotel near beach, great vibes and friendly staff",
    reports: 19,
    price: "$75/night",
    type: 'hotel'
  },
  {
    id: 5,
    lat: -8.6507,
    lng: 115.1371,
    title: "Puri Garden Hotel & Hostel",
    category: 'caution',
    rating: 4.1,
    description: "Budget-friendly with garden setting, can get noisy at night",
    reports: 15,
    price: "$35/night",
    type: 'guesthouse'
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'safe': return '#10B981'; // green
    case 'recommend': return '#3B82F6'; // blue
    case 'caution': return '#F59E0B'; // yellow
    case 'avoid': return '#EF4444'; // red
    default: return '#6B7280'; // gray
  }
};

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'safe': return '🛡️';
    case 'recommend': return '⭐';
    case 'caution': return '⚠️';
    case 'avoid': return '🚫';
    default: return '📍';
  }
};

export function HoodMap() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingPin, setReviewingPin] = useState<MapPin | null>(null);
  const [verifiedHotels, setVerifiedHotels] = useState<Set<number>>(new Set());

  const filteredPins = activeCategory === 'all' 
    ? mockMapData 
    : mockMapData.filter(pin => pin.category === activeCategory);

  const handleReviewClick = (pin: MapPin) => {
    setReviewingPin(pin);
    setReviewModalOpen(true);
    console.log(`📱 Opening review modal for ${pin.title}`);
  };

  const handleReviewSubmit = (reviewData: { image: File; travelType: string; location?: any }) => {
    console.log('📸 Review submitted:', {
      hotel: reviewingPin?.title,
      travelType: reviewData.travelType,
      hasImage: !!reviewData.image,
      locationVerified: !!reviewData.location
    });
    
    // TODO: Phase 3 - Trigger credential issuance here
    
    // Mark this hotel as verified
    if (reviewingPin) {
      setVerifiedHotels(prev => new Set(Array.from(prev).concat(reviewingPin.id)));
    }
    
    setReviewModalOpen(false);
    setReviewingPin(null);
    
    // Show success message (temporary)
    alert(`✅ Review submitted for ${reviewingPin?.title}! You'll now see "You stayed here!" badge. Credential issuance coming in Phase 3.`);
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-xl font-bold mb-2">🏝️ Canggu Hostels</h2>
        <p className="text-gray-300 text-sm">Verified stays by the community</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {['all', 'safe', 'recommend', 'caution', 'avoid'].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeCategory === category
                ? 'bg-gray-700 text-white border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Hotel List */}
      <div className="space-y-3">
        {filteredPins.map((pin) => (
          <div
            key={pin.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryEmoji(pin.category)}</span>
                  <h3 className="font-semibold text-lg text-white">{pin.title}</h3>
                  {verifiedHotels.has(pin.id) && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      You stayed here!
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-green-400 font-semibold">{pin.price}</span>
                  <span className="capitalize text-sm font-medium" style={{ color: getCategoryColor(pin.category) }}>
                    {pin.category}
                  </span>
                  <span className="text-yellow-400">★ {pin.rating}</span>
                  <span className="text-gray-400 text-sm">({pin.reports} reviews)</span>
                  <span className="text-gray-400 text-sm capitalize">• {pin.type}</span>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{pin.description}</p>
              </div>
            </div>
            
            <button 
              className={`w-full py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                verifiedHotels.has(pin.id) 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={() => handleReviewClick(pin)}
            >
              {verifiedHotels.has(pin.id) ? '✅ Add Another Review' : '📸 Leave a Review'}
            </button>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-green-400 font-bold text-lg">{mockMapData.filter(p => p.type === 'hotel').length}</div>
            <div className="text-gray-400 text-xs">Hotels</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-lg">{mockMapData.filter(p => p.type === 'hostel').length}</div>
            <div className="text-gray-400 text-xs">Hostels</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">{mockMapData.filter(p => p.category === 'recommend').length}</div>
            <div className="text-gray-400 text-xs">Top Rated</div>
          </div>
          <div>
            <div className="text-indigo-400 font-bold text-lg">{mockMapData.reduce((sum, p) => sum + p.reports, 0)}</div>
            <div className="text-gray-400 text-xs">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingPin && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setReviewingPin(null);
          }}
          hotelName={reviewingPin.title}
          hotelId={reviewingPin.id}
          hotelCoordinates={{ lat: reviewingPin.lat, lng: reviewingPin.lng }}
          onSubmitReview={handleReviewSubmit}
        />
      )}
    </div>
  );
} 