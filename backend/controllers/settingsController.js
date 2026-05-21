const Setting = require('../models/Setting');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user._id });

    if (!settings) {
      // Create defaults if not found
      settings = await Setting.create({
        userId: req.user._id,
        theme: 'dark',
        notifications: true,
        defaultSummaryType: 'medium'
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  const { theme, notifications, defaultSummaryType } = req.body;

  try {
    let settings = await Setting.findOne({ userId: req.user._id });

    if (settings) {
      if (theme !== undefined) settings.theme = theme;
      if (notifications !== undefined) settings.notifications = notifications;
      if (defaultSummaryType !== undefined) settings.defaultSummaryType = defaultSummaryType;

      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } else {
      // Create new settings if somehow missing
      const newSettings = await Setting.create({
        userId: req.user._id,
        theme: theme || 'dark',
        notifications: notifications !== undefined ? notifications : true,
        defaultSummaryType: defaultSummaryType || 'medium'
      });
      res.status(201).json(newSettings);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
