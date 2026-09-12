const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

function normalizeItems(items) {
  const merged = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const productId = String(item.productId || '');
    const weight = String(item.weight || '');
    const quantity = Number(item.quantity);
    if (!mongoose.isValidObjectId(productId) || !weight || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) continue;
    const key = `${productId}:${weight}`;
    merged.set(key, Math.min(50, (merged.get(key) || 0) + quantity));
  }
  return [...merged].map(([key, quantity]) => {
    const [productId, ...weightParts] = key.split(':');
    return { productId, weight: weightParts.join(':'), quantity };
  });
}

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanBaseName(name) {
  return String(name || '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s*-\s*Retail\s*Pack\s*/i, '')
    .replace(/\s+Retail\s+Pack\s*/i, '')
    .trim()
    .toLowerCase();
}

function normalizeWeight(w) {
  return String(w || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/grm|grams?|gm/i, 'g');
}

async function hydrateItems(items) {
  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Product.find({ _id: { $in: productIds } }).select('_id name weight price variants stock image').lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const available = [];
  const unavailable = [];

  for (const item of items) {
    let product = productMap.get(item.productId);
    let variant = product?.variants?.find((candidate) => normalizeWeight(candidate.weight) === normalizeWeight(item.weight));
    let isBaseWeight = product && normalizeWeight(product.weight) === normalizeWeight(item.weight);

    if (product && !variant && !isBaseWeight) {
      const baseName = cleanBaseName(product.name);
      if (baseName) {
        const companion = await Product.findOne({
          _id: { $ne: product._id },
          name: new RegExp('^' + escapeRegex(baseName), 'i'),
        }).select('_id name weight price variants stock image').lean();

        if (companion) {
          const compVariant = companion.variants?.find((candidate) => normalizeWeight(candidate.weight) === normalizeWeight(item.weight));
          const compBase = normalizeWeight(companion.weight) === normalizeWeight(item.weight);
          if (compVariant || compBase) {
            product = companion;
            variant = compVariant;
            isBaseWeight = compBase;
          }
        }
      }
    }

    if (!product || (!variant && !isBaseWeight)) {
      unavailable.push(item);
      continue;
    }
    available.push({
      ...item,
      productId: product._id.toString(),
      name: product.name,
      price: variant?.price ?? product.price,
      stock: product.stock,
      image: product.image,
    });
  }
  return { available, unavailable };
}

async function saveItems(userId, items) {
  const normalized = normalizeItems(items);
  const { available, unavailable } = await hydrateItems(normalized);
  const storedItems = available.map(({ productId, weight, quantity }) => ({ productId, weight, quantity }));
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { userId, items: storedItems },
    { upsert: true, new: true, runValidators: true }
  ).lean();
  return { available, unavailable, updatedAt: cart.updatedAt };
}

router.get('/', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).lean();
    const { available, unavailable } = await hydrateItems(cart?.items || []);
    res.json({ success: true, data: available, unavailable });
  } catch (error) {
    next(error);
  }
});

router.put('/', protect, async (req, res, next) => {
  try {
    const result = await saveItems(req.user._id, req.body?.items);
    res.json({ success: true, data: result.available, unavailable: result.unavailable, updatedAt: result.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.post('/items', protect, async (req, res, next) => {
  try {
    const productId = String(req.body?.productId || '');
    const weight = String(req.body?.weight || '');
    const quantity = Number(req.body?.quantity ?? 1);
    if (!mongoose.isValidObjectId(productId) || !weight || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return res.status(400).json({ success: false, error: 'Invalid cart item' });
    }
    const cart = await Cart.findOne({ userId: req.user._id }).lean();
    const result = await saveItems(req.user._id, [...(cart?.items || []), { productId, weight, quantity }]);
    res.json({ success: true, data: result.available, unavailable: result.unavailable, updatedAt: result.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.patch('/items', protect, async (req, res, next) => {
  try {
    const productId = String(req.body?.productId || '');
    const weight = String(req.body?.weight || '');
    const quantity = Number(req.body?.quantity);
    if (!mongoose.isValidObjectId(productId) || !weight || !Number.isInteger(quantity) || quantity < 0 || quantity > 50) {
      return res.status(400).json({ success: false, error: 'Invalid cart quantity' });
    }
    const cart = await Cart.findOne({ userId: req.user._id }).lean();
    const items = (cart?.items || []).filter((item) => !(item.productId === productId && item.weight === weight));
    if (quantity > 0) items.push({ productId, weight, quantity });
    const result = await saveItems(req.user._id, items);
    res.json({ success: true, data: result.available, unavailable: result.unavailable, updatedAt: result.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.delete('/items', protect, async (req, res, next) => {
  try {
    const productId = String(req.body?.productId || '');
    const weight = String(req.body?.weight || '');
    if (!mongoose.isValidObjectId(productId) || !weight) return res.status(400).json({ success: false, error: 'Invalid cart item' });
    const cart = await Cart.findOne({ userId: req.user._id }).lean();
    const items = (cart?.items || []).filter((item) => !(item.productId === productId && item.weight === weight));
    const result = await saveItems(req.user._id, items);
    res.json({ success: true, data: result.available, unavailable: result.unavailable, updatedAt: result.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.delete('/', protect, async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } }, { upsert: true });
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
