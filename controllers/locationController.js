const Warehouse = require('../models/Warehouse');
const Location = require('../models/Location');

module.exports = {
  index: async (req, res) => {
    try {
      const warehouses = await Warehouse.find().sort({ name: 1 }).lean();
      res.render('location/index', {
        path: req.path,
        user: req.session && req.session.user ? req.session.user : null,
        warehouses
      });
    } catch (err) {
      console.error('location#index', err);
      req.flash('error', 'Unable to load warehouses');
      res.render('location/index', { path: req.path, warehouses: [] });
    }
  },

  create: async (req, res) => {
    const { name, code, warehouse } = req.body;
    try {
      //warehouse id provided
      if (!warehouse) {
        req.flash('error', 'Please select a warehouse');
        return res.redirect('/locations');
      }
      const doc = new Location({
        name: (name || '').trim(),
        code: (code || '').trim(),
        warehouse,
        createdBy: req.session && req.session.user ? req.session.user._id : null
      });
      await doc.save();
      req.flash('success', 'Location saved');
      return res.redirect('/locations');
    } catch (err) {
      console.error('location#create', err);
      req.flash('error', 'Unable to save location');
      return res.redirect('/locations');
    }
  }
};
