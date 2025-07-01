import { useState } from 'react';

interface MapPin {
  id: number;
  lat: number;
  lng: number;
  title: string;
  category: 'safe' | 'caution' | 'avoid' | 'recommend';
  rating: number;
  description: string;
  reports: number;
}

const mockMapData: MapPin[] = [
  {
    id: 1,
    lat: 40.7128,
    lng: -74.0060,
    title: "Washington Square Park",
    category: 'safe',
    rating: 4.5,
    description: "Well-lit area, good for evening walks",
    reports: 12
  },
  {
    id: 2,
    lat: 40.7589,
    lng: -73.9851,
    title: "Central Park East",
    category: 'recommend',
    rating: 4.8,
    description: "Great for morning runs, active community",
    reports: 28
  },
  {
    id: 3,
    lat: 40.7505,
    lng: -73.9934,
    title: "Times Square Area",
    category: 'caution',
    rating: 3.2,
    description: "Crowded, watch belongings",
    reports: 45
  },
  {
    id: 4,
    lat: 40.7282,
    lng: -73.7949,
    title: "Flushing Meadows",
    category: 'safe',
    rating: 4.3,
    description: "Family-friendly, well-maintained",
    reports: 8
  },
  {
    id: 5,
    lat: 40.6892,
    lng: -74.0445,
    title: "Brooklyn Bridge Park",
    category: 'recommend',
    rating: 4.7,
    description: "Beautiful views, safe for solo visits",
    reports: 22
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
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredPins = activeCategory === 'all' 
    ? mockMapData 
    : mockMapData.filter(pin => pin.category === activeCategory);

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-xl font-bold mb-2">HoodMap</h2>
        <p className="text-gray-300 text-sm">Community-verified safe spaces</p>
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

      {/* Map Area */}
      <div className="relative h-80 bg-gray-800 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 320">
              {/* Mock street lines */}
              <line x1="0" y1="160" x2="400" y2="160" stroke="#374151" strokeWidth="2"/>
              <line x1="200" y1="0" x2="200" y2="320" stroke="#374151" strokeWidth="2"/>
              <line x1="100" y1="0" x2="100" y2="320" stroke="#374151" strokeWidth="1"/>
              <line x1="300" y1="0" x2="300" y2="320" stroke="#374151" strokeWidth="1"/>
              <line x1="0" y1="80" x2="400" y2="80" stroke="#374151" strokeWidth="1"/>
              <line x1="0" y1="240" x2="400" y2="240" stroke="#374151" strokeWidth="1"/>
            </svg>
          </div>
        </div>

        {/* Map Pins */}
        {filteredPins.map((pin) => (
          <div
            key={pin.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            style={{
              left: `${((pin.lng + 74.1) * 200) % 100}%`,
              top: `${((pin.lat - 40.7) * 400) % 100}%`,
            }}
            onClick={() => setSelectedPin(selectedPin?.id === pin.id ? null : pin)}
          >
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs"
              style={{ backgroundColor: getCategoryColor(pin.category) }}
            >
              {getCategoryEmoji(pin.category)}
            </div>
          </div>
        ))}

        {/* Selected Pin Details */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{selectedPin.title}</h3>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryEmoji(selectedPin.category)}</span>
              <span className="capitalize text-sm font-medium" style={{ color: getCategoryColor(selectedPin.category) }}>
                {selectedPin.category}
              </span>
              <span className="text-yellow-400">★ {selectedPin.rating}</span>
              <span className="text-gray-400 text-sm">({selectedPin.reports} reports)</span>
            </div>
            <p className="text-gray-300 text-sm">{selectedPin.description}</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-green-400 font-bold text-lg">{mockMapData.filter(p => p.category === 'safe').length}</div>
            <div className="text-gray-400 text-xs">Safe Spots</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-lg">{mockMapData.filter(p => p.category === 'recommend').length}</div>
            <div className="text-gray-400 text-xs">Recommended</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">{mockMapData.filter(p => p.category === 'caution').length}</div>
            <div className="text-gray-400 text-xs">Caution</div>
          </div>
          <div>
            <div className="text-indigo-400 font-bold text-lg">{mockMapData.reduce((sum, p) => sum + p.reports, 0)}</div>
            <div className="text-gray-400 text-xs">Total Reports</div>
          </div>
        </div>
      </div>
    </div>
  );
} 