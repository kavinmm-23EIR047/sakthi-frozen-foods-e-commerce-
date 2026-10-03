// Official Sakthi Frozen Foods Store Location (Coimbatore)
export const SHOP_COORDINATES = {
  lat: 11.0431204487083,
  lng: 76.81346682338442,
  address: 'peons colony, Kalpana Theatre, opposite Edayarpalayam - Koundampalayam Road, Koundampalayam, Coimbatore, Tamil Nadu 641030',
};

export type DeliveryMode = 'BIKE' | 'BUS' | 'TRAVELS';

export interface DeliveryZone {
  id: string;
  name: string;
  category: 'COIMBATORE' | 'BUS' | 'TRAVELS';
  mode: DeliveryMode;
  price: number;
  aliases: string[];
  notes?: string;
}

// Complete Delivery Rates by Area, District & City
export const DELIVERY_ZONES: DeliveryZone[] = [
  // 1. Coimbatore Local 25 KM Radius (Bike Delivery)
  {
    id: 'coimbatore',
    name: 'Coimbatore (Within 25 KM)',
    category: 'COIMBATORE',
    mode: 'BIKE',
    price: 40, // Base Min ₹40, Max ₹250 (calculated via GPS distance)
    aliases: [
      'coimbatore', 'kovai', 'koundampalayam', 'peons colony', 'puens colony', 'kalpana theatre', 'edayarpalayam', 'tank road', 'kavundampalayam',
      'peelamedu', 'rs puram', 'gandhipuram', 'saravanampatti', 'singanallur', 'saibaba colony',
      'thudiyalur', 'kuniyamuthur', 'ondipudur', 'kalapatti', 'vilankurichi',
      'ganapathy', 'race course', 'vadavalli', 'hopes',
      'sukrawarpet', 'town hall', 'tatabad', 'selvapuram', 'perur', 'chettipalayam'
    ],
    notes: 'Direct doorstep bike delivery (₹40 min to ₹250 max based on GPS distance)',
  },

  // 2. Bus Delivery Hubs - ₹100 Group
  { id: 'udumalaipettai', name: 'Udumalaipettai', category: 'BUS', mode: 'BUS', price: 100, aliases: ['udumalaipettai', 'udumalapettai', 'udumalpet', 'udumalai'], notes: 'Bus Parcel Service' },
  { id: 'pollachi', name: 'Pollachi', category: 'BUS', mode: 'BUS', price: 100, aliases: ['pollachi'], notes: 'Bus Parcel Service' },
  { id: 'mettupalayam', name: 'Mettupalayam', category: 'BUS', mode: 'BUS', price: 100, aliases: ['mettupalayam', 'mtp'], notes: 'Bus Parcel Service' },
  { id: 'palakkad', name: 'Palakkad', category: 'BUS', mode: 'BUS', price: 100, aliases: ['palakkad', 'palghat'], notes: 'Bus Parcel Service' },

  // 3. Bus Delivery Hubs - ₹120 Group
  { id: 'avinashi', name: 'Avinashi', category: 'BUS', mode: 'BUS', price: 120, aliases: ['avinashi'], notes: 'Bus Parcel Service' },
  { id: 'tiruppur', name: 'Tiruppur', category: 'BUS', mode: 'BUS', price: 120, aliases: ['tiruppur', 'tirupur'], notes: 'Bus Parcel Service' },
  { id: 'palladam', name: 'Palladam', category: 'BUS', mode: 'BUS', price: 120, aliases: ['palladam'], notes: 'Bus Parcel Service' },
  { id: 'kangeyam', name: 'Kangeyam', category: 'BUS', mode: 'BUS', price: 120, aliases: ['kangeyam', 'kangayam'], notes: 'Bus Parcel Service' },

  // 4. Bus Delivery Hubs - ₹150 Group
  { id: 'perunthurai', name: 'Perunthurai', category: 'BUS', mode: 'BUS', price: 150, aliases: ['perunthurai', 'perundurai'], notes: 'Bus Parcel Service' },
  { id: 'erode', name: 'Erode', category: 'BUS', mode: 'BUS', price: 150, aliases: ['erode'], notes: 'Bus Parcel Service' },
  { id: 'sathy', name: 'Sathy (Sathyamangalam)', category: 'BUS', mode: 'BUS', price: 150, aliases: ['sathy', 'sathyamangalam'], notes: 'Bus Parcel Service' },
  { id: 'gobi', name: 'Gobi (Gobichettipalayam)', category: 'BUS', mode: 'BUS', price: 150, aliases: ['gobi', 'gobichettipalayam'], notes: 'Bus Parcel Service' },
  { id: 'ooty', name: 'Ooty (Udhagamandalam)', category: 'BUS', mode: 'BUS', price: 150, aliases: ['ooty', 'udhagamandalam', 'nilgiris'], notes: 'Bus Parcel Service' },
  { id: 'coonoor', name: 'Coonoor', category: 'BUS', mode: 'BUS', price: 150, aliases: ['coonoor'], notes: 'Bus Parcel Service' },
  { id: 'kotagiri', name: 'Kotagiri', category: 'BUS', mode: 'BUS', price: 150, aliases: ['kotagiri'], notes: 'Bus Parcel Service' },
  { id: 'thrissur', name: 'Thrissur', category: 'BUS', mode: 'BUS', price: 150, aliases: ['thrissur', 'trichur'], notes: 'Bus Parcel Service' },
  { id: 'kochi', name: 'Kochi (Cochin)', category: 'BUS', mode: 'BUS', price: 150, aliases: ['kochi', 'cochin', 'ernakulam'], notes: 'Bus Parcel Service' },
  { id: 'dindigul', name: 'Dindukal (Dindigul)', category: 'BUS', mode: 'BUS', price: 150, aliases: ['dindukal', 'dindigul'], notes: 'Bus Parcel Service' },
  { id: 'palani', name: 'Palani', category: 'BUS', mode: 'BUS', price: 150, aliases: ['palani'], notes: 'Bus Parcel Service' },
  { id: 'madurai', name: 'Madurai', category: 'BUS', mode: 'BUS', price: 150, aliases: ['madurai'], notes: 'Bus Parcel Service' },
  { id: 'theni', name: 'Theni', category: 'BUS', mode: 'BUS', price: 150, aliases: ['theni'], notes: 'Bus Parcel Service' },
  { id: 'salem', name: 'Selam (Salem)', category: 'BUS', mode: 'BUS', price: 150, aliases: ['selam', 'salem'], notes: 'Bus Parcel Service' },
  { id: 'namakkal', name: 'Namakkal', category: 'BUS', mode: 'BUS', price: 150, aliases: ['namakkal'], notes: 'Bus Parcel Service' },
  { id: 'karur', name: 'Karur', category: 'BUS', mode: 'BUS', price: 150, aliases: ['karur'], notes: 'Bus Parcel Service' },
  { id: 'krishnagiri', name: 'Krishnagiri', category: 'BUS', mode: 'BUS', price: 150, aliases: ['krishnagiri'], notes: 'Bus Parcel Service' },
  { id: 'hosur', name: 'Hosur', category: 'BUS', mode: 'BUS', price: 150, aliases: ['hosur'], notes: 'Bus Parcel Service' },

  // 5. Travels Delivery Hubs - ₹150 Group
  { id: 'tiruchi', name: 'Tiruchi (Trichy)', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['tiruchi', 'trichy', 'tiruchirappalli'], notes: 'Travels Parcel Service' },
  { id: 'ramnad', name: 'Ramnad (Ramanathapuram)', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['ramnad', 'ramanathapuram'], notes: 'Travels Parcel Service' },
  { id: 'rameswaram', name: 'Rameswaram', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['rameswaram'], notes: 'Travels Parcel Service' },
  { id: 'karaikudi', name: 'Karaikudi', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['karaikudi', 'karakudi'], notes: 'Travels Parcel Service' },
  { id: 'thanjavur', name: 'Thanjavoor (Thanjavur)', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['thanjavoor', 'thanjavur', 'tanjore'], notes: 'Travels Parcel Service' },
  { id: 'thirunelveli', name: 'Thirunelveli', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['thirunelveli', 'tirunelveli', 'nellai'], notes: 'Travels Parcel Service' },
  { id: 'thoothukudi', name: 'Thoothukudi (Tuticorin)', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['thoothukudi', 'tuticorin'], notes: 'Travels Parcel Service' },
  { id: 'kanniyakumari', name: 'Kanniyakumari', category: 'TRAVELS', mode: 'TRAVELS', price: 150, aliases: ['kanniyakumari', 'kanyakumari', 'nagercoil'], notes: 'Travels Parcel Service' },

  // 6. Travels Delivery Hubs - ₹180 Group
  { id: 'bengaluru', name: 'Bengaluru', category: 'TRAVELS', mode: 'TRAVELS', price: 180, aliases: ['bengaluru', 'bangalore'], notes: 'Travels Parcel Service' },
];

