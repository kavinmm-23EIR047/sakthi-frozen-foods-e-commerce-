const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: 'Leaf' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
