const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');

async function renderDashboard(req, res) {
  try {
    // total number of products
    const totalProducts = await Product.countDocuments();

    // total stock 
    const stockAgg = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$stock', 0] } } } }
    ]);
    const totalStock = (stockAgg[0] && stockAgg[0].total) ? stockAgg[0].total : 0;

    // recent receipts and deliveries 
    const recentReceipts = await Receipt.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name').lean();
    const recentDeliveries = await Delivery.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name').lean();

    // counts for dashboard operations 
    const totalReceipts = await Receipt.countDocuments();
    const pendingReceipts = await Receipt.countDocuments({ status: { $ne: 'done' } });
    const lateReceipts = await Receipt.countDocuments({ status: 'late' });

    const totalDeliveries = await Delivery.countDocuments();
    const pendingDeliveries = await Delivery.countDocuments({ status: { $ne: 'done' } });
    const lateDeliveries = await Delivery.countDocuments({ status: 'late' });

    const activity = [];
    recentReceipts.forEach(r => activity.push({ type: 'Receipt', ref: r.ref || r._id, summary: (r.items||[]).length + ' items', date: r.createdAt, user: r.createdBy ? r.createdBy.name : null }));
    recentDeliveries.forEach(d => activity.push({ type: 'Delivery', ref: d.ref || d._id, summary: (d.items||[]).length + (d.items && d.items.length===1 ? ' item' : ' items'), date: d.createdAt, user: d.createdBy ? d.createdBy.name : null }));

    const recentActivity = activity.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,8);

    if (!req.session || !req.session.user) {
      return res.render('landing', {
        totalProducts,
        totalStock,
        recentActivity: recentActivity.slice(0,4)
      });
    }

    res.render('dashboard', {
      totalProducts,
      totalStock,
      recentReceipts,
      recentDeliveries,
      recentActivity,
      // operation counts
      totalReceipts,
      pendingReceipts,
      lateReceipts,
      totalDeliveries,
      pendingDeliveries,
      lateDeliveries
    });
  } catch (err) {
    console.error('Error building dashboard:', err);
    // fall back to empty/zero dashboard
    res.render('dashboard', {
      totalProducts: 0,
      totalStock: 0,
      recentReceipts: [],
      recentDeliveries: [],
      recentActivity: []
    });
  }
}

router.get('/', renderDashboard);
router.get('/dashboard', renderDashboard);

router.get('/landing', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const stockAgg = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$stock', 0] } } } }
    ]);
    const totalStock = (stockAgg[0] && stockAgg[0].total) ? stockAgg[0].total : 0;

    const recentReceipts = await Receipt.find().sort({ createdAt: -1 }).limit(4).lean();
    const recentDeliveries = await Delivery.find().sort({ createdAt: -1 }).limit(4).lean();
    const activity = [];
    recentReceipts.forEach(r => activity.push({ type: 'Receipt', ref: r.ref || r._id, summary: (r.items||[]).length + ' items', date: r.createdAt }));
    recentDeliveries.forEach(d => activity.push({ type: 'Delivery', ref: d.ref || d._id, summary: (d.items||[]).length + (d.items && d.items.length===1 ? ' item' : ' items'), date: d.createdAt }));
    const recentActivity = activity.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,4);

    res.render('landing', { totalProducts, totalStock, recentActivity });
  } catch (err) {
    console.error('landing route', err);
    res.render('landing', { totalProducts: 0, totalStock: 0, recentActivity: [] });
  }
});

module.exports = router;
