const Warehouse = require('../models/Warehouse');

module.exports = {
  index: async (req, res) => {
    try {
      const warehouses = await Warehouse.find().sort({ createdAt: -1 }).lean();
      res.render('warehouse/index', {
        path: req.path,
        user: req.session && req.session.user ? req.session.user : null,
        warehouses
      });
    } catch (err) {
      console.error('warehouse#index', err);
      req.flash('error', 'Unable to load warehouses');
      res.render('warehouse/index', { path: req.path, warehouses: [] });
    }
  },

  create: async (req, res) => {
    const { name, code, address } = req.body;
    try {
      const doc = new Warehouse({
        name: (name || '').trim(),
        code: (code || '').trim(),
        address: (address || '').trim(),
        createdBy: req.session && req.session.user ? req.session.user._id : null
      });
      await doc.save();
      req.flash('success', 'Warehouse saved');
      return res.redirect('/warehouse');
    } catch (err) {
      console.error('warehouse#create', err);
      req.flash('error', 'Unable to save warehouse');
      return res.redirect('/warehouse');
    }
  }
};
