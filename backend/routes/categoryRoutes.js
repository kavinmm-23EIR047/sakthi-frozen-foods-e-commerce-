const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const cacheService = require('../services/cacheService');

// GET all categories (Cached with Upstash Redis + L1 Micro-cache)
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    
    const { data: categories } = await cacheService.getOrSet('sakthi:categories:all', async () => {
      const rawCategories = await Category.find().sort({ createdAt: 1 });
      let list = rawCategories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description || '',
        image: c.image || '',
        icon: c.icon || 'List',
      }));

      if (list.length === 0) {
        const productCategories = await Product.distinct('category', { category: { $type: 'string', $ne: '' } });
        list = productCategories.sort().map((name) => ({
          id: `product-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name,
          description: '',
          image: '',
          icon: 'Package',
        }));
      }
      return list;
    }, 600); // 10-minute cache with automatic invalidation on updates

    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new category (Invalidates Category and Product caches)
router.post('/', protect, admin, async (req, res) => {
  try {
    const body = req.body;
    const newCat = await Category.create({
      name: body.name,
      description: body.description || '',
      image: body.image || '',
      icon: body.icon || 'Leaf',
    });

    // Invalidate Redis cache
    await cacheService.delPattern('sakthi:categories:*');
    await cacheService.delPattern('sakthi:products:*');

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
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Invalidate Redis cache
    await cacheService.delPattern('sakthi:categories:*');
    await cacheService.delPattern('sakthi:products:*');

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
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    // Invalidate Redis cache
    await cacheService.delPattern('sakthi:categories:*');
    await cacheService.delPattern('sakthi:products:*');

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
