'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import io from 'socket.io-client';
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
  Flame,
  Bell,
  Phone,
  PhoneCall,
  MessageCircle,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Printer,
  Download,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Truck,
  Filter,
  ArrowUpDown,
  Volume2,
  VolumeX,
  Navigation,
  FileText,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  Sparkles,
  Lock,
  AlertTriangle,
  Snowflake,
  Loader2
} from 'lucide-react';
import { ProductType, OrderType, UserType, CategoryType } from '@/lib/types';
import { fetchApi, getCachedData, setCachedData, invalidateCache } from '@/lib/apiConfig';
import { printCommercialBill } from '@/lib/printUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import ImageUploader from '@/components/ImageUploader';
import OptimizedImage from '@/components/OptimizedImage';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

function isRetailCategory(category: string) {
  return category.toUpperCase().includes('RETAIL PACK');
}

// Synthesized Audio Chime for Instant New Order Alerts (Zero external asset dependency)
function playNewOrderSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Tone 2: A5 (880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Autoplay restrictions handle silently
  }
}

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'categories' | 'orders' | 'logs' | 'users' | 'reviews'>('orders');

  // Data states
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-Refresh & Live Polling States
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // 0 (off), 15s, 30s, 60s
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const previousOrderCountRef = useRef<number | null>(null);

  // Orders Filter & UI States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Confirmed' | 'Awaiting Payment' | 'Payment Failed' | 'Cancelled'>('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<'All' | 'Paid' | 'Pending' | 'Failed' | 'Refunded'>('All');
  const [orderSort, setOrderSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderType | null>(null);

  // Business & Marketing Logs State
  const [logSubTab, setLogSubTab] = useState<'issues' | 'working'>('issues');
  const [logSearch, setLogSearch] = useState('');
  const [updatingFollowUpId, setUpdatingFollowUpId] = useState<string | null>(null);
  const [followUpNotesInput, setFollowUpNotesInput] = useState<{ [key: string]: string }>({});

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
    mrp: 900,
    price: 500,
    category: 'Mutton Alternatives',
    description: '',
    stock: 50,
    image: '',
    isPopular: false,
    variants: [] as { weight: string; price: number }[],
    broadcastStock: false,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'List',
  });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const [prodData, ordData, usrData, catData, revData] = await Promise.all([
        fetchApi('/products'),
        fetchApi('/orders'),
        fetchApi('/users'),
        fetchApi('/categories'),
        fetchApi('/reviews'),
      ]);

      if (prodData.success && Array.isArray(prodData.data)) {
        setProducts(prodData.data);
        setCachedData('admin_products', prodData.data);
      }
      if (ordData.success && Array.isArray(ordData.data)) {
        if (previousOrderCountRef.current !== null && ordData.data.length > previousOrderCountRef.current) {
          const diff = ordData.data.length - previousOrderCountRef.current;
          const latest = ordData.data[0];
          setNewOrderAlert(`${diff} New Order Received! (#${latest?.orderNumber || ''} by ${latest?.customerName || ''})`);
          if (soundEnabled) playNewOrderSound();
        }
        previousOrderCountRef.current = ordData.data.length;
        setOrders(ordData.data);
        setCachedData('admin_orders', ordData.data);
      }
      if (usrData.success && Array.isArray(usrData.data)) {
        setUsers(usrData.data);
        setCachedData('admin_users', usrData.data);
      }
      if (catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data);
        setCachedData('admin_categories', catData.data);
      }
      if (revData.success && Array.isArray(revData.data)) {
        setReviews(revData.data);
        setCachedData('admin_reviews', revData.data);
      }
      setLastSyncedTime(new Date());
    } catch (error) {
      console.error('Error loading admin dashboard data');
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Instant Cache Hydration for 0ms load
    const cachedProds = getCachedData<ProductType[]>('admin_products');
    const cachedOrds = getCachedData<OrderType[]>('admin_orders');
    const cachedUsrs = getCachedData<UserType[]>('admin_users');
    const cachedCats = getCachedData<CategoryType[]>('admin_categories');
    const cachedRevs = getCachedData<any[]>('admin_reviews');

    let hasCached = false;
    if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
      setProducts(cachedProds);
      hasCached = true;
    }
    if (cachedOrds && Array.isArray(cachedOrds) && cachedOrds.length > 0) {
      setOrders(cachedOrds);
      previousOrderCountRef.current = cachedOrds.length;
      hasCached = true;
    }
    if (cachedUsrs && Array.isArray(cachedUsrs) && cachedUsrs.length > 0) {
      setUsers(cachedUsrs);
      hasCached = true;
    }
    if (cachedCats && Array.isArray(cachedCats) && cachedCats.length > 0) {
      setCategories(cachedCats);
      hasCached = true;
    }
    if (cachedRevs && Array.isArray(cachedRevs) && cachedRevs.length > 0) {
      setReviews(cachedRevs);
      hasCached = true;
    }

    if (hasCached) {
      setLoading(false);
      fetchData(true); // silent background revalidation
    } else {
      fetchData(false); // first time cold loading with skeleton
    }
  }, []);

  // Live Auto-Refresh Polling Hook (fallback for standard sync)
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    const timer = setInterval(() => {
      fetchData(true);
    }, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [refreshInterval, soundEnabled]);

  // Real-time Socket.io Hook
  useEffect(() => {
    // Determine the correct backend URL for Socket.io
    const socketUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
      : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.tnmockmeat.com');
      
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Admin connected to real-time socket:', socket.id);
    });

    socket.on('newOrder', (order) => {
      setNewOrderAlert(`1 New Order Received! (#${order?.orderNumber || ''} by ${order?.customerName || ''})`);
      if (soundEnabled) playNewOrderSound();
      fetchData(true);
    });

    socket.on('orderUpdated', () => {
      fetchData(true);
    });

    socket.on('productUpdated', () => {
      fetchData(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [soundEnabled]);

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
          alert('Failed to upload image: ' + (uploadRes.error || uploadRes.message || 'Authentication error. Please re-login.'));
          return;
        }
      }

      const finalFormData = { ...formData, image: finalImageUrl, weight: formData.weight || '1 KG' };

      if (editingProduct) {
        // Optimistic UI for edit
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...finalFormData } as ProductType : p));
        setEditingProduct(null);

        const data = await fetchApi(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(finalFormData),
        });
        if (data.success) {
          fetchData(true);
        } else {
          alert(data.error);
        }
      } else {
        setIsAddModalOpen(false);

        const data = await fetchApi('/products', {
          method: 'POST',
          body: JSON.stringify(finalFormData),
        });
        if (data.success) {
          fetchData(true);
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
    
    // Optimistic Delete
    setProducts(prev => prev.filter(p => p.id !== id));
    
    try {
      const data = await fetchApi(`/products/${id}`, { method: 'DELETE' });
      if (data.success) {
        fetchData(true);
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
          alert('Failed to upload image: ' + (uploadRes.error || uploadRes.message || 'Authentication error. Please re-login.'));
          return;
        }
      }

      const finalData = { ...categoryFormData, image: finalImageUrl };

      if (editingCategory) {
        // Optimistic Update
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...finalData } as CategoryType : c));
        setEditingCategory(null);
        
        const data = await fetchApi(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(finalData),
        });
        if (data.success) {
          fetchData(true);
        } else alert(data.error);
      } else {
        setIsCategoryModalOpen(false);
        const data = await fetchApi('/categories', {
          method: 'POST',
          body: JSON.stringify(finalData),
        });
        if (data.success) {
          fetchData(true);
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
    
    // Optimistic Delete
    setCategories(prev => prev.filter(c => c.id !== id));
    
    try {
      const data = await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      if (data.success) {
        fetchData(true);
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

  const handleRefundOrder = async (orderId: string) => {
    if (!confirm('Issue a full refund for this Razorpay order?')) return;
    const data = await fetchApi(`/orders/${orderId}/refund`, { method: 'POST' });
    if (data.success) fetchData();
    else alert(data.error || 'Refund failed');
  };

  const openEditModal = (prod: ProductType) => {
    setEditingProduct(prod);
    setFormData({
      code: prod.code,
      name: prod.name,
      weight: prod.weight,
      mrp: prod.mrp ?? prod.price,
      price: prod.price,
      category: prod.category,
      description: prod.description,
      stock: prod.stock,
      image: prod.image,
      isPopular: !!prod.isPopular,
      variants: prod.variants || [],
      broadcastStock: false,
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
      mrp: 900,
      price: 600,
      category: categories[0]?.name || 'Mutton Alternatives',
      description: '',
      stock: 50,
      image: '',
      isPopular: false,
      variants: [],
      broadcastStock: false,
    });
    setImageType('url');
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const openEditCategoryModal = (cat: CategoryType) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || 'List',
    });
    setImageType('url');
    setImageFile(null);
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      image: '',
      icon: 'List',
    });
    setImageType('url');
    setImageFile(null);
    setIsCategoryModalOpen(true);
  };

  // Helper functions for Orders
  const getGoogleMapsUrl = (address: string, landmark?: string | null, city?: string | null, state?: string | null, pincode?: string | null) => {
    const query = [address, landmark, city, state, pincode].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || address || 'India')}`;
  };

  const getWhatsAppUrl = (ord: OrderType) => {
    const rawPhone = ord.customerPhone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${ord.customerName}! 🌿\n\nThis is regarding your Sakthi Frozen Plant-Based Meat Order #${ord.orderNumber}.\n\n📦 Order Status: ${ord.status}\n💰 Total Amount: ₹${ord.totalAmount}\n📍 Delivery Address: ${ord.shippingAddress}\n\nThank you for choosing Sakthi Frozen Foods! For queries, reply directly to this chat.`
    );
    return `https://wa.me/${phoneWithCountry}?text=${msg}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Email', 'Address', 'Items Count', 'Total Amount', 'Payment Method', 'Payment Status', 'Order Status'];
    const rows = filteredOrders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail}"`,
      `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
      o.items?.length || 0,
      o.totalAmount,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus || 'Pending'}"`,
      `"${o.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sakthi_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  // Check if an order is Failed, Cancelled, or Expired (>30 mins unpaid)
  const isOrderFailedOrExpired = (ord: OrderType) => {
    if (ord.paymentStatus === 'Failed' || ord.status === 'Cancelled') return true;
    if (ord.isLocked) return true;
    if (ord.paymentMethod === 'Razorpay (Online)' && ord.paymentStatus === 'Pending') {
      const createdTime = new Date(ord.createdAt).getTime();
      return Date.now() > createdTime + 30 * 60 * 1000;
    }
    return false;
  };

  // Check if an order has pending online payment (awaiting customer payment within 30 mins)
  const isOnlinePaymentPending = (ord: OrderType) => {
    if (isOrderFailedOrExpired(ord)) return false;
    const isOnline = ord.paymentMethod === 'Razorpay (Online)' || !ord.paymentMethod || ord.paymentMethod.toLowerCase().includes('online') || ord.paymentMethod.toLowerCase().includes('razorpay');
    return isOnline && ord.paymentStatus === 'Pending';
  };

  // Marketing & Sales Recovery WhatsApp Pitch Generator
  const getMarketingRecoveryWhatsAppUrl = (ord: OrderType) => {
    const rawPhone = ord.customerPhone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const itemsList = ord.items?.map(i => `${i.name} (${i.weight}) ×${i.quantity}`).join(', ') || 'delicious plant-based food';
    const msg = encodeURIComponent(
      `Hello ${ord.customerName}! 🌿 This is Sakthi Frozen Foods.\n\nWe noticed your recent online order #${ord.orderNumber} for ₹${ord.totalAmount} (${itemsList}) was interrupted before completing payment.\n\n✨ Good news: We have saved your cart and kept your fresh items on hold for you!\n\nWould you like us to assist you with completing the order or send you a direct payment link?\n\nReply directly to this WhatsApp message and our team will be delighted to help you! 😊`
    );
    return `https://wa.me/${phoneWithCountry}?text=${msg}`;
  };

  // Follow-Up Status Update Handler
  const handleUpdateFollowUp = async (orderId: string, status: string, notes?: string) => {
    setUpdatingFollowUpId(orderId);
    try {
      const res = await fetchApi(`/orders/${orderId}/follow-up`, {
        method: 'PUT',
        body: JSON.stringify({
          followUpStatus: status,
          ...(notes !== undefined ? { followUpNotes: notes } : {}),
        }),
      });
      if (res.success) {
        fetchData(true);
      }
    } catch (err) {
      console.error('Error updating follow up status:', err);
    } finally {
      setUpdatingFollowUpId(null);
    }
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const confirmedOrdersCount = orders.filter(o => o.status === 'Confirmed' || o.paymentStatus === 'Paid').length;
  const awaitingPaymentOrdersCount = orders.filter(o => !isOrderFailedOrExpired(o) && (o.status === 'Awaiting Payment' || o.status === 'Pending') && o.paymentStatus === 'Pending').length;
  const failedOrCancelledOrdersCount = orders.filter(o => isOrderFailedOrExpired(o) || o.status === 'Payment Failed' || o.status === 'Cancelled').length;

  // Business & Marketing Log Lists
  const issueOrders = orders.filter((o) => isOrderFailedOrExpired(o));
  const workingOrders = orders.filter((o) => !isOrderFailedOrExpired(o));
  const totalLostRevenue = issueOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalWorkingRevenue = workingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredLogOrders = (logSubTab === 'issues' ? issueOrders : workingOrders).filter((o) => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.toLowerCase().includes(q) ||
      o.shippingAddress?.toLowerCase().includes(q) ||
      o.items?.some(i => i.name.toLowerCase().includes(q))
    );
  });

  const filteredOrders = orders.filter((o) => {
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchName = o.customerName?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.toLowerCase().includes(q);
      const matchEmail = o.customerEmail?.toLowerCase().includes(q);
      const matchAddr = o.shippingAddress?.toLowerCase().includes(q);
      const matchItems = o.items?.some(i => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchName && !matchPhone && !matchEmail && !matchAddr && !matchItems) return false;
    }
    if (orderStatusFilter !== 'All') {
      if (orderStatusFilter === 'Confirmed') {
        const isConfirmed = o.status === 'Confirmed' || o.paymentStatus === 'Paid';
        if (!isConfirmed || isOrderFailedOrExpired(o)) return false;
      } else if (orderStatusFilter === 'Awaiting Payment') {
        const isAwaiting = !isOrderFailedOrExpired(o) && (o.status === 'Awaiting Payment' || o.status === 'Pending') && o.paymentStatus === 'Pending';
        if (!isAwaiting) return false;
      } else if (orderStatusFilter === 'Payment Failed') {
        const isFailed = isOrderFailedOrExpired(o) || o.status === 'Payment Failed';
        if (!isFailed) return false;
      } else if (orderStatusFilter === 'Cancelled') {
        if (o.status !== 'Cancelled') return false;
      }
    }
    if (orderPaymentFilter !== 'All') {
      const pStatus = o.paymentStatus || 'Pending';
      if (pStatus !== orderPaymentFilter) return false;
    }
    return true;
  }).sort((a, b) => {
    if (orderSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (orderSort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (orderSort === 'highest') return b.totalAmount - a.totalAmount;
    if (orderSort === 'lowest') return a.totalAmount - b.totalAmount;
    return 0;
  });

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
    { name: 'Confirmed', value: orders.filter(o => o.status === 'Confirmed' || o.paymentStatus === 'Paid').reduce((acc, o) => acc + o.totalAmount, 0) },
    { name: 'Awaiting Payment', value: orders.filter(o => !isOrderFailedOrExpired(o) && (o.status === 'Awaiting Payment' || o.status === 'Pending') && o.paymentStatus === 'Pending').reduce((acc, o) => acc + o.totalAmount, 0) },
    { name: 'Failed / Cancelled', value: orders.filter(o => isOrderFailedOrExpired(o) || o.status === 'Payment Failed' || o.status === 'Cancelled').reduce((acc, o) => acc + o.totalAmount, 0) }
  ];

  return (
    <div className="min-h-screen bg-[#E8EEE0] text-[#1E201D] font-sans">
      {/* Real-time Order Alert Banner */}
      {newOrderAlert && (
        <div className="bg-[#656B4F] text-white px-4 py-2.5 shadow-lg flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-pulse z-40 sticky top-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="truncate">{newOrderAlert}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('orders');
                setNewOrderAlert(null);
              }}
              className="px-3 py-1 bg-white text-[#1E201D] rounded-lg font-black text-xs hover:bg-[#EAF0E5] transition-colors shadow-xs"
            >
              View Order
            </button>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="p-1 rounded-md hover:bg-white/20 text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Clipboard Copy Toast */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E201D] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-white/20 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#A9B896] shrink-0" />
          <span>Copied {copiedText} to clipboard!</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-[#1E201D] text-white sticky top-0 z-30 shadow-md">
        <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between gap-2 px-3 py-2 sm:min-h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#656B4F] text-white shadow-md sm:h-10 sm:w-10 sm:rounded-xl">
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-xs font-extrabold leading-none tracking-tight sm:text-lg font-poppins">
                SAKTHI FROZEN ADMIN PORTAL
              </span>
              <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-widest text-[#A7ADA9] sm:block">
                Live E-Commerce Control Center
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {/* Live Polling Interval Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-white/10">
              <span className={`w-2 h-2 rounded-full ${refreshInterval > 0 ? 'bg-[#8E9D64] animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-gray-300 mr-1">Auto-Sync:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value={15} className="bg-[#1E201D] text-white">15s</option>
                <option value={30} className="bg-[#1E201D] text-white">30s (Default)</option>
                <option value={60} className="bg-[#1E201D] text-white">60s</option>
                <option value={0} className="bg-[#1E201D] text-white">Off</option>
              </select>
            </div>

            {/* Sound Alert Toggle Button */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playNewOrderSound();
              }}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                soundEnabled ? 'bg-[#656B4F]/40 text-[#CDDBC6] border border-[#656B4F]/50' : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
              title={soundEnabled ? 'Order Sound Alert: ON' : 'Order Sound Alert: MUTED'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchData(false)}
              disabled={isRefreshing}
              className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20 disabled:opacity-50"
              title="Refresh Data Now"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#A9B896]' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <Link
              href="/"
              className="flex min-h-9 items-center gap-1 rounded-lg bg-[#656B4F] px-2.5 py-2 text-[10px] font-bold text-white shadow transition-all hover:bg-[#50563D] sm:gap-2 sm:rounded-xl sm:px-4 sm:text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
              <span className="sm:hidden">Store</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="mx-auto grid w-full max-w-[1600px] gap-5 px-3 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-7 lg:px-8">
        <aside className="rounded-2xl border border-[#4F534C]/15 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:h-fit">
          <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#61665D]">Workspace</p>
          <nav className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide lg:flex-col lg:overflow-visible lg:pb-0">
            {[
              ['analytics', 'Analytics', BarChart2, null],
              ['products', 'Products', Package, products.length],
              ['categories', 'Categories', List, categories.length],
              ['orders', 'Orders', ShoppingBag, orders.length],
              ['logs', 'Business Logs', AlertCircle, issueOrders.length],
              ['users', 'Users', Users, users.length],
              ['reviews', 'Reviews', Star, reviews.length],
            ].map(([id, label, Icon, count]) => {
              const isActive = activeTab === id;
              const NavIcon = Icon as React.ElementType;
              return (
                <button
                  key={id as string}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition-colors lg:w-full lg:px-3 ${
                    isActive ? 'bg-[#656B4F] text-white shadow-sm' : 'text-[#52574E] hover:bg-[#EAF0E5] hover:text-[#1E201D]'
                  }`}
                >
                  <NavIcon className={`h-4 w-4 shrink-0 ${id === 'reviews' && !isActive ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span className="whitespace-nowrap">{String(label)}</span>
                  {count !== null && (
                    loading ? (
                      <Loader2 className={`ml-auto w-4 h-4 shrink-0 animate-spin ${isActive ? 'text-white' : 'text-[#656B4F]'}`} />
                    ) : (
                      <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/20' : 'bg-[#EAF0E5] text-[#656B4F]'}`}>{count as number}</span>
                    )
                  )}
                </button>
              );
            })}
          </nav>
          <Link href="/admin/notifications" className="mt-3 flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#52574E] hover:bg-[#EAF0E5] hover:text-[#1E201D]">
            <Bell className="h-4 w-4" />
            Notifications
          </Link>
        </aside>

        <div className="min-w-0 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          <div className="flex items-center gap-3 rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm sm:p-5">
            <div className="w-12 h-12 rounded-xl bg-[#656B4F] text-white flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#61665D] block font-medium">Total Revenue</span>
              {loading ? (
                <div className="h-7 w-28 bg-[#E8EEE0] rounded-lg animate-pulse mt-1" />
              ) : (
                <span className="text-2xl font-black text-[#1E201D]">₹{totalRevenue.toLocaleString()}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm sm:p-5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#61665D] block font-medium">Total Orders</span>
              {loading ? (
                <div className="h-7 w-16 bg-[#E8EEE0] rounded-lg animate-pulse mt-1" />
              ) : (
                <span className="text-2xl font-black text-[#1E201D]">{orders.length}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm sm:p-5">
            <div className="w-12 h-12 rounded-xl bg-[#656B4F] text-white flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#61665D] block font-medium">Active Products</span>
              {loading ? (
                <div className="h-7 w-16 bg-[#E8EEE0] rounded-lg animate-pulse mt-1" />
              ) : (
                <span className="text-2xl font-black text-[#1E201D]">{products.length}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm sm:p-5">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#61665D] block font-medium">Registered Users</span>
              {loading ? (
                <div className="h-7 w-16 bg-[#E8EEE0] rounded-lg animate-pulse mt-1" />
              ) : (
                <span className="text-2xl font-black text-[#1E201D]">{users.length}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="hidden">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-5 font-extrabold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-[#656B4F] text-[#656B4F]'
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
                ? 'border-[#656B4F] text-[#656B4F]'
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
                ? 'border-[#656B4F] text-[#656B4F]'
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
                ? 'border-[#656B4F] text-[#656B4F]'
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
                ? 'border-[#656B4F] text-[#656B4F]'
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
                ? 'border-[#656B4F] text-[#656B4F]'
                : 'border-transparent text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Google Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* TAB 0: ANALYTICS */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            orders={orders} 
            products={products} 
            users={users} 
            categories={categories} 
            loading={loading} 
          />
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                />
                <Search className="w-4 h-4 text-[#61665D] absolute left-3.5 top-3" />
              </div>

              <button
                onClick={openAddModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#656B4F] text-white font-bold text-xs hover:bg-[#50563D] transition-all flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#4F534C]/15 bg-white shadow-sm xl:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#656B4F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                    <tr>
                      <th className="py-3.5 px-4">Code</th>
                      <th className="py-3.5 px-4">Product Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Weight</th>
                      <th className="py-3.5 px-4">MRP (₹)</th>
                      <th className="py-3.5 px-4">Selling Price (₹)</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Homepage Best Seller</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4F534C]/10">
                    {loading ? (
                      [1, 2, 3, 4, 5, 6].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-14" /></td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#E8EEE0] shrink-0" />
                              <div className="space-y-1.5 flex-1">
                                <div className="h-4 bg-[#E8EEE0] rounded w-36" />
                                <div className="h-3 bg-[#E8EEE0] rounded w-48" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-24" /></td>
                          <td className="py-3.5 px-4"><div className="h-5 bg-[#E8EEE0] rounded w-14" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-14" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-16" /></td>
                          <td className="py-3.5 px-4"><div className="h-5 bg-[#E8EEE0] rounded w-16" /></td>
                          <td className="py-3.5 px-4"><div className="h-7 bg-[#E8EEE0] rounded-xl w-24" /></td>
                          <td className="py-3.5 px-4 text-right"><div className="h-7 bg-[#E8EEE0] rounded-lg w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#61665D]">
                          <Package className="w-10 h-10 mx-auto text-[#656B4F]/40 mb-2" />
                          <p className="font-bold text-sm text-[#1E201D]">No products found</p>
                          <p className="text-xs text-[#61665D] mt-0.5">Try changing your search term.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p, index) => (
                        <React.Fragment key={p.id}>
                          {(index === 0 || filteredProducts[index - 1].category !== p.category) && (
                            <tr className="bg-[#F3FBEE]">
                              <td colSpan={9} className="px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#656B4F]">
                                      {isRetailCategory(p.category) ? 'Retail Packs' : 'Regular Packs'}
                                    </p>
                                    <h3 className="mt-0.5 text-sm font-black text-[#2F2F2F]">{p.category}</h3>
                                  </div>
                                  <span className="text-[11px] font-bold text-[#61665D]">Category section</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        <tr className="hover:bg-[#EAF0E5]/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#656B4F]">#{p.code}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <OptimizedImage
                                src={p.image}
                                alt={p.name}
                                width={96}
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
                              <span className="bg-[#EAF0E5] text-[#656B4F] font-bold px-2 py-0.5 rounded text-[11px]" title="Base Weight">
                                {p.weight}
                              </span>
                              {p.variants?.map((v, idx) => (
                                <span key={idx} className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]" title="Custom Option">
                                  {v.weight}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-[#61665D] line-through">
                            ₹{p.mrp ?? p.price}
                          </td>
                          <td className="py-3 px-4 font-black text-sm text-[#656B4F]">
                            ₹{p.price}
                            {p.variants && p.variants.length > 0 && (
                              <span className="block text-[10px] text-[#61665D] font-normal">
                                + {p.variants.map((v) => `₹${v.price}`).join(', ')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={async () => {
                                const nextStock = p.stock > 0 ? 0 : 50;
                                await fetchApi(`/products/${p.id}`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ stock: nextStock }),
                                });
                                fetchData(true);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                                p.stock > 0
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                              }`}
                              title="Click to toggle Stock ON / OFF"
                            >
                              <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
                              <span>{p.stock > 0 ? 'In Stock (Live)' : 'No Stock (Off)'}</span>
                            </button>
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
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-3 xl:hidden">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <article key={n} className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm animate-pulse space-y-3">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-xl bg-[#E8EEE0] shrink-0" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 bg-[#E8EEE0] rounded w-24" />
                        <div className="h-4 bg-[#E8EEE0] rounded w-40" />
                        <div className="h-3 bg-[#E8EEE0] rounded w-32" />
                      </div>
                    </div>
                    <div className="border-t border-[#4F534C]/10 pt-3 flex gap-2">
                      <div className="h-5 bg-[#E8EEE0] rounded w-16" />
                      <div className="h-5 bg-[#E8EEE0] rounded w-20" />
                    </div>
                  </article>
                ))
              ) : (
                filteredProducts.map((p, index) => (
                  <React.Fragment key={p.id}>
                    {(index === 0 || filteredProducts[index - 1].category !== p.category) && (
                      <div className="border-b border-[#4F534C]/15 pb-3 pt-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#656B4F]">
                          {isRetailCategory(p.category) ? 'Retail Packs' : 'Regular Packs'}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-[#2F2F2F]">{p.category}</h3>
                      </div>
                    )}
                  <article className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm">
                    <div className="flex gap-3">
                      <OptimizedImage src={p.image} alt={p.name} width={160} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#656B4F]">#{p.code} · {p.category}</p>
                        <h3 className="truncate text-sm font-black text-[#1E201D]">{p.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-[#61665D]">{p.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#4F534C]/10 pt-3 text-xs">
                      <span className="rounded bg-[#EAF0E5] px-2 py-1 font-bold text-[#656B4F]">{p.weight}</span>
                      <span className="text-[#61665D] line-through">MRP ₹{p.mrp ?? p.price}</span>
                      <span className="font-black text-[#656B4F]">₹{p.price}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const nextStock = p.stock > 0 ? 0 : 50;
                          await fetchApi(`/products/${p.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ stock: nextStock }),
                          });
                          fetchData(true);
                        }}
                        className={`rounded-lg px-2.5 py-1 font-black text-[11px] flex items-center gap-1 cursor-pointer ${
                          p.stock > 0 ? 'bg-emerald-600 text-white' : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.stock > 0 ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
                        <span>{p.stock > 0 ? 'In Stock (Live)' : 'No Stock'}</span>
                      </button>
                      <div className="ml-auto flex items-center gap-1">
                        <button onClick={() => openEditModal(p)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" aria-label={`Edit ${p.name}`}><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteProduct(p.id, p.name)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                  </React.Fragment>
                ))
              )}
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#656B4F] text-white font-bold text-xs hover:bg-[#50563D] transition-all flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
            
            <div className="hidden overflow-hidden rounded-2xl border border-[#4F534C]/15 bg-white shadow-sm xl:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#656B4F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                    <tr>
                      <th className="py-3.5 px-4">Category Name</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4F534C]/10">
                    {loading ? (
                      [1, 2, 3, 4].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#E8EEE0] shrink-0" />
                              <div className="h-4 bg-[#E8EEE0] rounded w-32" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4"><div className="h-3.5 bg-[#E8EEE0] rounded w-48" /></td>
                          <td className="py-3.5 px-4 text-right"><div className="h-7 bg-[#E8EEE0] rounded-lg w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-[#61665D]">
                          <List className="w-10 h-10 mx-auto text-[#656B4F]/40 mb-2" />
                          <p className="font-bold text-sm text-[#1E201D]">No categories found</p>
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-[#EAF0E5]/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <OptimizedImage
                                src={cat.image}
                                alt={cat.name}
                                width={96}
                                className="w-10 h-10 rounded-lg object-cover border border-[#4F534C]/15 shrink-0"
                              />
                              <span className="font-bold block text-sm">{cat.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#61665D] line-clamp-2">{cat.description}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {cat.id.startsWith('product-') ? <span className="text-[10px] font-semibold text-[#68705C]">From products</span> : <>
                                <button onClick={() => openEditCategoryModal(cat)} className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </>}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-3 xl:hidden">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <article key={n} className="flex items-center gap-3 rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm animate-pulse">
                    <div className="h-14 w-14 rounded-xl bg-[#E8EEE0] shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 bg-[#E8EEE0] rounded w-28" />
                      <div className="h-3 bg-[#E8EEE0] rounded w-40" />
                    </div>
                  </article>
                ))
              ) : (
                categories.map((cat) => (
                  <article key={cat.id} className="flex items-center gap-3 rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm">
                    <OptimizedImage src={cat.image} alt={cat.name} width={112} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black">{cat.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[#61665D]">{cat.description}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {cat.id.startsWith('product-') ? <span className="self-center text-[10px] font-semibold text-[#68705C]">From products</span> : <>
                        <button onClick={() => openEditCategoryModal(cat)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" aria-label={`Edit ${cat.name}`}><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${cat.name}`}><Trash2 className="h-4 w-4" /></button>
                      </>}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADVANCED ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* Real-time Order Health KPI Bar */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#4F534C]/15 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#61665D] block tracking-wider">All Orders</span>
                {loading ? (
                  <div className="h-7 w-24 bg-[#E8EEE0] rounded-lg animate-pulse mt-1" />
                ) : (
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-black text-[#1E201D]">{orders.length}</span>
                    <span className="text-[11px] font-bold text-[#656B4F]">₹{totalRevenue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EAF0E5]/70 border border-[#656B4F]/30 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#50563D] block tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#656B4F]" /> Confirmed
                </span>
                {loading ? (
                  <div className="h-7 w-20 bg-[#D8E4D1] rounded-lg animate-pulse mt-1" />
                ) : (
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-black text-[#2D3823]">{confirmedOrdersCount}</span>
                    <span className="text-[10px] font-bold text-[#656B4F]">Paid / Confirmed</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-pulse text-amber-600" /> Awaiting Payment
                </span>
                {loading ? (
                  <div className="h-7 w-20 bg-amber-100 rounded-lg animate-pulse mt-1" />
                ) : (
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-black text-amber-900">{awaitingPaymentOrdersCount}</span>
                    <span className="text-[10px] font-bold text-amber-700">30m Grace Period</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-600 block tracking-wider flex items-center gap-1">
                  <X className="w-3 h-3 text-red-500" /> Failed / Cancelled
                </span>
                {loading ? (
                  <div className="h-7 w-20 bg-gray-200 rounded-lg animate-pulse mt-1" />
                ) : (
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-black text-gray-700">{failedOrCancelledOrdersCount}</span>
                    <span className="text-[10px] font-bold text-gray-500">Expired / Void</span>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Search, Filter & Quick Export Toolbar */}
            <div className="rounded-2xl border border-[#4F534C]/15 bg-white p-3.5 sm:p-4 shadow-sm space-y-3.5">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#61665D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Order #, Customer Name, Phone, Address, Dish name..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#E8EEE0]/60 border border-[#4F534C]/20 text-xs text-[#1E201D] font-medium placeholder:text-[#61665D]/70 focus:outline-none focus:ring-2 focus:ring-[#656B4F] focus:bg-white transition-all"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 text-gray-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter selects & Export */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Payment Filter */}
                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#E8EEE0]/60 border border-[#4F534C]/20 text-xs font-bold text-[#1E201D] outline-none focus:ring-2 focus:ring-[#656B4F]"
                  >
                    <option value="All">All Payments</option>
                    <option value="Paid">Paid Only</option>
                    <option value="Pending">Pending / COD</option>
                    <option value="Failed">Failed</option>
                  </select>

                  {/* Sort Order */}
                  <select
                    value={orderSort}
                    onChange={(e) => setOrderSort(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#E8EEE0]/60 border border-[#4F534C]/20 text-xs font-bold text-[#1E201D] outline-none focus:ring-2 focus:ring-[#656B4F]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest ₹ Amount</option>
                    <option value="lowest">Lowest ₹ Amount</option>
                  </select>

                  {/* Export CSV Button */}
                  <button
                    onClick={exportOrdersToCSV}
                    disabled={filteredOrders.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EAF0E5] border border-[#4F534C]/20 text-xs font-bold text-[#1E201D] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    title="Export Filtered Orders to Excel/CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-[#656B4F]" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tab Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  { id: 'All', label: 'All Orders', count: orders.length },
                  { id: 'Confirmed', label: 'Confirmed', count: confirmedOrdersCount, color: 'olive' },
                  { id: 'Awaiting Payment', label: 'Awaiting Payment', count: awaitingPaymentOrdersCount, color: 'amber' },
                  { id: 'Payment Failed', label: 'Payment Failed / Cancelled', count: failedOrCancelledOrdersCount, color: 'gray' },
                ].map((tab) => {
                  const isActive = orderStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#656B4F] text-white shadow-xs'
                          : 'bg-[#E8EEE0]/60 text-[#52574E] hover:bg-[#E8EEE0] hover:text-[#1E201D]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#656B4F]/10 text-[#656B4F]'
                      }`}>
                        {loading ? (
                          <span className="inline-block w-3.5 h-2.5 rounded-full bg-black/10 animate-pulse" />
                        ) : (
                          tab.count
                        )}
                      </span>
                    </button>
                  );
                })}

                <span className="text-[11px] font-semibold text-[#61665D] ml-auto hidden md:inline shrink-0 pl-2">
                  {loading ? 'Syncing orders...' : `Showing ${filteredOrders.length} of ${orders.length} orders`}
                </span>
              </div>
            </div>

            {/* Desktop Table View (xl screens) */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#4F534C]/15 bg-white shadow-sm xl:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#656B4F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
                    <tr>
                      <th className="py-3.5 px-4">Order ID & Date</th>
                      <th className="py-3.5 px-4">Customer & Contact</th>
                      <th className="py-3.5 px-4">Shipping Address</th>
                      <th className="py-3.5 px-4">Items Summary</th>
                      <th className="py-3.5 px-4">Payment & Total</th>
                      <th className="py-3.5 px-4">Order Status</th>
                      <th className="py-3.5 px-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4F534C]/10">
                    {loading ? (
                      [1, 2, 3, 4, 5, 6].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-4 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-24 mb-1.5" /><div className="h-3 bg-[#E8EEE0] rounded w-32" /></td>
                          <td className="py-4 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-28 mb-1.5" /><div className="h-3 bg-[#E8EEE0] rounded w-36" /></td>
                          <td className="py-4 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-48 mb-1.5" /><div className="h-3 bg-[#E8EEE0] rounded w-32" /></td>
                          <td className="py-4 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-40 mb-1.5" /><div className="h-3 bg-[#E8EEE0] rounded w-20" /></td>
                          <td className="py-4 px-4"><div className="h-5 bg-[#E8EEE0] rounded w-20 mb-1" /><div className="h-3 bg-[#E8EEE0] rounded w-16" /></td>
                          <td className="py-4 px-4"><div className="h-6 bg-[#E8EEE0] rounded-full w-24" /></td>
                          <td className="py-4 px-4 text-right"><div className="h-8 bg-[#E8EEE0] rounded-xl w-20 ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                          <p className="font-bold text-sm text-[#1E201D]">No orders match your filter criteria</p>
                          <p className="text-xs text-[#61665D] mt-0.5">Try changing your search term or status filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#EAF0E5]/30 transition-colors">
                          {/* Order ID & Time */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-black text-sm text-[#656B4F]">{ord.orderNumber}</div>
                            <div className="text-[11px] text-[#61665D] mt-0.5">{formatOrderDate(ord.createdAt)}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#E8EEE0] text-[#656B4F] text-[10px] font-bold">
                              {getTimeAgo(ord.createdAt)}
                            </span>
                          </td>

                          {/* Customer & Direct Action Buttons (Call, WhatsApp, Copy) */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-sm text-[#1E201D] flex items-center gap-1.5">
                              <span>{ord.customerName}</span>
                            </div>
                            <div className="text-[11px] text-[#61665D] break-words leading-tight">{ord.customerEmail}</div>
                            
                            {/* Contact Action Chips */}
                            <div className="flex items-center gap-1.5 mt-2">
                              {/* Direct Phone Call */}
                              <a
                                href={`tel:${ord.customerPhone}`}
                                className="px-2 py-1 rounded-lg bg-[#EAF0E5] hover:bg-[#DEE8D8] text-[#50563D] border border-[#656B4F]/20 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                title={`Call ${ord.customerPhone}`}
                              >
                                <Phone className="w-3 h-3 text-[#656B4F]" />
                                <span>{ord.customerPhone}</span>
                              </a>

                              {/* WhatsApp Chat with Pre-filled Template */}
                              <a
                                href={getWhatsAppUrl(ord)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-[#656B4F] hover:bg-[#50563D] text-white transition-colors shadow-2xs"
                                title="Send WhatsApp Update to Customer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* Copy Phone Number */}
                              <button
                                onClick={() => copyToClipboard(ord.customerPhone, 'Phone')}
                                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                title="Copy Phone Number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Shipping Address with Direct Google Maps Directions */}
                          <td className="py-3.5 px-4 align-top max-w-xs">
                            <div className="text-[11px] text-[#1E201D] font-medium line-clamp-2 leading-relaxed">
                              {ord.shippingAddress}
                            </div>
                            {ord.landmark && (
                              <div className="text-[10px] text-[#61665D] mt-0.5 font-semibold">
                                Landmark: {ord.landmark}
                              </div>
                            )}

                            {/* Google Maps Link & Copy Address Buttons */}
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={getGoogleMapsUrl(ord.shippingAddress, ord.landmark, ord.city, ord.state, ord.pincode)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Open in Google Maps for Navigation"
                              >
                                <MapPin className="w-3 h-3 text-rose-600" />
                                <span>Directions</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>

                              <button
                                onClick={() => copyToClipboard(ord.shippingAddress, 'Address')}
                                className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center gap-1 transition-colors"
                                title="Copy Address for Delivery Courier App"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                          </td>

                          {/* Items Ordered Breakdown */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1">
                              {ord.items?.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="text-[11px] flex items-start justify-between gap-2">
                                  <span className="font-bold text-[#1E201D] leading-tight flex-1 break-words">{item.name}</span>
                                  <span className="text-[#61665D] font-semibold shrink-0">({item.weight}) ×{item.quantity}</span>
                                </div>
                              ))}
                              {(ord.items?.length || 0) > 2 && (
                                <div className="text-[10px] font-bold text-[#656B4F]">
                                  +{(ord.items?.length || 0) - 2} more item(s)
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Total Amount & Payment Details */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-black text-base text-[#656B4F]">₹{ord.totalAmount}</div>
                            <div className="mt-1 flex flex-col items-start gap-1">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                                ord.paymentStatus === 'Paid' ? 'bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20' :
                                ord.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {ord.paymentStatus || 'Pending'}
                              </span>
                              <span className="text-[10px] text-[#61665D] font-medium">
                                {ord.paymentMethod || 'Online'}
                              </span>
                              {ord.razorpayPaymentId && (
                                <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono">
                                  <span>{ord.razorpayPaymentId.slice(0, 10)}...</span>
                                  <button onClick={() => copyToClipboard(ord.razorpayPaymentId!, 'Transaction ID')} title="Copy Payment ID">
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Order Status & Direct State Control */}
                          <td className="py-3.5 px-4 align-top w-52">
                            {isOrderFailedOrExpired(ord) ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 font-black text-xs shadow-2xs">
                                  <Lock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                  <span>{ord.status === 'Cancelled' ? 'Cancelled' : 'Payment Failed'}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-medium block text-center">
                                  Permanently Locked
                                </span>
                              </div>
                            ) : isOnlinePaymentPending(ord) ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-black text-xs shadow-2xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                                  <span>Awaiting Payment</span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-amber-100/70 border border-amber-200 text-[10px] text-amber-900 font-semibold text-center leading-tight">
                                  ⏳ Customer has 30 mins to pay online.
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EAF0E5] border border-[#656B4F]/40 text-[#2D3823] font-black text-xs shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#656B4F] shrink-0" />
                                  <span>Order Confirmed</span>
                                </div>
                                <select
                                  value={ord.status === 'Cancelled' ? 'Cancelled' : 'Confirmed'}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                  className="w-full px-2 py-1 rounded-lg border border-[#4F534C]/20 bg-white font-bold text-[10px] text-[#50563D] outline-none cursor-pointer focus:ring-1 focus:ring-[#656B4F]"
                                >
                                  <option value="Confirmed">Status: Confirmed</option>
                                  <option value="Cancelled">Cancel Order</option>
                                </select>
                              </div>
                            )}
                          </td>

                          {/* Quick Actions (View, Invoice, Refund) */}
                          <td className="py-3.5 px-4 align-top text-right space-y-1.5">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details Button */}
                              <button
                                onClick={() => setSelectedOrderModal(ord)}
                                className="px-2.5 py-1.5 bg-[#EAF0E5] text-[#656B4F] hover:bg-[#656B4F] hover:text-white rounded-xl font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                                title="View Full Order Breakdown"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </button>

                              {/* Print Invoice Button */}
                              <button
                                onClick={() => setInvoiceOrder(ord)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all shadow-2xs"
                                title="Print Packing Slip / Bill"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Refund Trigger if Eligible */}
                            {ord.paymentStatus === 'Paid' && ord.paymentMethod === 'Razorpay (Online)' && (
                              <div>
                                <button
                                  onClick={() => handleRefundOrder(ord.id)}
                                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                >
                                  Issue Refund
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile-Friendly Card View (< xl screens) */}
            <div className="grid gap-3.5 xl:hidden">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <article key={n} className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 sm:p-5 shadow-sm space-y-3.5 animate-pulse">
                    <div className="flex items-start justify-between gap-3 border-b border-[#4F534C]/10 pb-3">
                      <div className="space-y-1.5">
                        <div className="h-4 bg-[#E8EEE0] rounded w-28" />
                        <div className="h-3 bg-[#E8EEE0] rounded w-36" />
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="h-5 bg-[#E8EEE0] rounded w-16 ml-auto" />
                        <div className="h-3 bg-[#E8EEE0] rounded w-20 ml-auto" />
                      </div>
                    </div>
                    <div className="h-14 bg-[#E8EEE0] rounded-xl" />
                    <div className="h-12 bg-[#E8EEE0] rounded-xl" />
                  </article>
                ))
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-[#4F534C]/15 bg-white p-8 text-center text-gray-500 shadow-sm">
                  <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-bold text-sm text-[#1E201D]">No orders match your filter criteria</p>
                  <p className="text-xs text-[#61665D] mt-0.5">Try resetting search or filters.</p>
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <article
                    key={ord.id}
                    className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 sm:p-5 shadow-sm space-y-3.5 transition-all"
                  >
                    {/* Top Row: Order Number, Relative Time & Amount */}
                    <div className="flex items-start justify-between gap-3 border-b border-[#4F534C]/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#656B4F]">{ord.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#E8EEE0] text-[#656B4F] text-[10px] font-bold">
                            {getTimeAgo(ord.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#61665D] mt-0.5">{formatOrderDate(ord.createdAt)}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-[#656B4F] block">₹{ord.totalAmount}</span>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider ${
                          ord.paymentStatus === 'Paid' ? 'bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20' :
                          ord.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.paymentStatus || 'Pending'} • {ord.paymentMethod || 'Online'}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info & Direct Call / WhatsApp Actions */}
                    <div className="bg-[#FBFDF2] p-3 rounded-xl border border-[#4F534C]/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-[#1E201D]">{ord.customerName}</h4>
                          <p className="text-[11px] text-[#61665D]">{ord.customerEmail}</p>
                        </div>
                      </div>

                      {/* Tap to Call & WhatsApp Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="min-h-11 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call {ord.customerPhone}</span>
                        </a>

                        <a
                          href={getWhatsAppUrl(ord)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-11 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Shipping Address & Google Maps Navigation */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Delivery Address</span>
                        <p className="text-xs text-[#1E201D] font-medium leading-relaxed mt-0.5">{ord.shippingAddress}</p>
                        {ord.landmark && (
                          <p className="text-[11px] text-gray-600 font-semibold mt-0.5">Landmark: {ord.landmark}</p>
                        )}
                      </div>

                      {/* 1-Tap Google Maps Button */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={getGoogleMapsUrl(ord.shippingAddress, ord.landmark, ord.city, ord.state, ord.pincode)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <MapPin className="w-4 h-4 text-rose-600" />
                          <span>Open in Google Maps Directions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => copyToClipboard(ord.shippingAddress, 'Address')}
                          className="min-h-10 px-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-100"
                          title="Copy Address"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Items Summary Preview */}
                    <div className="border-t border-[#4F534C]/10 pt-2 text-xs">
                      <div className="flex items-center justify-between text-[#61665D] font-bold mb-1">
                        <span>Items ({ord.items?.length || 0})</span>
                        <span>Qty</span>
                      </div>
                      <div className="space-y-1">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs py-1 gap-2">
                            <span className="text-[#1E201D] font-medium break-words leading-tight flex-1">
                              {item.name} ({item.weight})
                            </span>
                            <span className="font-bold text-[#656B4F]">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Controller & Action Buttons */}
                    <div className="border-t border-[#4F534C]/10 pt-3 space-y-2">
                      {isOrderFailedOrExpired(ord) ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-h-11 rounded-xl px-3 bg-red-50 border border-red-200 text-red-800 font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs">
                            <Lock className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Failed & Locked (No Status Edit)</span>
                          </div>

                          <button
                            onClick={() => setSelectedOrderModal(ord)}
                            className="min-h-11 px-3.5 rounded-xl bg-[#EAF0E5] text-[#656B4F] font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-[#656B4F] hover:text-white transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => setInvoiceOrder(ord)}
                            className="min-h-11 px-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1 hover:bg-gray-200 shadow-2xs"
                            title="Print Packing Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isOnlinePaymentPending(ord) ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-h-11 rounded-xl px-3 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs">
                              <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                              <span>Payment Pending</span>
                            </div>

                            <button
                              onClick={() => setSelectedOrderModal(ord)}
                              className="min-h-11 px-3.5 rounded-xl bg-[#EAF0E5] text-[#656B4F] font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-[#656B4F] hover:text-white transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => setInvoiceOrder(ord)}
                              className="min-h-11 px-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1 hover:bg-gray-200 shadow-2xs"
                              title="Print Packing Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200 text-[11px] text-amber-950 font-semibold text-center">
                            ⏳ Customer has 30 mins to complete online payment. Status updates disabled until paid.
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <select
                              value={ord.status === 'Cancelled' ? 'Cancelled' : 'Confirmed'}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="flex-1 min-h-11 rounded-xl px-3 text-xs font-bold border border-[#4F534C]/20 bg-white text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Cancelled">Cancel Order</option>
                            </select>

                            <button
                              onClick={() => setSelectedOrderModal(ord)}
                              className="min-h-11 px-3.5 rounded-xl bg-[#EAF0E5] text-[#656B4F] font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-[#656B4F] hover:text-white transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => setInvoiceOrder(ord)}
                              className="min-h-11 px-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1 hover:bg-gray-200 shadow-2xs"
                              title="Print Packing Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2.5: CLIENT-FRIENDLY BUSINESS & MARKETING ISSUE LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Header with Sub-Tabs & Revenue Opportunities */}
            <div className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#4F534C]/10 pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#1E201D] font-poppins flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span>Business & Operations Activity Logs</span>
                  </h2>
                  <p className="text-xs text-[#61665D] mt-0.5 font-medium">
                    Plain-English insights for sales follow-ups, cart recovery, and daily dispatch operations.
                  </p>
                </div>

                {/* Sub-tab Switcher Pills */}
                <div className="flex items-center gap-2 p-1 bg-[#E8EEE0]/80 rounded-2xl border border-[#4F534C]/15">
                  <button
                    onClick={() => setLogSubTab('issues')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      logSubTab === 'issues'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-[#52574E] hover:text-[#1E201D]'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Payment Issues & Recovery</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      logSubTab === 'issues' ? 'bg-white/25 text-white' : 'bg-red-100 text-red-800'
                    }`}>
                      {issueOrders.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setLogSubTab('working')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      logSubTab === 'working'
                        ? 'bg-[#656B4F] text-white shadow-xs'
                        : 'text-[#52574E] hover:text-[#1E201D]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Live Working Operations</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      logSubTab === 'working' ? 'bg-white/25 text-white' : 'bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20'
                    }`}>
                      {workingOrders.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* KPI Strip for Selected Log */}
              {logSubTab === 'issues' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">Failed / Abandoned Orders</span>
                    {loading ? (
                      <div className="h-7 w-20 bg-red-100 rounded-lg animate-pulse mt-1" />
                    ) : (
                      <span className="text-2xl font-black text-red-950 mt-1 block">{issueOrders.length} orders</span>
                    )}
                    <span className="text-[11px] text-red-700">30-min window expired or payment failed</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Recoverable Revenue Opportunity</span>
                    {loading ? (
                      <div className="h-7 w-24 bg-amber-100 rounded-lg animate-pulse mt-1" />
                    ) : (
                      <span className="text-2xl font-black text-amber-950 mt-1 block">₹{totalLostRevenue.toLocaleString()}</span>
                    )}
                    <span className="text-[11px] text-amber-800 font-semibold">Ready for WhatsApp & Call outreach</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Order Editing Rule</span>
                    <span className="text-base font-black text-blue-950 mt-1 block flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-blue-700" /> Locked (No Edit)
                    </span>
                    <span className="text-[11px] text-blue-700">Contact customer to place fresh order</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#EAF0E5] border border-[#656B4F]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#656B4F] block">Active Confirmed Orders</span>
                    {loading ? (
                      <div className="h-7 w-20 bg-[#D8E4D1] rounded-lg animate-pulse mt-1" />
                    ) : (
                      <span className="text-2xl font-black text-[#2D3823] mt-1 block">{workingOrders.length} orders</span>
                    )}
                    <span className="text-[11px] text-[#50563D]">In preparation or transit</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EAF0E5] border border-[#656B4F]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#656B4F] block">Active Processing Value</span>
                    {loading ? (
                      <div className="h-7 w-24 bg-[#D8E4D1] rounded-lg animate-pulse mt-1" />
                    ) : (
                      <span className="text-2xl font-black text-[#1E201D] mt-1 block">₹{totalWorkingRevenue.toLocaleString()}</span>
                    )}
                    <span className="text-[11px] text-[#656B4F] font-semibold">Total confirmed revenue</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Dispatch Status</span>
                    <span className="text-base font-black text-purple-950 mt-1 block flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-purple-700" /> Kitchen & Cold-Chain
                    </span>
                    <span className="text-[11px] text-purple-700">Real-time driver coordination</span>
                  </div>
                </div>
              )}

              {/* Search Toolbar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#61665D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs by customer name, order #, phone, address, or item name..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#E8EEE0]/60 border border-[#4F534C]/20 text-xs font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* VIEW A: ISSUE LOG (FAILED / EXPIRED ORDERS RECOVERY) */}
            {logSubTab === 'issues' && (
              <div className="space-y-4">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <article key={n} className="rounded-2xl border border-red-200 bg-white p-4 sm:p-5 shadow-sm space-y-4 animate-pulse">
                      <div className="flex justify-between border-b border-red-100 pb-3">
                        <div className="space-y-2">
                          <div className="h-4 bg-red-100 rounded w-40" />
                          <div className="h-3 bg-red-50 rounded w-64" />
                        </div>
                        <div className="h-6 bg-red-100 rounded w-20" />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                        <div className="h-24 bg-gray-50 rounded-xl" />
                        <div className="h-24 bg-gray-50 rounded-xl" />
                        <div className="h-24 bg-[#FBFDF2] rounded-xl" />
                      </div>
                    </article>
                  ))
                ) : filteredLogOrders.length === 0 ? (
                  <div className="rounded-2xl border border-[#4F534C]/15 bg-white p-12 text-center text-gray-500 shadow-sm">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-[#656B4F] mb-3" />
                    <h3 className="text-base font-black text-[#1E201D]">No Payment Issues or Abandoned Carts Found</h3>
                    <p className="text-xs text-[#61665D] mt-1">All online orders are either paid or there are no drop-offs matching your search.</p>
                  </div>
                ) : (
                  filteredLogOrders.map((ord) => (
                    <article
                      key={ord.id}
                      className="rounded-2xl border border-red-200 bg-white p-4 sm:p-5 shadow-sm space-y-4 hover:border-red-300 transition-all"
                    >
                      {/* Top Header: Problem Summary in Plain English */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-red-950">#{ord.orderNumber}</span>
                              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-black uppercase">
                                Payment Failed / 30m Expired
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3 text-gray-500" /> Locked
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-red-800 mt-0.5">
                              {ord.failureReason || 'Customer did not complete payment within the 30-minute grace window.'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs text-gray-500 block">Lost Value Opportunity</span>
                          <span className="text-xl font-black text-red-900">₹{ord.totalAmount}</span>
                        </div>
                      </div>

                      {/* Customer Profile & Direct Contact Hub */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                        {/* Customer Info */}
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Customer Information</span>
                          <div>
                            <p className="font-extrabold text-sm text-[#1E201D]">{ord.customerName}</p>
                            <p className="text-xs text-gray-600 break-words">{ord.customerEmail}</p>
                            <p className="text-xs font-bold text-gray-800 mt-0.5">Phone: +91 {ord.customerPhone}</p>
                          </div>

                          {/* 1-Click Call & WhatsApp Marketing Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="min-h-10 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Customer</span>
                            </a>

                            <a
                              href={getMarketingRecoveryWhatsAppUrl(ord)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-10 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                              title="Send WhatsApp Cart Recovery Message"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Pitch</span>
                            </a>
                          </div>
                        </div>

                        {/* Delivery Destination */}
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Delivery Address</span>
                          <p className="text-xs text-[#1E201D] font-medium leading-relaxed">{ord.shippingAddress}</p>
                          {ord.landmark && (
                            <p className="text-[11px] text-gray-600 font-semibold">Landmark: {ord.landmark}</p>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={getGoogleMapsUrl(ord.shippingAddress, ord.landmark, ord.city, ord.state, ord.pincode)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5 text-rose-600" />
                              <span>Google Maps</span>
                            </a>

                            <button
                              onClick={() => copyToClipboard(ord.shippingAddress, 'Address')}
                              className="min-h-10 px-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100"
                              title="Copy Address"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Items Breakdown */}
                        <div className="p-3.5 rounded-xl bg-[#FBFDF2] border border-[#656B4F]/20 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#656B4F] block">
                            Reserved Items ({ord.items?.length || 0})
                          </span>
                          <div className="space-y-1.5 max-h-28 overflow-y-auto">
                            {ord.items?.map((item, idx) => (
                              <div key={idx} className="flex items-start justify-between text-xs gap-3 py-0.5">
                                <span className="text-[#1E201D] font-medium break-words leading-tight flex-1">
                                  {item.name} ({item.weight})
                                </span>
                                <span className="font-bold text-[#656B4F]">×{item.quantity} (₹{item.price * item.quantity})</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-[#656B4F]/15 pt-1.5 flex justify-between text-xs font-bold text-[#1E201D]">
                            <span>Total Attempted Amount:</span>
                            <span className="font-black text-[#656B4F]">₹{ord.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Follow-up Tracking Bar */}
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-900">Sales Follow-Up Status:</span>
                          <select
                            value={ord.followUpStatus || 'Not Contacted'}
                            onChange={(e) => handleUpdateFollowUp(ord.id, e.target.value)}
                            disabled={updatingFollowUpId === ord.id}
                            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-bold text-xs text-amber-900 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="Not Contacted">Not Contacted Yet</option>
                            <option value="Contacted">Contacted Customer</option>
                            <option value="Recovered">Recovered (Placed New Order)</option>
                            <option value="Lost">Lost Lead</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <input
                            type="text"
                            placeholder="Add sales notes (e.g. Will order tonight via COD)..."
                            value={followUpNotesInput[ord.id] ?? (ord.followUpNotes || '')}
                            onChange={(e) => setFollowUpNotesInput({ ...followUpNotesInput, [ord.id]: e.target.value })}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-amber-200 bg-white text-xs text-[#1E201D] outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => handleUpdateFollowUp(ord.id, ord.followUpStatus || 'Not Contacted', followUpNotesInput[ord.id] ?? ord.followUpNotes)}
                            disabled={updatingFollowUpId === ord.id}
                            className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5 justify-center"
                          >
                            {updatingFollowUpId === ord.id ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                            ) : (
                              'Save Note'
                            )}
                          </button>
                        </div>

                        <div className="text-[11px] text-gray-500 font-semibold shrink-0">
                          Placed on {formatOrderDate(ord.createdAt)} ({getTimeAgo(ord.createdAt)})
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* VIEW B: WORKING / OPERATIONAL STREAM */}
            {logSubTab === 'working' && (
              <div className="space-y-3.5">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <article key={n} className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 sm:p-5 shadow-sm space-y-3 animate-pulse">
                      <div className="h-4 bg-[#E8EEE0] rounded w-48" />
                      <div className="h-4 bg-[#E8EEE0] rounded w-64" />
                    </article>
                  ))
                ) : filteredLogOrders.length === 0 ? (
                  <div className="rounded-2xl border border-[#4F534C]/15 bg-white p-12 text-center text-gray-500 shadow-sm">
                    <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-black text-[#1E201D]">No Active Working Orders</h3>
                    <p className="text-xs text-[#61665D] mt-1">All confirmed orders will appear here in real time.</p>
                  </div>
                ) : (
                  filteredLogOrders.map((ord) => (
                    <article
                      key={ord.id}
                      className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#656B4F]/40 transition-all"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-sm text-[#656B4F]">#{ord.orderNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                            ord.status === 'Confirmed' ? 'bg-[#EAF0E5] text-[#2D3823] border border-[#656B4F]/20' :
                            ord.status === 'Cancelled' ? 'bg-red-100 text-red-900' :
                            ord.status === 'Payment Failed' ? 'bg-red-100 text-red-900' :
                            'bg-amber-100 text-amber-900'
                          }`}>
                            {ord.status}
                          </span>
                          <span className="text-xs text-[#61665D]">
                            {formatOrderDate(ord.createdAt)} ({getTimeAgo(ord.createdAt)})
                          </span>
                        </div>

                        <p className="font-extrabold text-sm text-[#1E201D]">
                          {ord.customerName} • <span className="font-normal text-[#61665D]">{ord.shippingAddress}</span>
                        </p>

                        <p className="text-xs text-[#61665D]">
                          Items: {ord.items?.map(i => `${i.name} (${i.weight}) ×${i.quantity}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right mr-3 hidden sm:block">
                          <span className="text-lg font-black text-[#656B4F] block">₹{ord.totalAmount}</span>
                          <span className="text-[10px] text-[#50563D] font-bold uppercase">{ord.paymentStatus || 'Paid'}</span>
                        </div>

                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="p-2.5 rounded-xl bg-[#EAF0E5] hover:bg-[#DEE8D8] text-[#50563D] border border-[#656B4F]/20 transition-colors shadow-2xs"
                          title={`Call ${ord.customerPhone}`}
                        >
                          <Phone className="w-4 h-4 text-[#656B4F]" />
                        </a>

                        <a
                          href={getWhatsAppUrl(ord)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white transition-colors shadow-2xs"
                          title="WhatsApp Update"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setSelectedOrderModal(ord)}
                          className="px-3.5 py-2 rounded-xl bg-[#EAF0E5] text-[#656B4F] font-bold text-xs hover:bg-[#656B4F] hover:text-white transition-all shadow-2xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                />
                <Search className="w-4 h-4 text-[#61665D] absolute left-3.5 top-3" />
              </div>
            </div>
            
            <div className="hidden overflow-hidden rounded-2xl border border-[#4F534C]/15 bg-white shadow-sm xl:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#656B4F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
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
                    {loading ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-28" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-36" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-24" /></td>
                          <td className="py-3.5 px-4"><div className="h-5 bg-[#E8EEE0] rounded-full w-14" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-20" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-8" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-16" /></td>
                        </tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#61665D]">
                          <Users className="w-10 h-10 mx-auto text-[#656B4F]/40 mb-2" />
                          <p className="font-bold text-sm text-[#1E201D]">No registered users found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-[#FFF3E0]/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#1E201D]">{usr.name}</td>
                          <td className="py-3.5 px-4 text-[#61665D]">{usr.email}</td>
                          <td className="py-3.5 px-4 font-medium">{usr.phone}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                usr.role === 'Admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-[#FFF3E0] text-[#656B4F]'
                              }`}
                            >
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#61665D]">{usr.joinedDate}</td>
                          <td className="py-3.5 px-4 font-bold text-center sm:text-left">{usr.totalOrders}</td>
                          <td className="py-3.5 px-4 font-black text-[#656B4F]">₹{usr.totalSpent}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-3 xl:hidden">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <article key={n} className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm animate-pulse space-y-3">
                    <div className="flex justify-between">
                      <div className="space-y-1.5">
                        <div className="h-4 bg-[#E8EEE0] rounded w-28" />
                        <div className="h-3 bg-[#E8EEE0] rounded w-36" />
                      </div>
                      <div className="h-5 bg-[#E8EEE0] rounded-full w-14" />
                    </div>
                  </article>
                ))
              ) : (
                filteredUsers.map((usr) => (
                  <article key={usr.id} className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-sm font-black break-words">{usr.name}</h3><p className="text-xs text-[#61665D] break-words">{usr.email}</p></div><span className="rounded-full bg-[#EAF0E5] px-2 py-1 text-[10px] font-bold text-[#656B4F]">{usr.role}</span></div>
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#4F534C]/10 pt-3 text-xs"><p><span className="block text-[#61665D]">Phone</span>{usr.phone}</p><p><span className="block text-[#61665D]">Total spent</span><strong className="text-[#656B4F]">₹{usr.totalSpent}</strong></p></div>
                  </article>
                ))
              )}
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

            <div className="hidden overflow-hidden rounded-2xl border border-[#4F534C]/15 bg-white shadow-sm xl:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E201D]">
                  <thead className="bg-[#EAF0E5] text-[#656B4F] uppercase font-bold text-[11px] tracking-wider border-b border-[#4F534C]/15">
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
                    {loading ? (
                      [1, 2, 3, 4].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-28" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-20" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-12" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-48" /></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-[#E8EEE0] rounded w-16" /></td>
                          <td className="py-3.5 px-4 text-right"><div className="h-7 bg-[#E8EEE0] rounded-lg w-10 ml-auto" /></td>
                        </tr>
                      ))
                    ) : reviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#61665D]">
                          <Star className="w-10 h-10 mx-auto text-amber-500/40 mb-2" />
                          <p className="font-bold text-sm text-[#1E201D]">No reviews found</p>
                        </td>
                      </tr>
                    ) : (
                      reviews.map((rev) => (
                        <tr key={rev._id || rev.id} className="hover:bg-[#FAFAF5] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#1E201D] flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#656B4F] text-white flex items-center justify-center text-xs font-black shrink-0">
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-3 xl:hidden">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <article key={n} className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm animate-pulse space-y-2">
                    <div className="h-4 bg-[#E8EEE0] rounded w-32" />
                    <div className="h-3 bg-[#E8EEE0] rounded w-48" />
                  </article>
                ))
              ) : (
                reviews.map((rev) => (
                  <article key={rev._id || rev.id} className="rounded-2xl border border-[#4F534C]/15 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#656B4F] text-xs font-black text-white">{rev.authorName.slice(0, 1)}</div><div className="min-w-0"><h3 className="truncate text-sm font-black">{rev.authorName}</h3><p className="text-xs text-[#61665D]">{rev.location || 'India'} · {rev.dateText || 'Recently'}</p></div></div><button onClick={async () => { if (!confirm(`Delete review from "${rev.authorName}"?`)) return; await fetchApi(`/reviews/${rev._id || rev.id}`, { method: 'DELETE' }); fetchData(); }} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete review from ${rev.authorName}`}><Trash2 className="h-4 w-4" /></button></div>
                    <p className="mt-3 text-sm font-bold text-amber-600">{rev.rating} ★</p><p className="mt-1 text-xs leading-relaxed text-[#61665D]">{rev.comment}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-[#4F534C]/20 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#656B4F] px-6 py-4 text-white flex items-center justify-between shrink-0">
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
                  <label className="block font-bold text-[#1E201D] mb-1">Product Code #</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E201D] mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-bold text-[#1E201D] mb-1">MRP per 1KG (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E201D] mb-1">Selling Price per 1KG (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1E201D] mb-1">Base Weight</label>
                  <select
                    value={formData.weight || '1 KG'}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none font-medium text-xs sm:text-sm"
                  >
                    <option value="300 G">300 G</option>
                    <option value="1 KG">1 KG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1E201D] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E201D] mb-1">Live Stock Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stock: formData.stock > 0 ? 0 : 50 })}
                    className={`w-full py-2 px-3 rounded-lg font-black text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      formData.stock > 0
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${formData.stock > 0 ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
                    <span>{formData.stock > 0 ? 'IN STOCK (LIVE)' : 'OUT OF STOCK (OFF)'}</span>
                  </button>
                </div>
                {formData.stock > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="broadcastStock"
                      checked={formData.broadcastStock || false}
                      onChange={(e) => setFormData({ ...formData, broadcastStock: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D3D8CF] text-[#656B4F] focus:ring-[#656B4F]"
                    />
                    <label htmlFor="broadcastStock" className="text-xs font-bold text-[#656B4F] flex items-center gap-1 cursor-pointer">
                      <Bell className="w-3.5 h-3.5" />
                      Send "Back in Stock" push notification
                    </label>
                  </div>
                )}
              </div>

              <ImageUploader
                label="Product Image"
                value={formData.image || ''}
                required
                onChange={(imageUrl, compressedFile) => {
                  setFormData(prev => ({ ...prev, image: imageUrl }));
                  setImageFile(compressedFile);
                  if (compressedFile) setImageType('upload');
                }}
              />

              <div>
                <label className="block font-bold text-[#1E201D] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                />
              </div>

              {/* Best Seller Checkbox Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#EAF0E5]/60 border border-[#656B4F]/20 flex items-center justify-between">
                <div>
                  <label className="font-extrabold text-xs text-[#1E201D] flex items-center gap-1.5 cursor-pointer">
                    <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>Feature as Best Seller (Show on Homepage)</span>
                  </label>
                  <p className="text-[10px] text-[#61665D] mt-0.5">Enables this product in the &quot;Customer Favorites / Best Sellers&quot; section on the storefront homepage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-5 h-5 accent-[#656B4F] cursor-pointer shrink-0"
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
                    className="px-3 py-1.5 rounded-xl bg-[#656B4F] text-white font-bold text-xs hover:bg-[#656B4F] transition-colors flex items-center gap-1 shrink-0"
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
                  className="px-4 py-2 rounded-xl bg-gray-200 text-[#1E201D] font-bold"
                >
                  Cancel
                </button>
                <button
                  disabled={uploadingImage}
                  className="px-5 py-2 rounded-xl bg-[#656B4F] text-white font-bold hover:bg-[#50563D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadingImage ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    'Save Product'
                  )}
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
            <div className="bg-[#656B4F] px-6 py-4 text-white flex items-center justify-between shrink-0">
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
                <label className="block font-bold text-[#1E201D] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                />
              </div>

              <ImageUploader
                label="Category Image"
                value={categoryFormData.image || ''}
                required
                onChange={(imageUrl, compressedFile) => {
                  setCategoryFormData(prev => ({ ...prev, image: imageUrl }));
                  setImageFile(compressedFile);
                  if (compressedFile) setImageType('upload');
                }}
              />

              <div>
                <label className="block font-bold text-[#1E201D] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryFormData.description || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 focus:ring-2 focus:ring-[#656B4F] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#4F534C]/15 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-[#1E201D] font-bold"
                >
                  Cancel
                </button>
                <button
                  disabled={uploadingImage}
                  className="px-5 py-2 rounded-xl bg-[#656B4F] text-white font-bold hover:bg-[#50563D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadingImage ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE ORDER INSPECTOR MODAL */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-[#4F534C]/20 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#1E201D] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#656B4F] flex items-center justify-center text-white">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg font-poppins">
                      Order #{selectedOrderModal.orderNumber}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      selectedOrderModal.status === 'Confirmed' ? 'bg-[#EAF0E5] text-[#2D3823] border border-[#656B4F]/20' :
                      selectedOrderModal.status === 'Cancelled' ? 'bg-red-100 text-red-900' :
                      selectedOrderModal.status === 'Payment Failed' ? 'bg-red-100 text-red-900' :
                      'bg-amber-100 text-amber-900'
                    }`}>
                      {selectedOrderModal.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Placed on {formatOrderDate(selectedOrderModal.createdAt)} ({getTimeAgo(selectedOrderModal.createdAt)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceOrder(selectedOrderModal)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Print Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrderModal(null)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
              
              {/* Order Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isOrderFailedOrExpired(selectedOrderModal)
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : isOnlinePaymentPending(selectedOrderModal)
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-[#EAF0E5] border-[#656B4F]/30 text-[#2D3823]'
              }`}>
                <div className="flex items-center gap-2.5">
                  {isOrderFailedOrExpired(selectedOrderModal) ? (
                    <Lock className="w-5 h-5 text-red-600 shrink-0" />
                  ) : isOnlinePaymentPending(selectedOrderModal) ? (
                    <Clock className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-[#656B4F] shrink-0" />
                  )}
                  <div>
                    <p className="font-extrabold text-sm">
                      {isOrderFailedOrExpired(selectedOrderModal)
                        ? (selectedOrderModal.status === 'Cancelled' ? 'Order Cancelled' : 'Payment Failed (Window Expired)')
                        : isOnlinePaymentPending(selectedOrderModal)
                        ? 'Awaiting Payment (Within 30 Mins)'
                        : 'Order Confirmed'}
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">
                      {isOrderFailedOrExpired(selectedOrderModal)
                        ? 'No further payment or action possible.'
                        : isOnlinePaymentPending(selectedOrderModal)
                        ? 'Customer has 30 minutes to complete online payment.'
                        : 'Payment completed and order is confirmed.'}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-black text-xs px-3 py-1 rounded-xl bg-white/80 border border-current shadow-2xs">
                  {selectedOrderModal.status}
                </span>
              </div>

              {/* Customer, Shipping, and Payment Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Customer Details & Instant Contact */}
                <div className="p-4 rounded-2xl bg-[#EAF0E5]/60 border border-[#4F534C]/15 space-y-3">
                  <div className="flex items-center gap-2 text-[#656B4F] font-bold text-xs">
                    <Users className="w-4 h-4" />
                    <span>Customer & Contact</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-[#1E201D] text-sm">{selectedOrderModal.customerName}</p>
                    <p className="text-[#61665D]">{selectedOrderModal.customerEmail}</p>
                  </div>

                  {/* 1-Tap Calling & WhatsApp Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${selectedOrderModal.customerPhone}`}
                      className="min-h-10 px-3 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>

                    <a
                      href={getWhatsAppUrl(selectedOrderModal)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-10 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Delivery Address & Google Maps Navigation */}
                <div className="p-4 rounded-2xl bg-white border border-[#4F534C]/15 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-[#656B4F] font-bold text-xs">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Delivery Destination</span>
                  </div>

                  <div>
                    <p className="text-xs text-[#1E201D] font-medium leading-relaxed">
                      {selectedOrderModal.shippingAddress}
                    </p>
                    {selectedOrderModal.landmark && (
                      <p className="text-[11px] text-[#61665D] font-semibold mt-0.5">
                        Landmark: {selectedOrderModal.landmark}
                      </p>
                    )}
                  </div>

                  {/* Google Maps Directions & Copy Address */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={getGoogleMapsUrl(
                        selectedOrderModal.shippingAddress,
                        selectedOrderModal.landmark,
                        selectedOrderModal.city,
                        selectedOrderModal.state,
                        selectedOrderModal.pincode
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>Google Maps Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => copyToClipboard(selectedOrderModal.shippingAddress, 'Address')}
                      className="min-h-10 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1"
                      title="Copy Address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment & Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#656B4F]" />
                    <span>Payment Information</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                    selectedOrderModal.paymentStatus === 'Paid' ? 'bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20' :
                    selectedOrderModal.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrderModal.paymentStatus || 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[#61665D] block text-[10px]">Payment Method</span>
                    <strong className="text-[#1E201D]">{selectedOrderModal.paymentMethod || 'Online'}</strong>
                  </div>
                  <div>
                    <span className="text-[#61665D] block text-[10px]">Subtotal</span>
                    <strong className="text-[#1E201D]">₹{selectedOrderModal.subtotal ?? (selectedOrderModal.totalAmount - (selectedOrderModal.deliveryFee || 0))}</strong>
                  </div>
                  <div>
                    <span className="text-[#61665D] block text-[10px]">Delivery Fee</span>
                    <strong className="text-[#1E201D]">
                      {(selectedOrderModal.deliveryFee || 0) === 0 ? 'FREE' : `₹${selectedOrderModal.deliveryFee}`}
                    </strong>
                  </div>
                </div>

                {selectedOrderModal.razorpayPaymentId && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 text-[11px] font-mono mt-1">
                    <span className="text-gray-500">Razorpay ID: {selectedOrderModal.razorpayPaymentId}</span>
                    <button
                      onClick={() => copyToClipboard(selectedOrderModal.razorpayPaymentId!, 'Razorpay ID')}
                      className="p-1 text-gray-500 hover:text-gray-800"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {isOnlinePaymentPending(selectedOrderModal) && (
                  <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 mt-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-extrabold text-amber-950">Awaiting Online Payment (Grace Period)</p>
                      <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                        The customer has 30 minutes from order creation to complete payment. Order preparation and status progression are disabled until payment is verified as <strong>PAID</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Purchased Items Table */}
              <div>
                <h4 className="font-black text-sm text-[#1E201D] mb-2.5 flex items-center justify-between">
                  <span>Purchased Frozen Items ({selectedOrderModal.items?.length || 0})</span>
                  <span className="text-xs font-bold text-[#656B4F]">Total: ₹{selectedOrderModal.totalAmount}</span>
                </h4>

                <div className="rounded-2xl border border-[#4F534C]/15 overflow-hidden divide-y divide-[#4F534C]/10">
                  {selectedOrderModal.items?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-[#FBFDF2] transition-colors">
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-sm text-[#1E201D] block break-words">{item.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#E8EEE0] text-[#656B4F] font-bold text-[10px]">
                            {item.weight}
                          </span>
                          <span className="text-[#61665D] text-xs">₹{item.price} each</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-xs text-[#61665D]">Qty: ×{item.quantity}</div>
                        <div className="font-black text-sm text-[#656B4F] mt-0.5">₹{item.price * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-[#4F534C]/15 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {isOrderFailedOrExpired(selectedOrderModal) ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-900 border border-red-300 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    <span>Locked (Payment Failed - No Status Edits Allowed)</span>
                  </div>
                ) : isOnlinePaymentPending(selectedOrderModal) ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse shrink-0" />
                    <span>Payment Pending — Status Updates Disabled Until Customer Pays</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-bold text-[#61665D]">Order Status:</span>
                    <select
                      value={selectedOrderModal.status === 'Cancelled' ? 'Cancelled' : 'Confirmed'}
                      onChange={(e) => {
                        handleUpdateOrderStatus(selectedOrderModal.id, e.target.value);
                        setSelectedOrderModal({ ...selectedOrderModal, status: e.target.value as any });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#4F534C]/20 bg-white font-bold text-xs text-[#1E201D] outline-none focus:ring-2 focus:ring-[#656B4F]"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancel Order</option>
                    </select>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printCommercialBill(selectedOrderModal)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF0E5] border border-[#4F534C]/20 text-[#1E201D] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Print clean 1-page commercial packing slip"
                >
                  <Printer className="w-3.5 h-3.5 text-[#656B4F]" />
                  <span>Print Slip (1-Page)</span>
                </button>

                <button
                  onClick={() => setInvoiceOrder(selectedOrderModal)}
                  className="px-4 py-2 rounded-xl bg-[#2D3823] hover:bg-[#1E201D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Preview Full Tax Bill"
                >
                  <FileText className="w-3.5 h-3.5 text-[#B4CEB1]" />
                  <span>View Bill</span>
                </button>

                <button
                  onClick={() => setSelectedOrderModal(null)}
                  className="px-5 py-2 rounded-xl bg-[#656B4F] hover:bg-[#3d4732] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* EXECUTIVE COMMERCIAL PACKING SLIP & BILL (Strict 1-Page Clean Format)     */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-stone-300 max-h-[96vh] flex flex-col overflow-hidden print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:max-h-none print:m-0">
            {/* Header Action Toolbar (Hidden in Print) */}
            <div className="bg-[#1E201D] text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#A9B896]" />
                <span className="font-bold text-xs sm:text-sm">Delivery Packing Slip & Tax Bill</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') || '' : '';
                    window.open(`/api/orders/${invoiceOrder.id || (invoiceOrder as any)._id}/invoice?token=${encodeURIComponent(token)}`, '_blank');
                  }}
                  className="px-3 py-1.5 bg-[#2D3823] hover:bg-[#1E201D] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Download Official Vector PDF Invoice"
                >
                  <FileText className="w-3.5 h-3.5 text-[#B4CEB1]" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => printCommercialBill(invoiceOrder)}
                  className="px-3.5 py-1.5 bg-[#656B4F] hover:bg-[#50563D] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Print clean 1-page packing slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip (1-Page)</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer ml-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Bill Slip Container */}
            <div
              id="printable-slip"
              className="p-4 sm:p-6 space-y-3.5 text-[#1E201D] overflow-y-auto font-sans print:p-0 print:m-0 print:overflow-visible print:text-black bg-white"
            >
              {/* 1. Header Box Section */}
              <div className="border border-[#50563D] rounded-xl p-3 sm:p-3.5 bg-[#FAFBF7] flex flex-col sm:flex-row justify-between gap-3 relative overflow-hidden">
                <div className="space-y-0.5 sm:max-w-[60%]">
                  <h2 className="text-base sm:text-lg font-black text-[#50563D] tracking-tight leading-tight">
                    SAKTHI FROZEN FOODS
                  </h2>
                  <p className="text-[10.5px] font-extrabold text-[#656B4F] uppercase tracking-wider">
                    100% Plant-Based Meat & Vegan Delicacies
                  </p>
                  <p className="text-[10px] text-stone-600 leading-tight pt-0.5">
                    Peons Colony, Kalpana Theatre, opposite Edayarpalayam - Koundampalayam Road, Coimbatore - 641030
                  </p>
                  <p className="text-[10px] text-stone-600">
                    Phone: <strong>+91 80563 89214</strong> | Email: <strong>sakthifrozenfoods@gmail.com</strong>
                  </p>
                  <p className="text-[10px] text-[#50563D] font-bold">
                    Website: <strong className="text-[#656B4F]">buy.tnmockmeat.com</strong> | FSSAI Lic. No: <strong>12421008000456</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-0.5 sm:border-l sm:border-stone-200 sm:pl-3 sm:min-w-[36%] shrink-0">
                  <span className="text-[11px] font-black uppercase text-[#50563D] block tracking-wider">
                    DELIVERY SLIP & TAX INVOICE
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-[#1E201D] block break-all">
                    #{invoiceOrder.orderNumber}
                  </span>
                  <span className="text-[10px] text-stone-600 block">
                    Date: {formatOrderDate(invoiceOrder.createdAt)}
                  </span>
                  <div className="pt-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                        invoiceOrder.paymentStatus === 'Paid' || invoiceOrder.status === 'Confirmed'
                          ? 'bg-[#EAF0E5] text-[#2D3823] border border-[#656B4F]/30'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {invoiceOrder.paymentStatus === 'Paid' ? 'PAID (Verified)' : invoiceOrder.status}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-stone-600 pt-0.5">
                    Payment: <strong>{invoiceOrder.paymentMethod || 'Online Gateway'}</strong>
                  </p>
                  {invoiceOrder.deliveryMode && (
                    <p className="text-[9.5px] text-[#50563D] font-bold">
                      Mode: {invoiceOrder.deliveryMode} Express (-18°C)
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Customer & Delivery Breakdown (2-Column Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="border border-[#D4DBC9] rounded-xl overflow-hidden bg-white">
                  <div className="bg-[#EAF0E5] px-3 py-1 border-b border-[#D4DBC9]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#50563D]">
                      CUSTOMER / BILLED TO
                    </span>
                  </div>
                  <div className="p-2.5 space-y-0.5 text-[11px]">
                    <p className="font-black text-[#1E201D] text-xs">{invoiceOrder.customerName}</p>
                    <p className="text-stone-700">Phone: <strong>+91 {invoiceOrder.customerPhone}</strong></p>
                    {invoiceOrder.customerEmail && (
                      <p className="text-stone-600 break-words">Email: {invoiceOrder.customerEmail}</p>
                    )}
                    <p className="text-stone-600 text-[10.5px] line-clamp-2 leading-tight">
                      Address: {invoiceOrder.shippingAddress}
                    </p>
                  </div>
                </div>

                <div className="border border-[#D4DBC9] rounded-xl overflow-hidden bg-white">
                  <div className="bg-[#EAF0E5] px-3 py-1 border-b border-[#D4DBC9]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#50563D]">
                      SHIP TO / DELIVERY DESTINATION
                    </span>
                  </div>
                  <div className="p-2.5 space-y-0.5 text-[11px]">
                    <p className="font-black text-[#1E201D] text-xs">{invoiceOrder.customerName}</p>
                    <p className="text-stone-700 line-clamp-2 text-[10.5px] leading-tight">
                      {invoiceOrder.shippingAddress}
                    </p>
                    {invoiceOrder.landmark && (
                      <p className="text-[10px] text-[#50563D] font-bold">
                        Landmark: {invoiceOrder.landmark}
                      </p>
                    )}
                    <p className="text-[10px] text-stone-600">
                      {[invoiceOrder.city, invoiceOrder.district, invoiceOrder.state].filter(Boolean).join(', ')}
                      {invoiceOrder.pincode ? ` - ${invoiceOrder.pincode}` : ''}
                    </p>
                    <p className="text-[9.5px] text-[#50563D] font-bold pt-0.5">
                      Dispatch Condition: Frozen Thermal Box (-18°C)
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Itemized Products Table */}
              <div className="border border-[#656B4F] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#50563D] text-white font-extrabold uppercase text-[9.5px] tracking-wider">
                      <th className="py-1.5 px-2 text-center w-8 border-r border-[#656B4F]/40">#</th>
                      <th className="py-1.5 px-3 border-r border-[#656B4F]/40">Item Description</th>
                      <th className="py-1.5 px-2 text-center border-r border-[#656B4F]/40">Pack</th>
                      <th className="py-1.5 px-2 text-center border-r border-[#656B4F]/40">Qty</th>
                      <th className="py-1.5 px-2.5 text-right border-r border-[#656B4F]/40">Unit Price</th>
                      <th className="py-1.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-[11px]">
                    {invoiceOrder.items?.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-[#FAFBF7]' : 'bg-white'}>
                        <td className="py-1.5 px-2 text-center font-bold text-[#50563D] border-r border-stone-200">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3 font-bold text-[#1E201D] border-r border-stone-200">
                          <span>{item.name}</span>
                          <span className="block text-[9.5px] font-normal text-stone-500 italic">
                            100% Pure Veg Frozen Alternative
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center text-stone-700 font-bold border-r border-stone-200">
                          {item.weight || '1 KG'}
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-[#1E201D] border-r border-stone-200">
                          {item.quantity}
                        </td>
                        <td className="py-1.5 px-2.5 text-right text-stone-700 border-r border-stone-200">
                          ₹{Number(item.price).toFixed(2)}
                        </td>
                        <td className="py-1.5 px-3 text-right font-black text-[#50563D]">
                          ₹{Number(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Calculation & Guidelines Section */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start text-xs pt-0.5">
                {/* Left side: Cold Storage Directive & Declarations */}
                <div className="sm:col-span-7 space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#F7FAF4] border border-[#D4DBC9] space-y-1">
                    <p className="font-extrabold text-[10.5px] text-[#50563D] flex items-center gap-1.5">
                      <Snowflake className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Cold Chain & Quality Guidelines:</span>
                    </p>
                    <p className="text-[9.5px] text-stone-600 leading-tight">
                      Store immediately at <strong>-18°C</strong> or colder upon delivery. Keep sealed until preparation. Do not refreeze once thawed.
                    </p>
                    <p className="text-[9px] text-[#656B4F] pt-0.5 font-bold">
                      Helpline / WhatsApp: +91 80563 89214 | Store: buy.tnmockmeat.com
                    </p>
                  </div>
                  <p className="text-[8.5px] text-stone-400 italic">
                    Certified 100% Pure Vegetarian Plant-Based Products. Computer generated commercial delivery bill.
                  </p>
                </div>

                {/* Right side: Calculation Breakdown */}
                <div className="sm:col-span-5 border border-[#D4DBC9] rounded-xl overflow-hidden bg-white text-[11px] shadow-2xs">
                  <div className="p-2.5 space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal:</span>
                      <span className="font-bold text-[#1E201D]">
                        ₹{Number(invoiceOrder.subtotal ?? (invoiceOrder.totalAmount - (invoiceOrder.deliveryFee || 0) - (invoiceOrder.convenienceFee || 0))).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Cold Chain Delivery:</span>
                      <span className="font-bold text-[#1E201D]">
                        {(invoiceOrder.deliveryFee || 0) === 0 ? 'FREE' : `₹${Number(invoiceOrder.deliveryFee).toFixed(2)}`}
                      </span>
                    </div>
                    {Boolean(invoiceOrder.convenienceFee) && (
                      <div className="flex justify-between text-stone-600">
                        <span>Convenience Fee (2.5%):</span>
                        <span className="font-bold text-[#1E201D]">₹{Number(invoiceOrder.convenienceFee).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-stone-500 pt-0.5 border-t border-stone-100">
                      <span>GST (Food Products):</span>
                      <span>Inclusive in MRP</span>
                    </div>
                  </div>

                  {/* Grand Total Bar */}
                  <div className="bg-[#50563D] text-white p-2 px-3 flex justify-between items-center">
                    <span className="font-black text-xs uppercase tracking-wider">Total Amount:</span>
                    <span className="font-black text-sm sm:text-base">₹{Number(invoiceOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* 5. Bottom Signatory Strip */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[9px] text-stone-500">
                <span>Thank you for choosing Sakthi Frozen Foods!</span>
                <span className="font-bold text-[#50563D] uppercase">
                  For SAKTHI FROZEN FOODS • [ Authorized Digital Signatory ]
                </span>
              </div>
            </div>

            {/* Bottom Modal Toolbar (Hidden in Print) */}
            <div className="p-3.5 bg-stone-100 border-t border-stone-300 flex items-center justify-between shrink-0 print:hidden">
              <span className="text-[11px] text-stone-500">Official 1-Page Commercial Bill Slip</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printCommercialBill(invoiceOrder)}
                  className="px-4 py-2 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
