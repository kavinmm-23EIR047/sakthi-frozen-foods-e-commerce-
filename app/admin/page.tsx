'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  DollarSign,
  Eye,
  RefreshCw,
  X,
  List,
  BarChart2,
  Star,
  Flame
} from 'lucide-react';
import { ProductType, OrderType, UserType, CategoryType } from '@/lib/seedData';
import { fetchApi } from '@/lib/apiConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import ImageUploader from '@/components/ImageUploader';

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'categories' | 'orders' | 'users' | 'reviews'>('analytics');

  // Data states
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Modals
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);

  const [selectedOrderModal, setSelectedOrderModal] = useState<OrderType | null>(null);
  
  // Image Upload State
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State for Add / Edit Product
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    weight: '1 KG',
    price: 500,
    category: 'Mutton Alternatives',
    description: '',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isPopular: false,
    variants: [] as { weight: string; price: number }[],
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'List',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, ordData, usrData, catData, revData] = await Promise.all([
        fetchApi('/products'),
        fetchApi('/orders'),
        fetchApi('/users'),
        fetchApi('/categories'),
        fetchApi('/reviews'),
      ]);

      if (prodData.success) setProducts(prodData.data);
      if (ordData.success) setOrders(ordData.data);
      if (usrData.success) setUsers(usrData.data);
      if (catData.success) setCategories(catData.data);
      if (revData.success) setReviews(revData.data);
    } catch (error) {
      console.error('Error loading admin dashboard data');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // CRUD Handlers for Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = formData.image;
      
      if (imageType === 'upload' && imageFile) {
        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        const uploadRes = await fetchApi('/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        setUploadingImage(false);
        
        if (uploadRes.success) {
          finalImageUrl = uploadRes.data;
        } else {
          alert('Failed to upload image: ' + uploadRes.error);
          return;
        }
      }

      const finalFormData = { ...formData, image: finalImageUrl, weight: '1 KG' };

      if (editingProduct) {
        // PUT edit
        const data = await fetchApi(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(finalFormData),
        });
        if (data.success) {
          setEditingProduct(null);
          fetchData();
        } else {
          alert(data.error);
        }
      } else {
        // POST add
        const data = await fetchApi('/products', {
          method: 'POST',
          body: JSON.stringify(finalFormData),
        });
        if (data.success) {
          setIsAddModalOpen(false);
          fetchData();
        } else {
          alert(data.error);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to save product');
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const data = await fetchApi(`/products/${id}`, { method: 'DELETE' });
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Handlers for Categories
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = categoryFormData.image;
      
      if (imageType === 'upload' && imageFile) {
        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        const uploadRes = await fetchApi('/upload', {
          method: 'POST',
          body: uploadData,
        });
        
        setUploadingImage(false);
        
        if (uploadRes.success) {
          finalImageUrl = uploadRes.data;
        } else {
          alert('Failed to upload image: ' + uploadRes.error);
          return;
        }
      }

      const finalData = { ...categoryFormData, image: finalImageUrl };

      if (editingCategory) {
        const data = await fetchApi(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(finalData),
        });
        if (data.success) {
          setEditingCategory(null);
          fetchData();
        } else alert(data.error);
      } else {
        const data = await fetchApi('/categories', {
          method: 'POST',
          body: JSON.stringify(finalData),
        });
        if (data.success) {
          setIsCategoryModalOpen(false);
          fetchData();
        } else alert(data.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to save category');
      setUploadingImage(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const data = await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const data = await fetchApi(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (prod: ProductType) => {
    setEditingProduct(prod);
    setFormData({
      code: prod.code,
      name: prod.name,
      weight: prod.weight,
      price: prod.price,
      category: prod.category,
      description: prod.description,
      stock: prod.stock,
      image: prod.image,
      isPopular: !!prod.isPopular,
      variants: prod.variants || [],
    });
    setImageType('url');
    setImageFile(null);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      code: String(products.length + 1),
      name: '',
      weight: '1 KG',
      price: 600,
      category: categories[0]?.name || 'Mutton Alternatives',
      description: '',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      isPopular: false,
      variants: [],
    });
    setImageType('url');
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const openEditCategoryModal = (cat: CategoryType) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      description: cat.description,
      image: cat.image,
      icon: cat.icon,
    });
    setImageType('url');
    setImageFile(null);
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      icon: 'List',
    });
    setImageType('url');
    setImageFile(null);
    setIsCategoryModalOpen(true);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.includes(productSearch)
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Prepare data for Recharts
  const revenueByStatus = [
    { name: 'Pending', value: orders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + o.totalAmount, 0) },
    { name: 'Processing', value: orders.filter(o => o.status === 'Processing').reduce((acc, o) => acc + o.totalAmount, 0) },
    { name: 'Shipped', value: orders.filter(o => o.status === 'Shipped').reduce((acc, o) => acc + o.totalAmount, 0) },
    { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + o.totalAmount, 0) },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').reduce((acc, o) => acc + o.totalAmount, 0) }
  ];

  return (
    <div className="min-h-screen bg-[#E8EEE0] text-[#1E201D] font-sans">
      {/* Top Navbar */}
      <header className="bg-[#1E201D] text-white sticky top-0 z-30 shadow-md">
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4D583F] flex items-center justify-center text-white shadow-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight block leading-none font-poppins">
                SAKTHI ADMIN PORTAL
              </span>
              <span className="text-[10px] font-semibold text-[#A7ADA9] uppercase tracking-widest block mt-0.5">
                E-Commerce Management Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs flex items-center gap-1.5 font-semibold"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#4D583F] text-white text-xs font-bold hover:bg-[#414b35] transition-all flex items-center gap-2 shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="site-shell py-6 sm:py-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-[#4F534C]/15 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4D583F] text-white flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#61665D] block font-medium">Total Revenue</span>
              <span className="text-2xl font-black text-[#1E201D]">₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#4F534C]/15 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#61665D] block font-medium">Total Orders</span>
              <span className="text-2xl font-black text-[#1E201D]">{orders.length}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#4F534C]/15 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#61665D] block font-medium">Active Products</span>
              <span className="text-2xl font-black text-[#1E201D]">{products.length}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#4F534C]/15 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#61665D] block font-medium">Registered Users</span>
              <span className="text-2xl font-black text-[#1E201D]">{users.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#4F534C]/20 gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-5 font-extrabold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-[#4D583F] text-[#4D583F]'
                : 'border-transparent text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-5 font-extrabold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'border-[#4D583F] text-[#4D583F]'
                : 'border-transparent text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products (CRUD) ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-5 font-extrabold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'categories'
                ? 'border-[#4D583F] text-[#4D583F]'
                : 'border-transparent text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Categories (CRUD) ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-5 font-extrabold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#4D583F] text-[#4D583F]'
                : 'border-transparent text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-5 font-extrabold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'border-[#4D583F] text-[#4D583F]'
                : 'border-transparent text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Directory ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-5 font-extrabold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-[#4D583F] text-[#4D583F]'
                : 'border-transparent text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Google Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* TAB 0: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl border border-[#4F534C]/15 shadow-sm p-6">
            <h3 className="text-xl font-bold text-[#1E201D] mb-6 font-poppins">Revenue by Order Status</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF0E5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#61665D', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#61665D', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                  <RechartsTooltip 
                    cursor={{ fill: '#E8EEE0' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                  />
                  <Bar dataKey="value" fill="#4D583F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 1: PRODUCTS (CRUD) */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search products by name or code..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                />
                <Search className="w-4 h-4 text-[#61665D] absolute left-3.5 top-3" />
              </div>

              <button
                onClick={openAddModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4D583F] text-white font-bold text-xs hover:bg-[#414b35] transition-all flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#4F534C]/15 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#4D583F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                    <tr>
                      <th className="py-3.5 px-4">Code</th>
                      <th className="py-3.5 px-4">Product Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Weight</th>
                      <th className="py-3.5 px-4">Price (₹)</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Homepage Best Seller</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4F534C]/10">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#EAF0E5]/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#4D583F]">#{p.code}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#4F534C]/15 shrink-0"
                            />
                            <div>
                              <span className="font-bold block text-sm">{p.name}</span>
                              <span className="text-[11px] text-[#61665D] line-clamp-1">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#61665D]">{p.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="bg-[#EAF0E5] text-[#4D583F] font-bold px-2 py-0.5 rounded text-[11px]" title="Base Weight">
                              {p.weight}
                            </span>
                            {p.variants?.map((v, idx) => (
                              <span key={idx} className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]" title="Custom Option">
                                {v.weight}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-sm text-[#4D583F]">
                          ₹{p.price}
                          {p.variants && p.variants.length > 0 && (
                            <span className="block text-[10px] text-[#61665D] font-normal">
                              + {p.variants.map((v) => `₹${v.price}`).join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              p.stock > 20
                                ? 'bg-green-100 text-green-800'
                                : p.stock > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={async () => {
                              await fetchApi(`/products/${p.id}`, {
                                method: 'PUT',
                                body: JSON.stringify({ isPopular: !p.isPopular }),
                              });
                              fetchData();
                            }}
                            className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 shadow-xs ${
                              p.isPopular
                                ? 'bg-amber-500 text-white shadow-amber-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            <Flame className={`w-3.5 h-3.5 ${p.isPopular ? 'fill-white' : ''}`} />
                            <span>{p.isPopular ? 'Best Seller ON' : 'Off'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1.5: CATEGORIES (CRUD) */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#1E201D] font-poppins">Manage Categories</h2>
              <button
                onClick={openAddCategoryModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4D583F] text-white font-bold text-xs hover:bg-[#414b35] transition-all flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-[#4F534C]/15 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#4D583F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                    <tr>
                      <th className="py-3.5 px-4">Category Name</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4F534C]/10">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-[#EAF0E5]/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#4F534C]/15 shrink-0"
                            />
                            <span className="font-bold block text-sm">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#61665D] line-clamp-2">{cat.description}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditCategoryModal(cat)}
                              className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-[#4F534C]/15 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1E201D]">
                <thead className="bg-[#EAF0E5] text-[#4D583F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Contact & Address</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4 text-right">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4F534C]/10">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#EAF0E5]/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#4D583F]">{ord.orderNumber}</td>
                      <td className="py-3.5 px-4 font-bold">{ord.customerName}</td>
                      <td className="py-3.5 px-4 text-[#61665D]">
                        <div className="font-semibold text-[#1E201D]">{ord.customerPhone}</div>
                        <div className="text-[11px] line-clamp-1">{ord.shippingAddress}</div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm text-[#4D583F]">₹{ord.totalAmount}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                            ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            ord.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentStatus || 'Pending'}
                          </span>
                          {ord.razorpayPaymentId && (
                            <span className="text-[9px] text-[#61665D] font-mono break-all" title="Razorpay ID">
                              {ord.razorpayPaymentId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrderModal(ord)}
                          className="px-3 py-1 bg-[#EAF0E5] text-[#4D583F] rounded-lg font-bold hover:bg-[#4D583F] hover:text-white transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View ({ord.items?.length || 0})</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USERS DETAILS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                />
                <Search className="w-4 h-4 text-[#61665D] absolute left-3.5 top-3" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-[#4F534C]/15 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#4D583F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                    <tr>
                      <th className="py-3.5 px-4">User Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4">Total Orders</th>
                      <th className="py-3.5 px-4">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4F534C]/10">
                    {filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-[#FFF3E0]/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#2C3E50]">{usr.name}</td>
                        <td className="py-3.5 px-4 text-[#61665D]">{usr.email}</td>
                        <td className="py-3.5 px-4 font-medium">{usr.phone}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              usr.role === 'Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-[#FFF3E0] text-[#4D583F]'
                            }`}
                          >
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#61665D]">{usr.joinedDate}</td>
                        <td className="py-3.5 px-4 font-bold text-center sm:text-left">{usr.totalOrders}</td>
                        <td className="py-3.5 px-4 font-black text-[#4D583F]">₹{usr.totalSpent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Google Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#1E201D] font-poppins">Google Reviews</h2>
                <p className="text-xs text-[#61665D] mt-0.5">Manage customer Google Reviews displayed on the storefront.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#4F534C]/15 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#4D583F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                    <tr>
                      <th className="py-3.5 px-4">Author</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Comment</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4F534C]/10">
                    {reviews.map((rev) => (
                      <tr key={rev._id || rev.id} className="hover:bg-[#FAFAF5] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#1E201D] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#4D583F] text-white flex items-center justify-center text-xs font-black shrink-0">
                            {rev.authorName.slice(0, 1)}
                          </div>
                          <span>{rev.authorName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#61665D]">{rev.location || 'India'}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">
                          {rev.rating} ★
                        </td>
                        <td className="py-3.5 px-4 text-[#61665D] max-w-xs truncate">{rev.comment}</td>
                        <td className="py-3.5 px-4 text-[#61665D]">{rev.dateText || 'Recently'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete review from "${rev.authorName}"?`)) return;
                              await fetchApi(`/reviews/${rev._id || rev.id}`, { method: 'DELETE' });
                              fetchData();
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-[#4F534C]/20 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#4D583F] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Edit Product Details' : 'Add New Vegan Product'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Product form fields remain mostly the same, just changed classes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C3E50] mb-1">Product Code #</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C3E50] mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C3E50] mb-1">Base Price per 1KG (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C3E50] mb-1">Base Weight</label>
                  <select
                    value={formData.weight || '1 KG'}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none font-medium text-xs sm:text-sm"
                  >
                    <option value="300 G">300 G</option>
                    <option value="1 KG">1 KG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C3E50] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2C3E50] mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                  />
                </div>
              </div>

              <ImageUploader
                label="Product Image"
                value={formData.image}
                required
                onChange={(imageUrl, compressedFile) => {
                  setFormData(prev => ({ ...prev, image: imageUrl }));
                  setImageFile(compressedFile);
                  if (compressedFile) setImageType('upload');
                }}
              />

              <div>
                <label className="block font-bold text-[#2C3E50] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                />
              </div>

              {/* Best Seller Checkbox Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#EAF0E5]/60 border border-[#4D583F]/20 flex items-center justify-between">
                <div>
                  <label className="font-extrabold text-xs text-[#1E201D] flex items-center gap-1.5 cursor-pointer">
                    <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>Feature as Best Seller (Show on Homepage)</span>
                  </label>
                  <p className="text-[10px] text-[#61665D] mt-0.5">Enables this product in the "Customer Favorites / Best Sellers" section on the storefront homepage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-5 h-5 accent-[#4D583F] cursor-pointer shrink-0"
                />
              </div>

              {/* Custom Weight Options (Optional) */}
              <div className="p-4 rounded-2xl bg-white border border-[#4F534C]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-extrabold text-xs text-[#1E201D] block">Custom Weight Options & Prices (Optional)</label>
                    <p className="text-[10px] text-[#61665D]">Add specific prices for different weight packs (e.g. 300 G at ₹220, 1 KG at ₹650).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, variants: [...prev.variants, { weight: '300 G', price: 220 }] }))}
                    className="px-3 py-1.5 rounded-xl bg-[#4D583F] text-white font-bold text-xs hover:bg-[#3D4732] transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Weight Option
                  </button>
                </div>

                {formData.variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#4F534C]/10">
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Weight (e.g. 300 G)"
                          value={v.weight}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[i].weight = e.target.value;
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="w-1/2 px-3 py-1.5 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-xs font-semibold focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[i].price = Number(e.target.value);
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="w-1/2 px-3 py-1.5 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-xs font-semibold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.variants.filter((_, idx) => idx !== i);
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#4F534C]/15 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-[#2C3E50] font-bold"
                >
                  Cancel
                </button>
                <button
                  disabled={uploadingImage}
                  className="px-5 py-2 rounded-xl bg-[#4D583F] text-white font-bold hover:bg-[#bf3a11] disabled:opacity-50"
                >
                  {uploadingImage ? 'Uploading...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {(isCategoryModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-[#4F534C]/20 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#4D583F] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-[#2C3E50] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                />
              </div>

              <ImageUploader
                label="Category Image"
                value={categoryFormData.image}
                required
                onChange={(imageUrl, compressedFile) => {
                  setCategoryFormData(prev => ({ ...prev, image: imageUrl }));
                  setImageFile(compressedFile);
                  if (compressedFile) setImageType('upload');
                }}
              />

              <div>
                <label className="block font-bold text-[#2C3E50] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#4D583F] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#4F534C]/15 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-[#2C3E50] font-bold"
                >
                  Cancel
                </button>
                <button
                  disabled={uploadingImage}
                  className="px-5 py-2 rounded-xl bg-[#4D583F] text-white font-bold hover:bg-[#bf3a11] disabled:opacity-50"
                >
                  {uploadingImage ? 'Uploading...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Items View Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl border border-[#4F534C]/20 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#4D583F] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">Order Details: {selectedOrderModal.orderNumber}</h3>
              <button onClick={() => setSelectedOrderModal(null)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="space-y-1 text-[#61665D]">
                <div><strong className="text-[#2C3E50]">Customer:</strong> {selectedOrderModal.customerName}</div>
                <div><strong className="text-[#2C3E50]">Phone:</strong> {selectedOrderModal.customerPhone}</div>
                <div><strong className="text-[#2C3E50]">Address:</strong> {selectedOrderModal.shippingAddress}</div>
              </div>

              <h4 className="font-bold text-sm text-[#2C3E50] pt-2 border-t border-[#4F534C]/15">Purchased Items:</h4>
              <div className="space-y-2">
                {selectedOrderModal.items?.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#E8EEE0] flex justify-between items-center border border-[#4F534C]/10">
                    <div>
                      <span className="font-bold block text-[#2C3E50]">{item.name}</span>
                      <span className="text-[11px] text-[#4D583F] font-semibold">{item.weight}</span>
                    </div>
                    <div className="font-bold text-[#2C3E50]">
                      ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#4F534C]/15 flex justify-between items-center font-bold text-sm">
                <span className="text-[#2C3E50]">Total Amount:</span>
                <span className="text-[#4D583F]">₹{selectedOrderModal.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