export const DELIVERY_STATES = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'] as const;

const ZONE_STATES: Record<string, (typeof DELIVERY_STATES)[number]> = {
  coimbatore: 'Tamil Nadu',
  udumalaipettai: 'Tamil Nadu', pollachi: 'Tamil Nadu', mettupalayam: 'Tamil Nadu',
  avinashi: 'Tamil Nadu', tiruppur: 'Tamil Nadu', palladam: 'Tamil Nadu', kangeyam: 'Tamil Nadu',
  perunthurai: 'Tamil Nadu', erode: 'Tamil Nadu', sathy: 'Tamil Nadu', gobi: 'Tamil Nadu',
  ooty: 'Tamil Nadu', coonoor: 'Tamil Nadu', kotagiri: 'Tamil Nadu', dindigul: 'Tamil Nadu',
  palani: 'Tamil Nadu', madurai: 'Tamil Nadu', theni: 'Tamil Nadu', salem: 'Tamil Nadu',
  namakkal: 'Tamil Nadu', karur: 'Tamil Nadu', krishnagiri: 'Tamil Nadu', hosur: 'Tamil Nadu',
  tiruchi: 'Tamil Nadu', ramnad: 'Tamil Nadu', rameswaram: 'Tamil Nadu', karaikudi: 'Tamil Nadu',
  thanjavur: 'Tamil Nadu', thirunelveli: 'Tamil Nadu', thoothukudi: 'Tamil Nadu', kanniyakumari: 'Tamil Nadu',
  palakkad: 'Kerala', thrissur: 'Kerala', kochi: 'Kerala', bengaluru: 'Karnataka',
};

