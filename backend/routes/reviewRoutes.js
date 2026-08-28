const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

const INITIAL_REVIEWS = [
  {
    authorName: 'Kavitha R.',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    comment: 'The Veg Mutton in our Sunday Biryani tasted EXACTLY like traditional mutton! My family was shocked. Extremely juicy and rich texture.',
    avatar: '',
    dateText: '2 days ago',
    isGoogleReview: true,
  },
  {
    authorName: 'Arun Kumar',
    location: 'Bangalore, Karnataka',
    rating: 5,
    comment: 'Switched to plant-based 6 months ago. Sakthi Fish Fingers and Prawns are a game changer! High protein, zero cholesterol.',
    avatar: '',
    dateText: '1 week ago',
    isGoogleReview: true,
  },
  {
    authorName: 'Priya Sundaram',
    location: 'Coimbatore, Tamil Nadu',
    rating: 5,
    comment: 'Deep frozen delivery arrived in insulated thermal packaging at -18°C. Super fresh and easy to cook in 10 minutes!',
    avatar: '',
    dateText: '3 weeks ago',
    isGoogleReview: true,
  },
  {
    authorName: 'Rajesh V.',
    location: 'Madurai, Tamil Nadu',
    rating: 5,
    comment: 'Authentic taste and texture. Perfect for South Indian curries and gravies. 10/10 recommended for vegans and non-vegans alike!',
    avatar: '',
    dateText: '1 month ago',
    isGoogleReview: true,
  },
];

// GET all reviews
router.get('/', async (req, res) => {
  try {
    let reviews = await Review.find().sort({ createdAt: -1 });
    if (reviews.length === 0) {
      reviews = await Review.insertMany(INITIAL_REVIEWS);
    }
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
