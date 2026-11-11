import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/api';
import socketService from '../services/socket';

const PlatformContext = createContext();

export const PlatformProvider = ({ children }) => {
  const [platformMode, setPlatformMode] = useState('grocery'); // 'grocery' | 'both' | 'food'
  const [enableGroceryDelivery, setEnableGroceryDelivery] = useState(true);
  const [enableFoodDelivery, setEnableFoodDelivery] = useState(false);
  const [primaryVertical, setPrimaryVertical] = useState('grocery');
  const [isCodEnabled, setIsCodEnabled] = useState(true);
  const [appSettings, setAppSettings] = useState({
    appName: 'Tricelyn',
    platformMode: 'grocery',
    freeDeliveryThreshold: 199,
    baseDeliveryFee: 25,
    handlingFee: 2,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  const applySettingsPayload = useCallback((payload) => {
    if (!payload) return;
    const raw = payload.data || payload.settings || payload;
    const mode = ['grocery', 'food', 'both'].includes(raw.platformMode)
      ? raw.platformMode
      : 'grocery';

    setPlatformMode(mode);
    setEnableGroceryDelivery(
      typeof raw.enableGroceryDelivery === 'boolean'
        ? raw.enableGroceryDelivery
        : mode === 'grocery' || mode === 'both'
    );
    setEnableFoodDelivery(
      typeof raw.enableFoodDelivery === 'boolean'
        ? raw.enableFoodDelivery
        : mode === 'food' || mode === 'both'
    );
    setPrimaryVertical(mode === 'food' ? 'food' : 'grocery');
    if (typeof raw.isCodEnabled === 'boolean') {
      setIsCodEnabled(raw.isCodEnabled);
    }
    setAppSettings((prev) => ({ ...prev, ...raw, platformMode: mode }));
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await settingsService.getPublicSettings();
      applySettingsPayload(res.data);
    } catch (err) {
      // Safe grocery-first fallback if settings endpoint unavailable during startup
    } finally {
      setLoadingSettings(false);
    }
  }, [applySettingsPayload]);

  useEffect(() => {
    refreshSettings();
    const unsub = socketService.onPlatformModeUpdate((payload) => {
      applySettingsPayload(payload);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [refreshSettings, applySettingsPayload]);

  return (
    <PlatformContext.Provider
      value={{
        platformMode,
        enableGroceryDelivery,
        enableFoodDelivery,
        primaryVertical,
        isGroceryOnly: platformMode === 'grocery',
        isCodEnabled,
        appSettings,
        loadingSettings,
        refreshSettings,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => useContext(PlatformContext);
