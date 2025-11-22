const Product = require('../models/Product');

exports.list = async (req, res) => {
  const q = {};
  const isMine = !!(req.query.mine && req.session && req.session.user);
  if (isMine) q.createdBy = req.session.user.id;
  const products = await Product.find(q).sort({name:1}).populate('createdBy', 'name');
  res.render('product/list', { products, mine: isMine });
};

exports.showCreate = (req, res) => res.render('product/create');

exports.create = async (req, res) => {
  const { name, sku, category, unit, stock, location } = req.body;
  try {
    await Product.create({ name, sku, category, unit, stock: Number(stock||0), location, createdBy: req.session && req.session.user ? req.session.user.id : undefined });
    req.flash('success', 'Product created');
    res.redirect('/products');
  } catch (err) {
    req.flash('error', 'Create error: ' + err.message);
    res.redirect('/products/create');
  }
};

exports.showEdit = async (req, res) => {
  const p = await Product.findById(req.params.id);
  res.render('product/edit', { p });
};

exports.update = async (req, res) => {
  const { name, sku, category, unit, stock, location } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { name, sku, category, unit, stock:Number(stock||0), location });
  req.flash('success', 'Updated');
  res.redirect('/products');
};

exports.remove = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  req.flash('success', 'Deleted');
  res.redirect('/products');
};
