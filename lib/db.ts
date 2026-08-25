import mongoose from 'mongoose';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_USERS, INITIAL_CATEGORIES, ProductType, OrderType, UserType, CategoryType } from './seedData';

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseGlobal: GlobalMongoose | undefined;
  var mockDbProducts: ProductType[] | undefined;
  var mockDbOrders: OrderType[] | undefined;
  var mockDbUsers: UserType[] | undefined;
  var mockDbCategories: CategoryType[] | undefined;
}

let cached = global.mongooseGlobal;

if (!cached) {
  cached = global.mongooseGlobal = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    // Return null to signify running in mock/fallback mode
    return null;
  }

  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.error('MongoDB Connection Error, falling back to local DB:', e);
    return null;
  }

  return cached!.conn;
}

// Memory Store Helpers (Fallback mode)
export function getStoreProducts(): ProductType[] {
  if (!global.mockDbProducts) {
    global.mockDbProducts = [...INITIAL_PRODUCTS];
  }
  return global.mockDbProducts;
}

export function saveStoreProduct(product: ProductType): ProductType {
  const products = getStoreProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  global.mockDbProducts = products;
  return product;
}

export function deleteStoreProduct(id: string): boolean {
  const products = getStoreProducts();
  global.mockDbProducts = products.filter((p) => p.id !== id);
  return true;
}

export function getStoreOrders(): OrderType[] {
  if (!global.mockDbOrders) {
    global.mockDbOrders = [...INITIAL_ORDERS];
  }
  return global.mockDbOrders;
}

export function saveStoreOrder(order: OrderType): OrderType {
  const orders = getStoreOrders();
  const index = orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  global.mockDbOrders = orders;
  return order;
}

export function getStoreUsers(): UserType[] {
  if (!global.mockDbUsers) {
    global.mockDbUsers = [...INITIAL_USERS];
  }
  return global.mockDbUsers;
}

export function getStoreCategories(): CategoryType[] {
  if (!global.mockDbCategories) {
    global.mockDbCategories = [...INITIAL_CATEGORIES];
  }
  return global.mockDbCategories;
}

export function saveStoreCategory(category: CategoryType): CategoryType {
  const categories = getStoreCategories();
  const index = categories.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.unshift(category);
  }
  global.mockDbCategories = categories;
  return category;
}

export function deleteStoreCategory(id: string): boolean {
  const categories = getStoreCategories();
  global.mockDbCategories = categories.filter((c) => c.id !== id);
  return true;
}
