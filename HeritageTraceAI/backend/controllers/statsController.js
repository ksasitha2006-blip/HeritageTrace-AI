const Artefact = require('../models/Artefact');

const getDashboardStats = async (req, res) => {
  const [total, safe, missing, endangered, recovered] = await Promise.all([
    Artefact.countDocuments(),
    Artefact.countDocuments({ status: 'safe' }),
    Artefact.countDocuments({ status: 'missing' }),
    Artefact.countDocuments({ status: 'endangered' }),
    Artefact.countDocuments({ status: 'recovered' }),
  ]);

  return res.status(200).json({
    success: true,
    data: { total, safe, missing, endangered, recovered },
  });
};

module.exports = { getDashboardStats };
