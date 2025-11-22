const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', LocationSchema);
