const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// Format product for client
function formatProduct(p) {
  if (!p) return null;
  return {
    id: p._id.toString(),
    code: p.code,
    name: p.name,
    weight: p.weight,
    mrp: p.mrp,
    price: p.price,
    category: p.category,
    description: p.description,
    stock: p.stock,
    image: p.image,
    isPopular: p.isPopular,
    variants: p.variants || [],
  };
}

// GET /api/wishlist - Get user's wishlist with populated product details
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'code name weight mrp price category description stock image isPopular variants',
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const products = (user.wishlist || [])
      .filter((p) => p && p._id)
      .map(formatProduct);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wishlist/ids - Get list of product IDs in user's wishlist
router.get('/ids', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wishlist');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const ids = (user.wishlist || [])
      .filter((id) => id)
      .map((id) => id.toString());

    res.json({
      success: true,
      data: ids,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wishlist/toggle - Toggle a product in wishlist (Add if absent, Remove if present)
router.post('/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, error: 'Valid productId is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    const strId = productId.toString();
    const existingIndex = user.wishlist.findIndex((id) => id && id.toString() === strId);

    let isSaved = false;
    if (existingIndex > -1) {
      user.wishlist.splice(existingIndex, 1);
      isSaved = false;
    } else {
      // Check if product actually exists
      const productExists = await Product.exists({ _id: productId });
      if (!productExists) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      user.wishlist.push(productId);
      isSaved = true;
    }

    await user.save();

    res.json({
      success: true,
      isSaved,
      wishlistIds: user.wishlist.map((id) => id.toString()),
      message: isSaved ? 'Added to wishlist' : 'Removed from wishlist',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wishlist/sync - Merge client-side local guest product IDs into user account
router.post('/sync', protect, async (req, res) => {
  try {
    const { productIds } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      const existingSet = new Set(user.wishlist.map((id) => id.toString()));
      const validProductIds = productIds.filter((pid) => mongoose.isValidObjectId(pid) && !existingSet.has(pid.toString()));

      if (validProductIds.length > 0) {
        const foundProducts = await Product.find({ _id: { $in: validProductIds } }).select('_id');
        for (const p of foundProducts) {
          user.wishlist.push(p._id);
        }
        await user.save();
      }
    }

    const populatedUser = await User.findById(user._id).populate({
      path: 'wishlist',
      select: 'code name weight mrp price category description stock image isPopular variants',
    });

    const products = (populatedUser.wishlist || [])
      .filter((p) => p && p._id)
      .map(formatProduct);

    res.json({
      success: true,
      count: products.length,
      data: products,
      wishlistIds: (populatedUser.wishlist || []).map((p) => p._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/wishlist/:productId - Remove item from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, error: 'Valid productId is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (Array.isArray(user.wishlist)) {
      user.wishlist = user.wishlist.filter((id) => id && id.toString() !== productId.toString());
      await user.save();
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist',
      wishlistIds: (user.wishlist || []).map((id) => id.toString()),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/wishlist - Clear entire wishlist
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.wishlist = [];
      await user.save();
    }
    res.json({ success: true, message: 'Wishlist cleared', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
