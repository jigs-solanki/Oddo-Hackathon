const Delivery = require('../models/Delivery');
const Product = require('../models/Product');

exports.list = async (req, res) => {
  const q = {};
  const isMine = !!(req.query.mine && req.session && req.session.user);
  if (isMine) q.createdBy = req.session.user.id;
  const deliveries = await Delivery.find(q).populate('items.product').populate('createdBy', 'name');
  res.render('delivery/list', { deliveries, mine: isMine });
};

exports.show = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      req.flash('error', 'Delivery not found');
      return res.redirect('/delivery');
    }
    const delivery = await Delivery.findById(id).populate('items.product').populate('createdBy', 'name');
    if (!delivery) {
      req.flash('error', 'Delivery not found');
      return res.redirect('/delivery');
    }
    return res.render('delivery/show', { delivery });
  } catch (err) {
    console.error('Error loading delivery detail:', err);
    req.flash('error', 'Failed to load delivery');
    return res.redirect('/delivery');
  }
};

exports.showCreate = async (req, res) => {
  const products = await Product.find();
  res.render('delivery/create', { products });
};

exports.create = async (req, res) => {
  try {
    let { customer, productIds = [], qtys = [] } = req.body;

    // normalize single inputs to arrays
    if (!Array.isArray(productIds)) productIds = productIds ? [productIds] : [];
    if (!Array.isArray(qtys)) qtys = qtys ? [qtys] : [];

    const items = [];
    const updates = [];

    for (let i = 0; i < productIds.length; i++) {
      const pid = productIds[i];
      const q = Number(qtys[i] || 0);
      if (!pid || q <= 0) continue;
      items.push({ product: pid, qty: q });
      
      updates.push(Product.findByIdAndUpdate(pid, { $inc: { stock: -q } }).exec());
    }

    if (items.length === 0) {
      req.flash('error', 'No valid items provided');
      return res.redirect('/delivery');
    }

    // run product updates in parallel
    await Promise.all(updates);

    await Delivery.create({ customer, items, createdBy: req.session && req.session.user ? req.session.user.id : undefined });
    req.flash('success', 'Delivery created and stock decreased');
    return res.redirect('/delivery');
  } catch (err) {
    console.error('Error creating delivery:', err);
    req.flash('error', 'Failed to create delivery');
    return res.redirect('/delivery');
  }
};
