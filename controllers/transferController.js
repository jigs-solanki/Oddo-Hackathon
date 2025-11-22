const Transfer = require('../models/Transfer');
const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');

exports.list = async (req, res) => {
  try {
    const q = {};
    const isMine = !!(req.query.mine && req.session && req.session.user);
    if (isMine) q.createdBy = req.session.user.id;

    // fetch transfers, receipts, deliveries and merge into a unified move history
    const [transfersRaw, receiptsRaw, deliveriesRaw] = await Promise.all([
      Transfer.find(q).populate('items.product').populate('createdBy', 'name').lean(),
      Receipt.find(q).populate('items.product').populate('createdBy', 'name').lean(),
      Delivery.find(q).populate('items.product').populate('createdBy', 'name').lean()
    ]);

    const moves = [];

    // map transfers as-is
    transfersRaw.forEach(t => {
      moves.push({
        type: 'transfer',
        ref: t.ref || t._id,
        createdAt: t.createdAt,
        contact: t.contact || (t.createdBy ? t.createdBy.name : null),
        from: t.from,
        to: t.to,
        items: t.items || [],
        raw: t
      });
    });

    // map receipts as IN moves (from supplier/vendor to warehouse)
    receiptsRaw.forEach(r => {
      moves.push({
        type: 'receipt',
        ref: r.ref || r._id,
        createdAt: r.createdAt,
        contact: r.supplier || (r.createdBy ? r.createdBy.name : null),
        from: r.supplier || 'Vendor',
        to: 'Main Warehouse',
        items: r.items || [],
        raw: r
      });
    });

    // map deliveries as OUT moves (from warehouse to customer)
    deliveriesRaw.forEach(d => {
      moves.push({
        type: 'delivery',
        ref: d.ref || d._id,
        createdAt: d.createdAt,
        contact: d.customer || (d.createdBy ? d.createdBy.name : null),
        from: 'Main Warehouse',
        to: d.customer || 'Customer',
        items: d.items || [],
        raw: d
      });
    });

    // sort by date desc
    moves.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.render('transfer/list', { transfers: moves, mine: isMine });
  } catch (err) {
    console.error('Error loading transfers:', err);
    req.flash('error', 'Failed to load history');
    return res.redirect('/');
  }
};

exports.showCreate = async (req, res) => {
  try {
    const products = await Product.find();
    return res.render('transfer/create', { products });
  } catch (err) {
    console.error('Error showing create transfer:', err);
    req.flash('error', 'Failed to load form');
    return res.redirect('/history');
  }
};

exports.create = async (req, res) => {
  try {
    let { from, to, productIds = [], qtys = [] } = req.body;

    // normalize single-values to arrays (forms may submit a string when only one row)
    if (!Array.isArray(productIds)) productIds = productIds ? [productIds] : [];
    if (!Array.isArray(qtys)) qtys = qtys ? [qtys] : [];

    const items = [];
    const updatePromises = [];
    for (let i = 0; i < productIds.length; i++) {
      const pid = productIds[i];
      const q = Number(qtys[i] || 0);
      if (!pid || q <= 0) continue;
      items.push({ product: pid, qty: q });
      // update product location (move). Use non-blocking updates and await later.
      updatePromises.push(Product.findByIdAndUpdate(pid, { $set: { location: to } }).exec());
    }

    if (items.length === 0) {
      req.flash('error', 'No valid items provided for transfer');
      return res.redirect('/history');
    }

    // perform product updates in parallel
    await Promise.all(updatePromises);

    await Transfer.create({ from, to, items, createdBy: req.session && req.session.user ? req.session.user.id : undefined });
    req.flash('success', 'Transfer created');
    return res.redirect('/history');
  } catch (err) {
    console.error('Error creating transfer:', err);
    req.flash('error', 'Failed to create transfer');
    return res.redirect('/history');
  }
};
