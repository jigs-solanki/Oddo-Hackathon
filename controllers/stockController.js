const Product = require('../models/Product');

exports.list = async (req, res) => {
  try {
    const products = await Product.find().lean();
    return res.render('stock/index', { products });
  } catch (err) {
    console.error('Error loading stock:', err);
    req.flash('error', 'Failed to load stock');
    return res.redirect('/');
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    let { stock, reserved } = req.body;
    stock = Number(stock);
    reserved = Number(reserved || 0);
    if (Number.isNaN(stock) || Number.isNaN(reserved)) {
      req.flash('error', 'Invalid stock or reserved value');
      return res.redirect('/stock');
    }
    if (reserved < 0) reserved = 0;
    if (reserved > stock) {
      req.flash('error', 'Reserved cannot exceed On Hand stock');
      return res.redirect('/stock');
    }
    await Product.findByIdAndUpdate(id, { $set: { stock, reserved } });
    req.flash('success', 'Stock updated');
    return res.redirect('/stock');
  } catch (err) {
    console.error('Error updating stock:', err);
    req.flash('error', 'Failed to update stock');
    return res.redirect('/stock');
  }
};