export function getDeliveryZonesForState(state: string): DeliveryZone[] {
  return DELIVERY_ZONES.filter((zone) => ZONE_STATES[zone.id] === state);
}

const ZONE_DISTRICTS: Record<string, string> = {
  coimbatore: 'Coimbatore', udumalaipettai: 'Tiruppur', pollachi: 'Coimbatore', mettupalayam: 'Coimbatore',
  avinashi: 'Tiruppur', tiruppur: 'Tiruppur', palladam: 'Tiruppur', kangeyam: 'Tiruppur',
  perunthurai: 'Erode', erode: 'Erode', sathy: 'Erode', gobi: 'Erode',
  ooty: 'Nilgiris', coonoor: 'Nilgiris', kotagiri: 'Nilgiris', dindigul: 'Dindigul', palani: 'Dindigul',
  madurai: 'Madurai', theni: 'Theni', salem: 'Salem', namakkal: 'Namakkal', karur: 'Karur',
  krishnagiri: 'Krishnagiri', hosur: 'Krishnagiri', tiruchi: 'Tiruchirappalli', ramnad: 'Ramanathapuram',
  rameswaram: 'Ramanathapuram', karaikudi: 'Sivaganga', thanjavur: 'Thanjavur', thirunelveli: 'Tirunelveli',
  thoothukudi: 'Thoothukudi', kanniyakumari: 'Kanniyakumari', palakkad: 'Palakkad', thrissur: 'Thrissur',
  kochi: 'Ernakulam', bengaluru: 'Bengaluru Urban',
};

