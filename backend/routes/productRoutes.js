const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80);
}

function productInput(body, partial = false) {
  const input = {};
  if (!partial || body.name !== undefined) input.name = String(body.name || '').trim();
  if (!partial || body.category !== undefined) input.category = String(body.category || '').trim();
  if (!partial || body.weight !== undefined) input.weight = String(body.weight || '1 KG').trim();
  if (!partial || body.price !== undefined) input.price = Number(body.price);
  if (!partial || body.mrp !== undefined) input.mrp = Number(body.mrp ?? body.price);
  if (!partial || body.stock !== undefined) input.stock = Number(body.stock);
  if (body.code !== undefined) input.code = String(body.code).trim();
  if (body.description !== undefined) input.description = String(body.description);
  if (body.image !== undefined) input.image = String(body.image);
  if (body.isPopular !== undefined) input.isPopular = Boolean(body.isPopular);
  if (body.variants !== undefined) input.variants = body.variants;
  const validVariants = !input.variants || (Array.isArray(input.variants) && input.variants.every((variant) => variant.weight && Number.isFinite(Number(variant.price)) && Number(variant.price) >= 0));
  if (!input.name || !input.category || !input.weight || !Number.isFinite(input.price) || input.price < 0 || !Number.isFinite(input.mrp) || input.mrp < 0 || !Number.isInteger(input.stock) || input.stock < 0 || !validVariants) return null;
  return input;
}

// GET all products (with optional category and search filters)
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
    const { category, search, page: pageQuery, limit: limitQuery } = req.query;
    const page = Math.max(parseInt(pageQuery || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(limitQuery || '50', 10), 1), 100);
    
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: escapeRegex(String(search)), $options: 'i' };
    }
    
    const productQuery = Product.find(query)
      .select('code name weight mrp price category description stock image isPopular variants')
      .sort({ code: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    const [rawProducts, totalCount] = await Promise.all([
      productQuery,
      Product.countDocuments(query)
    ]);
    const products = rawProducts.map((p) => ({
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
    }));
    res.json({ 
      success: true, 
      count: products.length, 
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: products 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid product id' });
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({
      success: true,
      data: {
        id: product._id.toString(),
        code: product.code,
        name: product.name,
        weight: product.weight,
        mrp: product.mrp,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        image: product.image,
        isPopular: product.isPopular,
        variants: product.variants || [],
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new product (Create)
router.post('/', protect, admin, async (req, res) => {
  try {
    const body = req.body || {};
    const input = productInput({ ...body, category: body.category || 'Mutton Alternatives', weight: body.weight || '1 KG', stock: body.stock ?? 50 });
    if (!input) return res.status(400).json({ success: false, error: 'Invalid product data' });
    const newProd = await Product.create({
      code: input.code || String(Date.now()), description: '', image: '', isPopular: false, variants: [], ...input,
    });
    res.status(201).json({
      success: true,
      data: {
        id: newProd._id.toString(),
        code: newProd.code,
        name: newProd.name,
        weight: newProd.weight,
        mrp: newProd.mrp,
        price: newProd.price,
        category: newProd.category,
        description: newProd.description,
        stock: newProd.stock,
        image: newProd.image,
        isPopular: newProd.isPopular,
        variants: newProd.variants || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update product (Update)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const input = productInput(req.body || {}, true);
    if (!input) return res.status(400).json({ success: false, error: 'Invalid product data' });
    const updated = await Product.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({
      success: true,
      data: {
        id: updated._id.toString(),
        code: updated.code,
        name: updated.name,
        weight: updated.weight,
        mrp: updated.mrp,
        price: updated.price,
        category: updated.category,
        description: updated.description,
        stock: updated.stock,
        image: updated.image,
        isPopular: updated.isPopular,
        variants: updated.variants || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE product
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
