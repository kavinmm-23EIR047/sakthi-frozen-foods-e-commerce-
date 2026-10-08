const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, admin } = require('../middleware/authMiddleware');
const cacheService = require('../services/cacheService');

// GET all reviews (Cached with Upstash Redis + L1 Micro-cache)
router.get('/', async (req, res) => {
  try {
    const { data: reviews } = await cacheService.getOrSet('sakthi:reviews:all', async () => {
      const list = await Review.find().sort({ rating: -1, createdAt: -1 });
      return list || [];
    }, 300);

    res.json({ success: true, count: (reviews || []).length, data: reviews || [] });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

// POST new Google review
router.post('/', async (req, res) => {
  try {
    const newReview = await Review.create({
      authorName: req.body.authorName || 'Google User',
      location: req.body.location || 'India',
      rating: Number(req.body.rating) || 5,
      comment: req.body.comment,
      avatar: req.body.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.body.authorName || 'Google User')}&background=4D583F&color=fff`,
      dateText: req.body.dateText || 'Just now',
      isGoogleReview: true,
    });

    // Invalidate review cache
    await cacheService.delPattern('sakthi:reviews:*');

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE review
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);

    // Invalidate review cache
    await cacheService.delPattern('sakthi:reviews:*');

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