export function getDeliveryDistrictsForState(state: string): string[] {
  const districts = getDeliveryZonesForState(state)
    .map((zone) => ZONE_DISTRICTS[zone.id])
    .filter((district): district is string => Boolean(district));
  return Array.from(new Set(districts)).sort();
}

export function getDeliveryZonesForDistrict(state: string, district: string): DeliveryZone[] {
  return getDeliveryZonesForState(state).filter((zone) => ZONE_DISTRICTS[zone.id] === district);
}

// Haversine direct distance calculation in KM
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Coimbatore local delivery: ₹10 per started kilometre, minimum ₹40, maximum ₹250.
export function calculateCoimbatoreBikeFee(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 40;
  return Math.min(250, Math.max(40, Math.ceil(distanceKm) * 10));
}

// Match Zone by city name, address text, or district
export function matchZoneFromText(text: string, state?: string): DeliveryZone | null {
  if (!text) return null;
  const clean = text.toLowerCase().trim();
  for (const zone of DELIVERY_ZONES) {
    if (state && ZONE_STATES[zone.id] !== state) continue;
    if (zone.aliases.some((alias) => clean.includes(alias))) {
      return zone;
    }
  }
  return null;
}

export interface DeliveryCalculationResult {
  fee: number;
  isFree: boolean;
  isServiceable: boolean;
  mode: DeliveryMode;
  zoneId: string;
  zoneName: string;
  distanceKm?: number;
  details: string;
  notes: string;
}

// Comprehensive Delivery Charge Calculation
export function getDeliveryCalculation({
  subtotal,
  coordinates,
  cityOrDistrictText,
  state,
}: {
  subtotal: number;
  coordinates?: { lat: number; lng: number } | null;
  cityOrDistrictText?: string;
  state?: string;
}): DeliveryCalculationResult {
  // Free delivery threshold: subtotal >= 2999
  const isFree = subtotal >= 2999 && subtotal > 0;

  // A recognized city destination takes precedence over any stale GPS location.
  const matchedZone = cityOrDistrictText ? matchZoneFromText(cityOrDistrictText, state) : null;
  if (matchedZone && matchedZone.id !== 'coimbatore') {
    const zone = matchedZone;
    return {
      fee: isFree ? 0 : zone.price,
      isFree,
      isServiceable: true,
      mode: zone.mode,
      zoneId: zone.id,
      zoneName: zone.name,
      details: `${zone.mode === 'BUS' ? 'Bus' : 'Travels'} Parcel Delivery to ${zone.name}`,
      notes: zone.notes || 'Parcel Service',
    };
  }

  // 1. An exact searched location inside the local radius gets doorstep delivery.
  if ((!state || state === 'Tamil Nadu') && coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
    const dist = calculateDistanceKm(
      SHOP_COORDINATES.lat,
      SHOP_COORDINATES.lng,
      coordinates.lat,
      coordinates.lng
    );

    if (dist <= 25) {
      const bikeFee = calculateCoimbatoreBikeFee(dist);
      return {
        fee: isFree ? 0 : bikeFee,
        isFree,
        isServiceable: true,
        mode: 'BIKE',
        zoneId: 'coimbatore',
        zoneName: 'Coimbatore (Within 25 KM)',
        distanceKm: Number(dist.toFixed(1)),
        details: `Doorstep delivery (${dist.toFixed(1)} km from Sakthi Store)`,
        notes: '₹10 per km (₹40 minimum, ₹250 maximum)',
      };
    }
  }

  // No published rate matches this city, or Coimbatore has no verified local pin.
  return {
    fee: 0,
    isFree: false,
    isServiceable: false,
    mode: 'BIKE',
    zoneId: 'unavailable',
    zoneName: 'Delivery rate unavailable',
    details: 'Choose a listed destination to see the delivery charge',
    notes: 'Coimbatore requires a searched address within 25 km. Other cities use the published destination rates.',
  };
}
