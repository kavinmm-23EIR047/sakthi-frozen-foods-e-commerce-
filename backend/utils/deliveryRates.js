// Official Sakthi Frozen Foods Store Location (Coimbatore)
const SHOP_COORDINATES = {
  lat: 11.0431,
  lng: 76.9335,
  address: 'peons colony, Kalpana Theatre, opposite Edayarpalayam - Koundampalayam Road, Koundampalayam, Coimbatore, Tamil Nadu 641030',
};

// Complete Delivery Rates by Area, District & City
const DELIVERY_ZONES = [
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

const ZONE_STATES = {
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

// Haversine direct distance calculation in KM
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

function calculateCoimbatoreBikeFee(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 40;
  return Math.min(250, Math.max(40, Math.ceil(distanceKm) * 10));
}

function matchZoneFromText(text, state) {
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

function getDeliveryCalculation({ subtotal, coordinates, cityOrDistrictText, state }) {
  const isFree = subtotal >= 2999 && subtotal > 0;

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
      };
    }
  }

  const matched = cityOrDistrictText ? matchZoneFromText(cityOrDistrictText, state) : null;
  if (matched) {
    return {
      fee: isFree ? 0 : matched.price,
      isFree,
      isServiceable: true,
      mode: matched.mode,
      zoneId: matched.id,
      zoneName: matched.name,
    };
  }

  return {
    fee: isFree ? 0 : 60,
    isFree,
    isServiceable: true,
    mode: 'BIKE',
    zoneId: 'standard',
    zoneName: 'Standard Delivery',
  };
}

module.exports = {
  SHOP_COORDINATES,
  DELIVERY_ZONES,
  calculateDistanceKm,
  calculateCoimbatoreBikeFee,
  matchZoneFromText,
  getDeliveryCalculation,
};
