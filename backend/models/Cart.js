const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [{
    productId: { type: String, required: true },
    weight: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 50 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
