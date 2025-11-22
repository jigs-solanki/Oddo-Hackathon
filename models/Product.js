const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: String,
  unit: String,
  stock: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  location: { type: String, default: 'Main Warehouse' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
