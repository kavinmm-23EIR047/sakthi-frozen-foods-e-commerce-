import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: 'Leaf' },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
