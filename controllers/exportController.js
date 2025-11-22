const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');

function toCsv(rows, headers) {
  const esc = v => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const head = headers.join(',');
  const lines = [head];
  rows.forEach(r => {
    const vals = headers.map(h => esc(r[h]));
    lines.push(vals.join(','));
  });
  return lines.join('\n');
}

exports.exportData = async (req, res) => {
  try {
    const resource = (req.query.resource || 'products').toLowerCase();
    const mine = req.query.mine === '1' || req.query.mine === 'true';
    if (resource === 'products') {
      const q = {};
      if (mine && req.session && req.session.user) q.createdBy = req.session.user.id;
      const docs = await Product.find(q).populate('createdBy', 'name').lean();
      const rows = docs.map(d => ({
        id: d._id,
        name: d.name,
        sku: d.sku,
        category: d.category || '',
        unit: d.unit || '',
        stock: d.stock || 0,
        location: d.location || '',
        createdBy: d.createdBy ? d.createdBy.name : '',
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : ''
      }));
      const headers = ['id','name','sku','category','unit','stock','location','createdBy','createdAt'];
      const csv = toCsv(rows, headers);
      res.setHeader('Content-disposition', 'attachment; filename=products.csv');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csv);
    }

    if (resource === 'receipts') {
      const q = {};
      if (mine && req.session && req.session.user) q.createdBy = req.session.user.id;
      const docs = await Receipt.find(q).populate('items.product').populate('createdBy','name').lean();
      
      const rows = docs.map(d => ({
        id: d._id,
        supplier: d.supplier || '',
        itemsCount: (d.items || []).length,
        items: (d.items || []).map(i => (i.product ? i.product.name : i.product) + ' x' + (i.qty||0)).join('; '),
        createdBy: d.createdBy ? d.createdBy.name : '',
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : ''
      }));
      const headers = ['id','supplier','itemsCount','items','createdBy','createdAt'];
      const csv = toCsv(rows, headers);
      res.setHeader('Content-disposition', 'attachment; filename=receipts.csv');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csv);
    }

    if (resource === 'deliveries' || resource === 'delivery') {
      const q = {};
      if (mine && req.session && req.session.user) q.createdBy = req.session.user.id;
      const docs = await Delivery.find(q).populate('items.product').populate('createdBy','name').lean();
      const rows = docs.map(d => ({
        id: d._id,
        customer: d.customer || '',
        itemsCount: (d.items || []).length,
        items: (d.items || []).map(i => (i.product ? i.product.name : i.product) + ' x' + (i.qty||0)).join('; '),
        createdBy: d.createdBy ? d.createdBy.name : '',
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : ''
      }));
      const headers = ['id','customer','itemsCount','items','createdBy','createdAt'];
      const csv = toCsv(rows, headers);
      res.setHeader('Content-disposition', 'attachment; filename=deliveries.csv');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csv);
    }

    return res.status(400).send('Unsupported resource');
  } catch (err) {
    console.error('Export error', err);
    return res.status(500).send('Export failed');
  }
};
