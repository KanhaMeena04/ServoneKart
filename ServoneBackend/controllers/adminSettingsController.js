const AdminSetting = require('../models/AdminSetting');

const VALID_PLATFORM_MODES = ['grocery', 'food', 'both'];

const normalizePlatformMode = (mode) => {
  const m = String(mode || 'grocery').trim().toLowerCase();
  return VALID_PLATFORM_MODES.includes(m) ? m : 'grocery';
};

const computeVerticalFlags = (mode) => {
  const normalized = normalizePlatformMode(mode);
  const enableFoodDelivery = normalized === 'food' || normalized === 'both';
  const enableGroceryDelivery = normalized === 'grocery' || normalized === 'both';
  const primaryVertical = normalized === 'food' ? 'food' : 'grocery';
  const verticalPriority =
    normalized === 'food'
      ? ['food']
      : normalized === 'both'
        ? ['grocery', 'food']
        : ['grocery'];
  return {
    platformMode: normalized,
    primaryVertical,
    enableFoodDelivery,
    enableGroceryDelivery,
    verticalPriority,
  };
};

const ensureSettings = async () => {
  const existing = await AdminSetting.findOne();
  if (existing) {
    let changed = false;
    if (!existing.platformMode || !VALID_PLATFORM_MODES.includes(existing.platformMode)) {
      existing.platformMode = 'grocery';
      existing.primaryVertical = 'grocery';
      existing.enableFoodDelivery = false;
      existing.enableGroceryDelivery = true;
      changed = true;
    }
    if (changed) {
      await existing.save().catch(() => {});
    }
    return existing;
  }
  return AdminSetting.create({
    appName: 'Tricelyn',
    platformMode: 'grocery',
    primaryVertical: 'grocery',
    enableFoodDelivery: false,
    enableGroceryDelivery: true,
  });
};

const toPublicPayload = (settings) => {
  const modeFlags = computeVerticalFlags(settings?.platformMode);
  return {
    appName: settings?.appName || 'Tricelyn',
    platformMode: modeFlags.platformMode,
    primaryVertical: modeFlags.primaryVertical,
    enableFoodDelivery: modeFlags.enableFoodDelivery,
    enableGroceryDelivery: modeFlags.enableGroceryDelivery,
    verticalPriority: modeFlags.verticalPriority,
    metaTitle: settings?.metaTitle || 'Tricelyn - Instant Grocery & Hyperlocal Delivery',
    metaDescription: settings?.metaDescription || '',
    logoUrl: settings?.logoUrl || '',
    contactEmail: settings?.contactEmail || settings?.siteEmail || '',
    contactPhone: settings?.contactPhone || settings?.siteContact || '',
    siteEmail: settings?.siteEmail || settings?.contactEmail || '',
    siteContact: settings?.siteContact || settings?.contactPhone || '',
    termsUrl: settings?.termsUrl || '',
    privacyUrl: settings?.privacyUrl || '',
    menuColors: settings?.menuColors || '#0F62FE',
    highlightColors: settings?.highlightColors || '#248C70',
    orderPrefix: settings?.orderPrefix || 'TRC',
    deliveryFeeConfig: settings?.deliveryFeeConfig,
    platformFeeConfig: settings?.platformFeeConfig,
    packagingFeeConfig: settings?.packagingFeeConfig,
    surgeConfig: settings?.surgeConfig,
    tipConfig: settings?.tipConfig || { enabled: true, options: [5, 10, 20] },
    taxConfig: settings?.taxConfig || { enabled: true, gstPercent: 5 },
    selfPickupConfig: settings?.selfPickupConfig || {
      enabled: true,
      pickupCapacityPerHour: 20,
      preparationBufferMins: 10,
      gracePeriodMins: 15,
    },
    riderEarningConfig: settings?.riderEarningConfig || {
      baseEarning: 20,
      baseDistanceKm: 2,
      perKmEarning: 8,
    },
    orderTimingConfig: settings?.orderTimingConfig || {
      cancellationWindowMins: settings?.selfPickupConfig?.cancellationWindowMins || 5,
      riderPickupGracePeriodMins: settings?.selfPickupConfig?.gracePeriodMins || 15,
      selfPickupGracePeriodMins: settings?.selfPickupConfig?.gracePeriodMins || 15,
      preparationBufferMins: 10,
    },
  };
};

const broadcastSettingsChange = (settings) => {
  try {
    const socketService = require('../services/socketService');
    const modeFlags = computeVerticalFlags(settings.platformMode);
    const payload = {
      ...modeFlags,
      appName: settings.appName || 'Tricelyn',
      timestamp: new Date().toISOString(),
    };
    socketService.emitToAll('platformModeUpdated', payload);
    socketService.emitToAll('settingsUpdated', toPublicPayload(settings));
    socketService.emitToAdmin('platformModeUpdated', payload);
  } catch (e) {
    console.warn('Socket broadcast in adminSettingsController skipped:', e.message);
  }
};

exports.ensureSettings = ensureSettings;
exports.computeVerticalFlags = computeVerticalFlags;

exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await ensureSettings();
    const publicData = toPublicPayload(settings);
    const isCodEnabled = settings.isCodEnabled !== false && settings.codEnable !== 'No';
    const rawDoc = settings.toObject ? settings.toObject() : settings;
    res.status(200).json({
      success: true,
      isCodEnabled,
      ...rawDoc,
      ...publicData,
      settings: {
        isCodEnabled,
        ...publicData,
      },
      data: {
        isCodEnabled,
        ...publicData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await ensureSettings();
    const publicData = toPublicPayload(settings);
    const rawDoc = settings.toObject ? settings.toObject() : settings;
    res.status(200).json({
      ...rawDoc,
      ...publicData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAdminSettings = async (req, res) => {
  try {
    const settings = await ensureSettings();
    const body = { ...req.body };

    if (body.platformMode !== undefined) {
      const modeFlags = computeVerticalFlags(body.platformMode);
      body.platformMode = modeFlags.platformMode;
      body.primaryVertical = modeFlags.primaryVertical;
      body.enableFoodDelivery = modeFlags.enableFoodDelivery;
      body.enableGroceryDelivery = modeFlags.enableGroceryDelivery;
    }

    if (body.codEnable !== undefined && body.isCodEnabled === undefined) {
      body.isCodEnabled = String(body.codEnable).toLowerCase() !== 'no' && body.codEnable !== false;
    }

    if (body.adminCommission !== undefined) {
      const pct = Number(body.adminCommission);
      if (!Number.isNaN(pct)) {
        settings.commissionConfig = settings.commissionConfig || {};
        settings.commissionConfig.globalCommissionPercent = pct;
      }
    }

    settings.set(body);
    await settings.save();
    broadcastSettingsChange(settings);

    const publicData = toPublicPayload(settings);
    const rawDoc = settings.toObject ? settings.toObject() : settings;
    res.status(200).json({
      success: true,
      ...rawDoc,
      ...publicData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlatformMode = async (req, res) => {
  try {
    const settings = await ensureSettings();
    const requestedMode = req.body.platformMode || req.body.mode;
    if (!requestedMode || !VALID_PLATFORM_MODES.includes(String(requestedMode).trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "platformMode must be one of 'grocery', 'food', or 'both'",
      });
    }

    const modeFlags = computeVerticalFlags(requestedMode);
    settings.platformMode = modeFlags.platformMode;
    settings.primaryVertical = modeFlags.primaryVertical;
    settings.enableFoodDelivery = modeFlags.enableFoodDelivery;
    settings.enableGroceryDelivery = modeFlags.enableGroceryDelivery;
    await settings.save();

    broadcastSettingsChange(settings);

    return res.status(200).json({
      success: true,
      message: `Platform mode switched to '${modeFlags.platformMode}'`,
      ...modeFlags,
      settings: toPublicPayload(settings),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRiderEarningConfig = async (req, res) => {
  try {
    const settings = await ensureSettings();
    return res.status(200).json({
      success: true,
      config: settings.riderEarningConfig || {
        baseEarning: 20,
        baseDistanceKm: 2,
        perKmEarning: 8,
        peakBonus: 10,
        isPeakBonusActive: false,
        rainBonus: 15,
        isRainBonusActive: false,
        nightBonus: 15,
        isNightBonusActive: false
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRiderEarningConfig = async (req, res) => {
  try {
    const settings = await ensureSettings();
    settings.riderEarningConfig = { ...settings.riderEarningConfig, ...req.body };
    await settings.save();
    return res.status(200).json({
      success: true,
      message: 'Rider earning config updated successfully',
      config: settings.riderEarningConfig
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSelfPickupConfig = async (req, res) => {
  try {
    const settings = await ensureSettings();
    return res.status(200).json({
      success: true,
      config: settings.selfPickupConfig || {
        enabled: true,
        pickupCapacityPerHour: 20,
        preparationBufferMins: 10,
        gracePeriodMins: 15,
        cancellationWindowMins: 5,
        customerArrivalTimeoutMins: 30
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSelfPickupConfig = async (req, res) => {
  try {
    const settings = await ensureSettings();
    settings.selfPickupConfig = { ...settings.selfPickupConfig, ...req.body };
    await settings.save();
    return res.status(200).json({
      success: true,
      message: 'Self pickup config updated successfully',
      config: settings.selfPickupConfig
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderTimingConfig = async (req, res) => {
  try {
    const settings = await ensureSettings();
    return res.status(200).json({
      success: true,
      config: settings.orderTimingConfig || {
        cancellationWindowMins: settings.selfPickupConfig?.cancellationWindowMins || 5,
        riderPickupGracePeriodMins: settings.selfPickupConfig?.gracePeriodMins || 15,
        selfPickupGracePeriodMins: settings.selfPickupConfig?.gracePeriodMins || 15,
        preparationBufferMins: 10
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderTimingConfig = async (req, res) => {
  try {
    const settings = await ensureSettings();
    const cancellationWindowMins = Number(req.body.cancellationWindowMins) || 5;
    const riderPickupGracePeriodMins = Number(req.body.riderPickupGracePeriodMins) || 15;
    const selfPickupGracePeriodMins = Number(req.body.selfPickupGracePeriodMins) || riderPickupGracePeriodMins;
    const preparationBufferMins = Number(req.body.preparationBufferMins) || 10;

    settings.orderTimingConfig = {
      cancellationWindowMins,
      riderPickupGracePeriodMins,
      selfPickupGracePeriodMins,
      preparationBufferMins
    };

    if (settings.selfPickupConfig) {
      settings.selfPickupConfig.cancellationWindowMins = cancellationWindowMins;
      settings.selfPickupConfig.gracePeriodMins = selfPickupGracePeriodMins;
      settings.selfPickupConfig.preparationBufferMins = preparationBufferMins;
    }

    await settings.save();
    return res.status(200).json({
      success: true,
      message: 'Order timing and cancellation parameters saved successfully',
      config: settings.orderTimingConfig
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
