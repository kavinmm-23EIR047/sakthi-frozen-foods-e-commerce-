const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    weight: { type: String, required: true },
    mrp: { type: Number, default: 0 },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    stock: { type: Number, default: 50 },
    image: { type: String, default: '' },
    isPopular: { type: Boolean, default: false },
    variants: [
      {
        weight: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
