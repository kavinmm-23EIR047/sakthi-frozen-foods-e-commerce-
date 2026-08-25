const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const rawCategories = await Category.find().sort({ createdAt: 1 });
    const categories = rawCategories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
      image: c.image,
      icon: c.icon,
    }));
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new category
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const newCat = await Category.create({
      name: body.name,
      description: body.description || '',
      image: body.image || '',
      icon: body.icon || 'Leaf',
    });
    res.status(201).json({
      success: true,
      data: {
        id: newCat._id.toString(),
        name: newCat.name,
        description: newCat.description,
        image: newCat.image,
        icon: newCat.icon,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({
      success: true,
      data: {
        id: updated._id.toString(),
        name: updated.name,
        description: updated.description,
        image: updated.image,
        icon: updated.icon,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
