const Adjustment = require('../models/Adjustment');
const Product = require('../models/Product');

exports.list = async (req, res) => {
  const q = {};
  const isMine = !!(req.query.mine && req.session && req.session.user);
  if (isMine) q.createdBy = req.session.user.id;
  const adjustments = await Adjustment.find(q).populate('product').populate('createdBy', 'name');
  res.render('adjustment/list', { adjustments, mine: isMine });
};

exports.showCreate = async (req, res) => {
  const products = await Product.find();
  const preselected = req.query.productId || null;
  res.render('adjustment/create', { products, preselected });
};

exports.create = async (req, res) => {
  try {
    const { productId, newQty, reservedQty, reason } = req.body;
    const p = await Product.findById(productId);
    if (!p) {
      req.flash('error','Product not found');
      return res.redirect('/adjustment');
    }
    const oldQty = p.stock;
    const oldReserved = p.reserved || 0;

    // update stock if provided
    if (typeof newQty !== 'undefined' && newQty !== '') {
      p.stock = Number(newQty || 0);
    }

    // update reserved only via adjustment
    if (typeof reservedQty !== 'undefined' && reservedQty !== '') {
      p.reserved = Number(reservedQty || 0);
    }

    await p.save();

    await Adjustment.create({
      product: p._id,
      oldQty,
      newQty: p.stock,
      oldReserved,
      newReserved: p.reserved,
      reason,
      createdBy: req.session && req.session.user ? req.session.user.id : undefined
    });

    req.flash('success','Adjustment saved');
    return res.redirect('/adjustment');
  } catch (err) {
    console.error('Error creating adjustment:', err);
    req.flash('error','Failed to save adjustment');
    return res.redirect('/adjustment');
  }
};
