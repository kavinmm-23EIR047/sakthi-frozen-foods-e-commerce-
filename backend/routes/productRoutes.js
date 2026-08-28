const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products (with optional category and search filters)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const rawProducts = await Product.find(query).sort({ code: 1 });
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
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
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
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const newProd = await Product.create({
      code: body.code || String(Date.now()),
      name: body.name,
      weight: body.weight || '1 KG',
      mrp: Number(body.mrp) || Number(body.price),
      price: Number(body.price),
      category: body.category || 'Mutton Alternatives',
      description: body.description || '',
      stock: Number(body.stock) || 50,
      image: body.image || '',
      isPopular: body.isPopular || false,
      variants: body.variants || [],
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
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
