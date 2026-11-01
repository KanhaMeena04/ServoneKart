import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const INDORE_HUBS = [
  { id: 'ind-vn', name: 'Vijay Nagar', locality: 'Scheme 54 & 78, Indore', eta: '10-12 mins', serviceable: true, lat: 22.7533, lng: 75.8937 },
  { id: 'ind-pal', name: 'New Palasia', locality: 'Near 56 Dukan, Indore', eta: '12-15 mins', serviceable: true, lat: 22.7244, lng: 75.8839 },
  { id: 'ind-raj', name: 'Rajwada / Old City', locality: 'Sarafa & Rajwada, Indore', eta: '15-18 mins', serviceable: true, lat: 22.7196, lng: 75.8577 },
  { id: 'ind-bhw', name: 'Bhanwarkuan', locality: 'Near Holkar College / IT Park, Indore', eta: '12-15 mins', serviceable: true, lat: 22.6926, lng: 75.8676 },
  { id: 'ind-sc', name: 'Super Corridor', locality: 'TCS / Infosys Square, Indore', eta: '18-20 mins', serviceable: true, lat: 22.7842, lng: 75.8239 },
  { id: 'ind-ann', name: 'Annapurna', locality: 'Usha Nagar & Annapurna Road, Indore', eta: '15 mins', serviceable: true, lat: 22.6998, lng: 75.8398 },
];

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('tricelyn_delivery_location');
      return saved ? JSON.parse(saved) : INDORE_HUBS[0];
    } catch (e) {
      return INDORE_HUBS[0];
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);

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
        hubs: INDORE_HUBS,
        userAddresses,
        setUserAddresses,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

