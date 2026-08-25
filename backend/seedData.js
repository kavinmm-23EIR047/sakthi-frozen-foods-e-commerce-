const INITIAL_PRODUCTS = [
  {
    code: '1', name: 'VEG MUTTON', weight: '1 KG', price: 650, category: 'Mutton Alternatives',
    description: 'Tender 100% plant-based mutton chunks seasoned with traditional authentic spices.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: true
  },
  {
    code: '2', name: 'VEG FISH', weight: '1 KG', price: 650, category: 'Seafood Alternatives',
    description: 'Flaky plant-based fish fillets infused with sea algae minerals.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: true
  },
  {
    code: '3', name: 'VEG PRAWN', weight: '1 KG', price: 750, category: 'Seafood Alternatives',
    description: 'Crispy plant-based jumbo prawns crafted from konjac & soy fiber.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: true
  },
  {
    code: '4', name: 'VEG CHICKEN', weight: '1 KG', price: 600, category: 'Poultry Alternatives',
    description: 'Juicy, high-protein plant-based chicken strips.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: true
  },
  {
    code: '5', name: 'VEG VANJARAM', weight: '1.2 KG', price: 790, category: 'Seafood Alternatives',
    description: 'Premium King Fish (Vanjaram) style plant-based steaks.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: true
  },
  {
    code: '6', name: 'VEG KULAMBU FISH', weight: '1 KG', price: 650, category: 'Seafood Alternatives',
    description: 'Traditional Chettinad style fish curry cuts.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '7', name: 'VEG CHICKEN NUGGETS', weight: '1 KG', price: 580, category: 'Snacks & Starters',
    description: 'Golden crunchy plant-based nuggets packed with pea protein.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: true
  },
  {
    code: '8', name: 'VEG CHICKEN LOLIPOP', weight: '1 KG', price: 580, category: 'Snacks & Starters',
    description: 'Indo-Chinese style veg chicken lolipops on wooden skewers.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '9', name: 'VEG MUTTON CUTLET', weight: '1.2 KG', price: 620, category: 'Snacks & Starters',
    description: 'Herb-infused vegan mutton cutlet patties.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '10', name: 'VEG MUTTON KHEEMA BALL', weight: '1 KG', price: 580, category: 'Mutton Alternatives',
    description: 'Spiced minced vegan mutton meatballs.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '12', name: 'VEG MUTTON', weight: '400 G', price: 280, category: 'Mutton Alternatives',
    description: 'Value pack of tender 100% plant-based mutton chunks.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '13', name: 'VEG FISH', weight: '500 G', price: 340, category: 'Seafood Alternatives',
    description: 'Value pack of flaky plant-based fish fillets.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '14', name: 'VEG PRAWN', weight: '400 G', price: 320, category: 'Seafood Alternatives',
    description: 'Value pack of plant-based prawns.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '15', name: 'VEG CHICKEN', weight: '400 G', price: 260, category: 'Poultry Alternatives',
    description: 'Value pack of plant-based chicken strips.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '16', name: 'VEG LIVER', weight: '450 G', price: 340, category: 'Specialty Meat Alternatives',
    description: 'Rich iron-fortified vegan liver bites.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '17', name: 'VEG CHICKEN NUGGETS', weight: '300 G', price: 220, category: 'Snacks & Starters',
    description: 'Value pack of plant-based nuggets.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '18', name: 'VEG CHICKEN LOLIPOP', weight: '300 G', price: 220, category: 'Snacks & Starters',
    description: 'Value pack of veg chicken lolipops.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '19', name: 'VEG MUTTON CUTLET', weight: '300 G', price: 230, category: 'Snacks & Starters',
    description: 'Value pack of vegan mutton cutlet patties.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '20', name: 'VEG MUTTON KHEEMA BALL', weight: '300 G', price: 220, category: 'Mutton Alternatives',
    description: 'Value pack of vegan mutton meatballs.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '21', name: 'VEG LOLIPOP', weight: '300 G', price: 140, category: 'Snacks & Starters',
    description: 'Delicious veg lolipop for quick snacks.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '22', name: 'VEG CUTLET', weight: '300 G', price: 140, category: 'Snacks & Starters',
    description: 'Classic veg cutlets.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '23', name: 'CORN CHEESE BALLS', weight: '300 G', price: 150, category: 'Snacks & Starters',
    description: 'Crispy corn and cheese balls.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '24', name: 'JALABINO CHEESE BALLS', weight: '300 G', price: 150, category: 'Snacks & Starters',
    description: 'Spicy jalapeno cheese balls.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '25', name: 'GARLIC CHEESE BALLS', weight: '300 G', price: 150, category: 'Snacks & Starters',
    description: 'Flavorful garlic cheese balls.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '26', name: 'PANNER CUTLET', weight: '300 G', price: 160, category: 'Snacks & Starters',
    description: 'Soft and crispy paneer cutlets.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '27', name: 'PANNER LOLIPOP', weight: '300 G', price: 160, category: 'Snacks & Starters',
    description: 'Paneer lolipops for parties.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '28', name: 'PANNER FINGER', weight: '300 G', price: 160, category: 'Snacks & Starters',
    description: 'Crispy paneer fingers.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '29', name: 'VEG SAMOSA', weight: '300 G', price: 120, category: 'Snacks & Starters',
    description: 'Classic vegetable samosa.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '30', name: 'CORN SAMOSA', weight: '300 G', price: 120, category: 'Snacks & Starters',
    description: 'Sweet corn filled samosa.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '31', name: 'VEG SPRING ROLL', weight: '300 G', price: 150, category: 'Snacks & Starters',
    description: 'Crispy vegetable spring rolls.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '32', name: 'SWEET CORN', weight: '1 KG', price: 100, category: 'Snacks & Starters',
    description: 'Frozen sweet corn kernels.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
  {
    code: '33', name: 'GREEN PEAS', weight: '1 KG', price: 130, category: 'Snacks & Starters',
    description: 'Frozen green peas.', stock: 50, image: 'https://via.placeholder.com/600x400?text=Image+Coming+Soon', isPopular: false
  },
];

const INITIAL_ORDERS = [
  {
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
  },
  {
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
  },
  {
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
  },
];

const INITIAL_USERS = [
  {
    name: 'Aravind Kumar',
    email: 'aravind@example.com',
    password: 'password123',
    phone: '+91 98765 43210',
    role: 'Customer',
    totalOrders: 4,
    totalSpent: 4850,
    joinedDate: '2026-05-14',
    address: '42 Greenways Road, Adyar, Chennai - 600020',
  },
  {
    name: 'Priya Sundaram',
    email: 'priya.s@example.com',
    password: 'password123',
    phone: '+91 94440 12345',
    role: 'Customer',
    totalOrders: 2,
    totalSpent: 3100,
    joinedDate: '2026-06-20',
    address: '15 Anna Nagar 3rd Main Rd, Chennai - 600040',
  },
  {
    name: 'Kavitha Ramesh',
    email: 'kavitha.r@example.com',
    password: 'password123',
    phone: '+91 98841 56789',
    role: 'Customer',
    totalOrders: 3,
    totalSpent: 4120,
    joinedDate: '2026-07-02',
    address: '88 Race Course Road, Coimbatore - 641018',
  },
  {
    name: 'Sakthi Admin',
    email: 'admin@sakthifrozenfoods.com',
    password: 'adminpassword',
    phone: '+91 99999 00000',
    role: 'Admin',
    totalOrders: 0,
    totalSpent: 0,
    joinedDate: '2026-01-01',
    address: 'Headquarters, Industrial Estate, Guindy, Chennai',
  },
];

module.exports = {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_USERS,
};
