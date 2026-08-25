const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    location: { type: String, default: '' },
    rating: { type: Number, default: 5 },
    comment: { type: String, required: true },
    avatar: { type: String, default: '' },
    dateText: { type: String, default: 'Recently' },
    isGoogleReview: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
