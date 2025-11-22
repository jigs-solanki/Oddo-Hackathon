const Receipt = require('../models/Receipt');
const Product = require('../models/Product');

exports.list = async (req, res) => {
  const q = {};
  const isMine = !!(req.query.mine && req.session && req.session.user);
  if (isMine) q.createdBy = req.session.user.id;
  const receipts = await Receipt.find(q).populate('items.product').populate('createdBy', 'name');
  res.render('receipt/list', { receipts, mine: isMine });
};

exports.showCreate = async (req, res) => {
  const products = await Product.find();
  res.render('receipt/create', { products });
};

exports.show = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      req.flash('error', 'Receipt not found');
      return res.redirect('/receipts');
    }
    const receipt = await Receipt.findById(id).populate('items.product').populate('createdBy', 'name');
    if (!receipt) {
      req.flash('error', 'Receipt not found');
      return res.redirect('/receipts');
    }
    return res.render('receipt/show', { receipt });
  } catch (err) {
    console.error('Error loading receipt detail:', err);
    req.flash('error', 'Failed to load receipt');
    return res.redirect('/receipts');
  }
};

exports.create = async (req, res) => {
  
  try {
    const { supplier } = req.body;
    let { productIds = [], qtys = [] } = req.body;

    // normalize to arrays
    if (!Array.isArray(productIds)) productIds = productIds ? [productIds] : [];
    if (!Array.isArray(qtys)) qtys = qtys ? [qtys] : [];

    const items = [];
    const updatePromises = [];

    for (let i = 0; i < productIds.length; i++) {
      const pid = productIds[i];
      const q = Number(qtys[i] || 0);
      if (!pid || q <= 0) continue;
      items.push({ product: pid, qty: q });
      updatePromises.push(Product.findByIdAndUpdate(pid, { $inc: { stock: q } }));
    }

    if (items.length === 0) {
      req.flash('error', 'No valid items provided');
      return res.redirect('/receipts/create');
    }

    // perform product stock updates in parallel
    await Promise.all(updatePromises);

    await Receipt.create({ supplier, items, createdBy: req.session && req.session.user ? req.session.user.id : undefined });
    req.flash('success', 'Receipt created and stock updated');
    return res.redirect('/receipts');
  } catch (err) {
    console.error('Error creating receipt:', err);
    req.flash('error', 'Failed to create receipt');
    return res.redirect('/receipts');
  }
};
