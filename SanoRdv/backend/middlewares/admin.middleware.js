const Admin = require('../models/admin.model');

exports.verifyAdminExists = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ role: 'admin' });
    if (admin) {
      return res.status(400).json({ message: 'Un admin existe déjà' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};