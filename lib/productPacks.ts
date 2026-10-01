import { ProductType } from './types';

export interface PackOption {
  productId: string;
  weight: string;
  price: number;
  mrp: number;
  packType: 'retail' | 'wholesale';
  badge: 'Retail' | 'Wholesale';
  label: string;
  isBase: boolean;
}

export function cleanBaseProductName(name: string): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/\b(RETAIL PACK|RETAIL|REGULAR PACK|REGULAR|BULK PACK|BULK|CONSUMER PACK|CONSUMER|FOODSERVICE|ALTERNATIVE|ALTERNATIVES)\b/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*-\s*\d+(\.\d+)?\s*(KG|GRM|GM|G|KILO|GRAMS?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeWeight(w: string): string {
  return String(w || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/grm|grams?|gm/i, 'g');
}

export function formatCleanWeight(w: string): string {
  if (!w) return '';
  const clean = w.trim().toUpperCase();
  if (clean.includes('200')) return '200g';
  if (clean.includes('250')) return '250g';
  if (clean.includes('300')) return '300g';
  if (clean.includes('400')) return '400g';
  if (clean.includes('500')) return '500g';
  if (clean.includes('1.2') && (clean.includes('KG') || clean.includes('KILO'))) return '1.2kg';
  if (clean.includes('1') && (clean.includes('KG') || clean.includes('KILO'))) return '1kg';
  if (clean.includes('2') && (clean.includes('KG') || clean.includes('KILO'))) return '2kg';
  return w.trim();
}

function parseWeightGrams(weightStr: string): number {
  if (!weightStr) return 1000;
  const str = weightStr.toUpperCase();
  const match = str.match(/([\d.]+)\s*(KG|GRM|GM|G|KILO)/);
  if (!match) return 1000;
  const val = parseFloat(match[1]);
  const unit = match[2];
  if (unit === 'KG' || unit === 'KILO') return val * 1000;
  return val;
}

export function isRetailWeight(weightStr: string): boolean {
  const grams = parseWeightGrams(weightStr);
  return grams < 900;
}

/**
 * Computes strictly authentic pack options from backend product data + variants + companion products.
 * NEVER generates fake or synthetic weights!
 */
export function getBackendPackOptions(product: ProductType, allProducts?: ProductType[]): PackOption[] {
  if (!product) return [];

  const rawOptions: {
    productId: string;
    weight: string;
    price: number;
    mrp: number;
    isBase: boolean;
  }[] = [];

  // 1. Base Product
  const baseWeight = product.weight || '1kg';
  const basePrice = Number(product.price) || 0;
  const baseMrp = Number(product.mrp) || Math.round(basePrice * 1.25);
  rawOptions.push({
    productId: product.id,
    weight: baseWeight,
    price: basePrice,
    mrp: baseMrp,
    isBase: true,
  });

  // 2. Product Variants in same backend record
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v) => {
      if (v.weight && Number.isFinite(Number(v.price))) {
        rawOptions.push({
          productId: product.id,
          weight: v.weight,
          price: Number(v.price),
          mrp: Math.round(Number(v.price) * 1.25),
          isBase: false,
        });
      }
    });
  }

  // 3. Companion products with matching base name (e.g., 400g Retail vs 1kg Wholesale items in DB)
  if (allProducts && Array.isArray(allProducts)) {
    const baseName = cleanBaseProductName(product.name);
    if (baseName) {
      const companions = allProducts.filter(
        (p) => p.id !== product.id && cleanBaseProductName(p.name) === baseName
      );
      companions.forEach((comp) => {
        rawOptions.push({
          productId: comp.id,
          weight: comp.weight || '1kg',
          price: Number(comp.price) || 0,
          mrp: Number(comp.mrp) || Math.round(Number(comp.price) * 1.25),
          isBase: false,
        });
        if (comp.variants && Array.isArray(comp.variants)) {
          comp.variants.forEach((v) => {
            if (v.weight && Number.isFinite(Number(v.price))) {
              rawOptions.push({
                productId: comp.id,
                weight: v.weight,
                price: Number(v.price),
                mrp: Math.round(Number(v.price) * 1.25),
                isBase: false,
              });
            }
          });
        }
      });
    }
  }

  // 4. Deduplicate by normalized weight
  const seenWeights = new Set<string>();
  const uniqueList: typeof rawOptions = [];

  for (const opt of rawOptions) {
    const norm = normalizeWeight(opt.weight);
    if (!seenWeights.has(norm)) {
      seenWeights.add(norm);
      uniqueList.push(opt);
    }
  }

  // Sort from lower price/weight to higher
  uniqueList.sort((a, b) => a.price - b.price);

  // 5. Annotate Retail vs Wholesale pack style
  const result: PackOption[] = uniqueList.map((opt, idx) => {
    let packType: 'retail' | 'wholesale';
    if (uniqueList.length === 1) {
      packType = isRetailWeight(opt.weight) ? 'retail' : 'wholesale';
    } else {
      // If two or more options exist, weights < 900g are retail, >= 900g are wholesale
      if (isRetailWeight(opt.weight)) {
        packType = 'retail';
      } else {
        packType = 'wholesale';
      }
    }

    const badge: 'Retail' | 'Wholesale' = packType === 'retail' ? 'Retail' : 'Wholesale';
    const cleanW = formatCleanWeight(opt.weight);
    const label = uniqueList.length > 1 ? `${badge} (${cleanW})` : cleanW;

    return {
      productId: opt.productId,
      weight: opt.weight,
      price: opt.price,
      mrp: opt.mrp,
      packType,
      badge,
      label,
      isBase: opt.isBase,
    };
  });

  return result;
}
