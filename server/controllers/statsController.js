const mongoose = require('mongoose');
const Artefact = require('../models/Artefact');
const localArtefactStore = require('../data/localArtefactStore');

const useLocalDemoData = () => mongoose.connection.readyState !== 1;
const getLocalDashboardStats = (artefacts) => ({
  total: artefacts.length,
  safe: artefacts.filter((item) => item.status === 'safe').length,
  missing: artefacts.filter((item) => item.status === 'missing').length,
  endangered: artefacts.filter((item) => item.status === 'endangered').length,
  recovered: artefacts.filter((item) => item.status === 'recovered').length,
});

/**
 * @desc    Get dashboard statistics (counts by status)
 * @route   GET /api/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    if (useLocalDemoData()) {
      return res.status(200).json({
        success: true,
        data: getLocalDashboardStats(await localArtefactStore.list()),
      });
    }

    const total = await Artefact.countDocuments();
    const safe = await Artefact.countDocuments({ status: 'safe' });
    const missing = await Artefact.countDocuments({ status: 'missing' });
    const endangered = await Artefact.countDocuments({ status: 'endangered' });
    const recovered = await Artefact.countDocuments({ status: 'recovered' });

    res.status(200).json({
      success: true,
      data: {
        total,
        safe,
        missing,
        endangered,
        recovered,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboardStats };
