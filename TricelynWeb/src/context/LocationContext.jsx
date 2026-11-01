import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LocationContext = createContext();

export const DEFAULT_INDORE_HUBS = [
  { id: 'ind-vn', name: 'Vijay Nagar', locality: 'Scheme 54 & 78, Indore', eta: '10-12 mins', serviceable: true, lat: 22.7533, lng: 75.8937 },
  { id: 'ind-pal', name: 'New Palasia', locality: 'Near 56 Dukan, Indore', eta: '12-15 mins', serviceable: true, lat: 22.7244, lng: 75.8839 },
  { id: 'ind-raj', name: 'Rajwada / Old City', locality: 'Sarafa & Rajwada, Indore', eta: '15-18 mins', serviceable: true, lat: 22.7196, lng: 75.8577 },
  { id: 'ind-bhw', name: 'Bhanwarkuan', locality: 'Near Holkar College / IT Park, Indore', eta: '12-15 mins', serviceable: true, lat: 22.6926, lng: 75.8676 },
  { id: 'ind-sc', name: 'Super Corridor', locality: 'TCS / Infosys Square, Indore', eta: '18-20 mins', serviceable: true, lat: 22.7842, lng: 75.8239 },
  { id: 'ind-ann', name: 'Annapurna', locality: 'Usha Nagar & Annapurna Road, Indore', eta: '15 mins', serviceable: true, lat: 22.6998, lng: 75.8398 },
];

export const LocationProvider = ({ children }) => {
  const [hubs, setHubs] = useState(DEFAULT_INDORE_HUBS);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('tricelyn_delivery_location');
      return saved ? JSON.parse(saved) : DEFAULT_INDORE_HUBS[0];
    } catch (e) {
      return DEFAULT_INDORE_HUBS[0];
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);

  // Fetch dynamic zones created in Master Admin Panel
  useEffect(() => {
    const fetchAdminZones = async () => {
      try {
        const res = await api.get('/zones');
        const zonesList = res.data?.zones || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (zonesList.length > 0) {
          const dynamicHubs = zonesList.map((z, idx) => ({
            id: z._id || `zone-${idx}`,
            name: z.name || z.zoneName || 'Indore Zone',
            locality: z.description || z.city?.name || 'Indore, Madhya Pradesh',
            eta: z.deliveryTime || '10-15 mins',
            serviceable: z.isActive !== false,
            lat: z.location?.coordinates ? z.location.coordinates[1] : 22.7533,
            lng: z.location?.coordinates ? z.location.coordinates[0] : 75.8937,
          }));
          setHubs(dynamicHubs);
        }
      } catch (err) {
        console.warn('Could not load dynamic admin zones, using standard hubs:', err.message);
      }
    };

    fetchAdminZones();
  }, []);

  const setLocation = (hubOrAddress) => {
    setSelectedLocation(hubOrAddress);
    localStorage.setItem('tricelyn_delivery_location', JSON.stringify(hubOrAddress));
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        hubs,
        userAddresses,
        setUserAddresses,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
