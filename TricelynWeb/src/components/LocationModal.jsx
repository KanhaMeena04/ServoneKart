import React, { useState } from 'react';
import { MapPin, X, Check, Search, Navigation } from 'lucide-react';
import { useLocation, INDORE_HUBS } from '../context/LocationContext';

const LocationModal = () => {
  const { selectedLocation, setLocation, isLocationModalOpen, setIsLocationModalOpen } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLocationModalOpen) return null;

  const filteredHubs = INDORE_HUBS.filter(
    (hub) =>
      hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.locality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (hub) => {
    setLocation(hub);
    setIsLocationModalOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            id: 'current-gps',
            name: 'Current Location (GPS)',
            locality: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Indore)`,
            eta: '10-15 mins',
            serviceable: true,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(loc);
          setIsLocationModalOpen(false);
        },
        () => {
          // Default to Vijay Nagar if permission denied
          setLocation(INDORE_HUBS[0]);
          setIsLocationModalOpen(false);
        }
      );
    } else {
      setLocation(INDORE_HUBS[0]);
      setIsLocationModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-gray-900">Choose Delivery Location</h3>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Button */}
        <div className="p-6 space-y-4">
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center gap-3 p-3.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-xl text-brand-600 font-semibold text-xs transition"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <p className="text-xs font-bold text-brand-700">Detect My Current Location</p>
              <p className="text-[11px] text-gray-500 font-normal">Using device GPS in Indore</p>
            </div>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indore locality or area (e.g. Vijay Nagar, Palasia)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Indore Hubs List */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Popular Indore Hubs (10-15 Min Delivery)
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredHubs.map((hub) => {
                const isSelected = selectedLocation?.name === hub.name;
                return (
                  <button
                    key={hub.id}
                    onClick={() => handleSelect(hub)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <MapPin className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-brand-700' : 'text-gray-800'}`}>
                          {hub.name}
                        </p>
                        <p className="text-[11px] text-gray-500">{hub.locality}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">
                        ⚡ {hub.eta}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 text-center">
          Delivering fresh groceries across Indore, Madhya Pradesh.
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
