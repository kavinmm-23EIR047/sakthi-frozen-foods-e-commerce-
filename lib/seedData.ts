export interface CategoryType {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

export interface ProductType {
  id: string;
  code: string;
  name: string;
  weight: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image: string;
  rating: number;
  isPopular?: boolean;
}

export interface OrderItemType {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItemType[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  razorpayPaymentId?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Admin';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  address: string;
}

export const INITIAL_CATEGORIES: CategoryType[] = [
  {
    id: 'cat-1',
    name: 'Mutton Alternatives',
    description: '100% plant-based mutton that tastes just like the real thing.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    icon: 'Meat',
  },
  {
    id: 'cat-2',
    name: 'Seafood Alternatives',
    description: 'Flaky, delicious plant-based fish and prawns.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    icon: 'Fish',
  },
  {
    id: 'cat-3',
    name: 'Poultry Alternatives',
    description: 'Juicy, tender vegan chicken for all your curries and starters.',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
    icon: 'Drumstick',
  },
  {
    id: 'cat-4',
    name: 'Snacks & Starters',
    description: 'Crispy nuggets, lolipops and cutlets ready to fry.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    icon: 'Pizza',
  },
  {
    id: 'cat-5',
    name: 'Specialty Meat Alternatives',
    description: 'Unique plant-based meats like liver and exotic cuts.',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
    icon: 'Star',
  },
];

export const INITIAL_PRODUCTS: ProductType[] = [
  {
    id: 'prod-1',
    code: '1',
    name: 'Veg Mutton',
    weight: '1 KG',
    price: 650,
    category: 'Mutton Alternatives',
    description: 'Tender 100% plant-based mutton chunks seasoned with traditional authentic spices. Ideal for biryani and gravy.',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 'prod-2',
    code: '2',
    name: 'Veg Fish',
    weight: '1 KG',
    price: 650,
    category: 'Seafood Alternatives',
    description: 'Flaky plant-based fish fillets infused with sea algae minerals for authentic coastal flavor and high Omega-3.',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    isPopular: true,
  },
  {
    id: 'prod-3',
    code: '3',
    name: 'Veg Prawn',
    weight: '1 KG',
    price: 750,
    category: 'Seafood Alternatives',
    description: 'Crispy plant-based jumbo prawns crafted from konjac & soy fiber. Perfect for stir-fries and chilli fry.',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 'prod-4',
    code: '4',
    name: 'Veg Chicken',
    weight: '1 KG',
    price: 600,
    category: 'Poultry Alternatives',
    description: 'Juicy, high-protein plant-based chicken strips. Excellent for curries, kebabs, and tikka masala.',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    isPopular: true,
  },
  {
    id: 'prod-5',
    code: '5',
    name: 'Veg Vanjaram',
    weight: '1.2 KG',
    price: 790,
    category: 'Seafood Alternatives',
    description: 'Premium King Fish (Vanjaram) style plant-based steaks. Pre-marinated for shallow frying.',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    isPopular: true,
  },
  {
    id: 'prod-6',
    code: '6',
    name: 'Veg Kulambu Fish',
    weight: '1 KG',
    price: 650,
    category: 'Seafood Alternatives',
    description: 'Traditional Chettinad style fish curry cuts that absorb tang and spice effortlessly without breaking.',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'prod-7',
    code: '7',
    name: 'Veg Chicken Nuggets',
    weight: '1 KG',
    price: 580,
    category: 'Snacks & Starters',
    description: 'Golden crunchy plant-based nuggets packed with pea protein. A healthy snack favorite for all ages.',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 'prod-8',
    code: '8',
    name: 'Veg Chicken Lolipop',
    weight: '1 KG',
    price: 580,
    category: 'Snacks & Starters',
    description: 'Indo-Chinese style veg chicken lolipops on wooden skewers. Crispy skin with juicy savory interior.',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'prod-9',
    code: '9',
    name: 'Veg Mutton Cutlet',
    weight: '1.2 KG',
    price: 620,
    category: 'Snacks & Starters',
    description: 'Herb-infused vegan mutton cutlet patties with breadcrumb coating. Ready to fry or air-fry.',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'prod-10',
    code: '10',
    name: 'Veg Mutton Kheema Ball',
    weight: '1 KG',
    price: 580,
    category: 'Mutton Alternatives',
    description: 'Spiced minced vegan mutton meatballs (Kola Urundai). Perfect for dry pepper fry or rich gravies.',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },

  // Smaller Pack Sizes
  {
    id: 'prod-12',
    code: '12',
    name: 'Veg Mutton (Value Pack)',
    weight: '400 G',
    price: 280,
    category: 'Mutton Alternatives',
    description: 'Standard household pack of 100% plant-based mutton chunks.',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },
  {
    id: 'prod-13',
    code: '13',
    name: 'Veg Fish (Value Pack)',
    weight: '500 G',
    price: 340,
    category: 'Seafood Alternatives',
    description: 'Single meal pack of flaky plant-based fish fillets.',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'prod-14',
    code: '14',
    name: 'Veg Prawn (Value Pack)',
    weight: '400 G',
    price: 320,
    category: 'Seafood Alternatives',
    description: 'Succulent plant-based prawns for quick stir-fry meals.',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'prod-15',
    code: '15',
    name: 'Veg Chicken (Value Pack)',
    weight: '400 G',
    price: 260,
    category: 'Poultry Alternatives',
    description: 'Standard pack of plant-based chicken strips.',
    stock: 65,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'prod-16',
    code: '16',
    name: 'Veg Liver',
    weight: '450 G',
    price: 340,
    category: 'Specialty Meat Alternatives',
    description: 'Rich iron-fortified vegan liver bites, packed with spices for traditional pepper fry.',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'prod-17',
    code: '17',
    name: 'Veg Chicken Nuggets (Value Pack)',
    weight: '300 G',
    price: 220,
    category: 'Snacks & Starters',
    description: 'Party pack snack sized plant-based nuggets.',
    stock: 75,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'prod-18',
    code: '18',
    name: 'Veg Chicken Lolipop (Value Pack)',
    weight: '300 G',
    price: 220,
    category: 'Snacks & Starters',
    description: 'Quick snack size vegan chicken lolipops.',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'prod-19',
    code: '19',
    name: 'Veg Mutton Cutlet (Value Pack)',
    weight: '300 G',
    price: 230,
    category: 'Snacks & Starters',
    description: 'Handcrafted vegan cutlets in a compact 300g box.',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'prod-20',
    code: '20',
    name: 'Veg Mutton Kheema Ball (Value Pack)',
    weight: '300 G',
    price: 220,
    category: 'Mutton Alternatives',
    description: 'Quick-fry vegan kheema balls for snack times.',
    stock: 55,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
];

export const INITIAL_ORDERS: OrderType[] = [
  {
    id: 'ord-1001',
    orderNumber: 'SKT-9821',
    customerName: 'Aravind Kumar',
    customerEmail: 'aravind@example.com',
    customerPhone: '+91 98765 43210',
    shippingAddress: '42 Greenways Road, Adyar, Chennai - 600020',
    items: [
      { productId: 'prod-1', name: 'Veg Mutton', weight: '1 KG', price: 650, quantity: 1 },
      { productId: 'prod-7', name: 'Veg Chicken Nuggets', weight: '1 KG', price: 580, quantity: 2 },
    ],
    totalAmount: 1810,
    paymentMethod: 'UPI / Online',
    status: 'Delivered',
    createdAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'ord-1002',
    orderNumber: 'SKT-9822',
    customerName: 'Priya Sundaram',
    customerEmail: 'priya.s@example.com',
    customerPhone: '+91 94440 12345',
    shippingAddress: '15 Anna Nagar 3rd Main Rd, Chennai - 600040',
    items: [
      { productId: 'prod-5', name: 'Veg Vanjaram', weight: '1.2 KG', price: 790, quantity: 1 },
      { productId: 'prod-3', name: 'Veg Prawn', weight: '1 KG', price: 750, quantity: 1 },
    ],
    totalAmount: 1540,
    paymentMethod: 'Cash on Delivery',
    status: 'Processing',
    createdAt: '2026-08-11T09:15:00Z',
  },
  {
    id: 'ord-1003',
    orderNumber: 'SKT-9823',
    customerName: 'Kavitha Ramesh',
    customerEmail: 'kavitha.r@example.com',
    customerPhone: '+91 98841 56789',
    shippingAddress: '88 Race Course Road, Coimbatore - 641018',
    items: [
      { productId: 'prod-4', name: 'Veg Chicken', weight: '1 KG', price: 600, quantity: 2 },
      { productId: 'prod-10', name: 'Veg Mutton Kheema Ball', weight: '1 KG', price: 580, quantity: 1 },
    ],
    totalAmount: 1780,
    paymentMethod: 'UPI / Online',
    status: 'Pending',
    createdAt: '2026-08-12T08:45:00Z',
  },
];

export const INITIAL_USERS: UserType[] = [
  {
    id: 'usr-1',
    name: 'Aravind Kumar',
    email: 'aravind@example.com',
    phone: '+91 98765 43210',
    role: 'Customer',
    totalOrders: 4,
    totalSpent: 4850,
    joinedDate: '2026-05-14',
    address: '42 Greenways Road, Adyar, Chennai - 600020',
  },
  {
    id: 'usr-2',
    name: 'Priya Sundaram',
    email: 'priya.s@example.com',
    phone: '+91 94440 12345',
    role: 'Customer',
    totalOrders: 2,
    totalSpent: 3100,
    joinedDate: '2026-06-20',
    address: '15 Anna Nagar 3rd Main Rd, Chennai - 600040',
  },
  {
    id: 'usr-3',
    name: 'Kavitha Ramesh',
    email: 'kavitha.r@example.com',
    phone: '+91 98841 56789',
    role: 'Customer',
    totalOrders: 3,
    totalSpent: 4120,
    joinedDate: '2026-07-02',
    address: '88 Race Course Road, Coimbatore - 641018',
  },
  {
    id: 'usr-4',
    name: 'Sakthi Admin',
    email: 'admin@sakthifrozenfoods.com',
    phone: '+91 99999 00000',
    role: 'Admin',
    totalOrders: 0,
    totalSpent: 0,
    joinedDate: '2026-01-01',
    address: 'Headquarters, Industrial Estate, Guindy, Chennai',
  },
];
