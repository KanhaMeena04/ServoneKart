import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('tricelyn_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('tricelyn_token') || null);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      // Connect to socket and join user room
      if (user && user._id) {
        socketService.connect(user._id);
      }
    }
  }, [token, user]);

  const loginWithToken = (newToken, newUser) => {
    localStorage.setItem('tricelyn_token', newToken);
    localStorage.setItem('tricelyn_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser?._id) {
      socketService.connect(newUser._id);
    }
  };

  const logout = () => {
    localStorage.removeItem('tricelyn_token');
    localStorage.removeItem('tricelyn_user');
    setToken(null);
    setUser(null);
    socketService.disconnect();
  };

  const updateUserData = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('tricelyn_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        setLoading,
        loginWithToken,
        logout,
        updateUserData,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
