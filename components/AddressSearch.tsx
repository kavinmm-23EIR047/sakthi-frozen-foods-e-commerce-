'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Loader2, MapPin, Search, Sparkles, Navigation, Check } from 'lucide-react';
import { calculateDistanceKm, SHOP_COORDINATES } from '@/lib/deliveryRates';
import {
  searchCoimbatoreLocalities,
  COIMBATORE_MASTER_AREAS,
  type CoimbatoreSearchResult,
} from '@/lib/coimbatoreAreas';

const LOCAL_RADIUS_KM = 25;
const LOCAL_VIEWBOX = '76.67,11.27,77.22,10.82';

export interface LocationData {
  lat: number;
  lng: number;
  displayName: string;
  precision: 'area' | 'map-search' | 'gps';
  accuracyMeters?: number;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AddressSearchProps {
  onLocationSelect: (location: LocationData) => void;
  onLocationSearchChange: () => void;
}

const POPULAR_QUICK_CHIPS = [
  'RS Puram',
  'Gandhipuram',
  'Saibaba Colony',
  'Peelamedu',
  'Saravanampatti',
  'Vadavalli',
  'Thudiyalur',
  'Koundampalayam',
  'Singanallur',
  'Kovaipudur',
];

export default function AddressSearch({
  onLocationSelect,
  onLocationSearchChange,
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState<CoimbatoreSearchResult[]>([]);
  const [osmResults, setOsmResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [selectedPrecision, setSelectedPrecision] = useState<LocationData['precision'] | null>(null);
  const [selectedAccuracy, setSelectedAccuracy] = useState<number | null>(null);
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Instant Local Coimbatore Search (0 ms latency)
  useEffect(() => {
    if (hasSelectedAddress) {
      setLocalResults([]);
      return;
    }

    if (query.trim().length >= 2) {
      const matches = searchCoimbatoreLocalities(query);
      setLocalResults(matches);
    } else {
      setLocalResults([]);
    }
  }, [query, hasSelectedAddress]);

  // Live OpenStreetMap search for specific door/building/street numbers
  useEffect(() => {
    if (hasSelectedAddress || query.trim().length < 3) {
      setOsmResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          format: 'json',
          addressdetails: '1',
          countrycodes: 'in',
          limit: '8',
          viewbox: LOCAL_VIEWBOX,
          bounded: '1',
          q: `${query}, Coimbatore`,
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { 'Accept-Language': 'en' },
          }
        );
        if (response.ok) {
          const text = await response.text();
          let results = [];
          try {
            results = text && text.trim() ? JSON.parse(text) : [];
          } catch {
            results = [];
          }
          if (Array.isArray(results)) {
            const filtered = results.filter((item: any) => {
              const lat = Number(item.lat);
              const lng = Number(item.lon);
              const address = item.address || {};
              const state = String(address.state || '').toLowerCase();
              const distance = calculateDistanceKm(
                SHOP_COORDINATES.lat,
                SHOP_COORDINATES.lng,
                lat,
                lng
              );
              return (
                Number.isFinite(lat) &&
                Number.isFinite(lng) &&
                state.includes('tamil nadu') &&
                distance <= LOCAL_RADIUS_KM
              );
            });
            setOsmResults(filtered);
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.warn('Live address search skipped:', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, hasSelectedAddress]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectMasterArea = (result: CoimbatoreSearchResult) => {
    const location: LocationData = {
      lat: result.lat,
      lng: result.lng,
      displayName: result.displayName,
      precision: 'area',
      road: result.subArea || '',
      suburb: result.areaName,
      neighbourhood: result.subArea || result.areaName,
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: result.pincode,
    };
    setHasSelectedAddress(true);
    setSelectedPrecision('area');
    setSelectedAccuracy(null);
    setQuery(result.title + ', Coimbatore');
    setLocalResults([]);
    setOsmResults([]);
    setIsFocused(false);
    onLocationSelect(location);
  };

  const resolveLiveLocation = async (position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracyMeters = position.coords.accuracy;
    const distance = calculateDistanceKm(SHOP_COORDINATES.lat, SHOP_COORDINATES.lng, lat, lng);

    if (!Number.isFinite(accuracyMeters) || accuracyMeters > 150) {
      setLocationError(`Your device reports GPS accuracy of ±${Math.round(accuracyMeters)} m. Move outdoors and retry, or choose a street/building map result.`);
      setIsLocating(false);
      return;
    }

    if (!Number.isFinite(distance) || distance > LOCAL_RADIUS_KM) {
      setLocationError('Live location is outside the Coimbatore delivery area. Search for a supported destination instead.');
      setIsLocating(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        lat: String(lat),
        lon: String(lng),
        zoom: '18',
        addressdetails: '1',
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: { 'Accept-Language': 'en' },
      });
      if (!response.ok) throw new Error('Could not resolve the live address.');

      const result = await response.json();
      const address = result.address || {};
      const resolvedState = String(address.state || '').toLowerCase();
      const resolvedDistrict = String(address.county || address.state_district || address.city_district || '').toLowerCase();
      if ((resolvedState && !resolvedState.includes('tamil nadu')) || (resolvedDistrict && !resolvedDistrict.includes('coimbatore'))) {
        setLocationError('Live location is not in Coimbatore. Search for a supported destination instead.');
        return;
      }

      const location: LocationData = {
        lat,
        lng,
        displayName: result.display_name || 'Current Coimbatore location',
        precision: 'gps',
        accuracyMeters: Math.round(accuracyMeters),
        road: address.road || address.street || address.pedestrian || '',
        suburb: address.suburb || address.neighbourhood || address.residential || '',
        neighbourhood: address.neighbourhood || address.suburb || '',
        landmark: address.amenity || address.building || '',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: address.postcode || '',
      };
      setHasSelectedAddress(true);
      setSelectedPrecision('gps');
      setSelectedAccuracy(Math.round(accuracyMeters));
      setQuery(location.displayName);
      setLocalResults([]);
      setOsmResults([]);
      setIsFocused(false);
      onLocationSelect(location);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not resolve the live address. Please search for your area.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleUseLiveLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Live location is not available in this browser. Search for your Coimbatore area.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => { void resolveLiveLocation(position); },
      (error) => {
        setIsLocating(false);
        setLocationError(error.code === error.PERMISSION_DENIED
          ? 'Allow location access in your browser, or search for your Coimbatore area.'
          : 'Could not get your live location. Please try again or search for your area.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const selectOsmAddress = (result: any) => {
    const address = result.address || {};
    const resultType = String(result.addresstype || result.type || '').toLowerCase();
    const isAreaResult = ['borough', 'city', 'city_district', 'county', 'district', 'municipality', 'neighbourhood', 'quarter', 'postcode', 'state', 'suburb', 'town', 'village'].includes(resultType);
    const location: LocationData = {
      lat: Number(result.lat),
      lng: Number(result.lon),
      displayName: result.display_name,
      precision: isAreaResult ? 'area' : 'map-search',
      road: address.road || address.street || address.pedestrian || '',
      suburb: address.suburb || address.neighbourhood || address.residential || '',
      landmark: address.amenity || address.building || '',
      city: address.city || address.town || address.village || address.municipality || 'Coimbatore',
      state: address.state || 'Tamil Nadu',
      pincode: address.postcode || '',
    };
    setHasSelectedAddress(true);
    setSelectedPrecision(location.precision);
    setSelectedAccuracy(null);
    setQuery(result.display_name);
    setLocalResults([]);
    setOsmResults([]);
    setIsFocused(false);
    onLocationSelect(location);
  };

  const handleChipClick = (areaName: string) => {
    setHasSelectedAddress(false);
    setSelectedPrecision(null);
    setSelectedAccuracy(null);
    setQuery(areaName);
    onLocationSearchChange();
    setIsFocused(true);
  };

  const hasSuggestions = localResults.length > 0 || osmResults.length > 0;

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="address-search"
          className="block text-xs font-black text-[#1A1E16] flex items-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5 text-[#656B4F]" />
          <span>Search Any Coimbatore Area, Colony, Street or PIN Code</span>
        </label>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
          Coimbatore only · within 25 km
        </span>
      </div>

      <button
        type="button"
        onClick={handleUseLiveLocation}
        disabled={isLocating}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#656B4F]/30 bg-[#EAF0E5] px-3 py-2 text-xs font-bold text-[#50563D] transition-colors hover:bg-[#DDE8D6] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        {isLocating ? 'Finding your location...' : 'Use my live location'}
      </button>
      {locationError && <p role="alert" className="text-xs font-semibold text-red-700">{locationError}</p>}

      {/* Search Input Box */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656B4F]" />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#656B4F]" />
        )}
        <input
          id="address-search"
          type="search"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => {
            setHasSelectedAddress(false);
            setSelectedPrecision(null);
            setSelectedAccuracy(null);
            setQuery(event.target.value);
            onLocationSearchChange();
            setIsFocused(true);
          }}
          placeholder="e.g. RS Puram, DB Road, Gandhipuram, Saibaba Colony, Peelamedu, 641002..."
          autoComplete="off"
          className="w-full rounded-xl border border-[#4F534C]/25 bg-white py-3 pl-10 pr-10 text-sm text-[#1A1E16] outline-none focus:ring-2 focus:ring-[#656B4F] shadow-xs"
        />
      </div>
      {selectedPrecision === 'area' && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          This is an approximate area-centre pin, not your house. Choose a street/building result or use live GPS to continue.
        </p>
      )}
      {selectedPrecision === 'map-search' && (
        <p role="status" className="text-xs font-semibold text-[#50563D]">Map address selected. Check the pin against your exact house before continuing.</p>
      )}
      {selectedPrecision === 'gps' && selectedAccuracy !== null && (
        <p role="status" className="text-xs font-semibold text-[#50563D]">Live GPS pin selected · reported accuracy ±{selectedAccuracy} m.</p>
      )}

      {/* Quick Popular Area Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-bold text-[#61665D] mr-0.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Popular:</span>
        </span>
        {POPULAR_QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#EAF0E5] hover:bg-[#DDE8D6] text-[#50563D] border border-[#656B4F]/20 transition-all cursor-pointer active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && hasSuggestions && (
        <div className="absolute z-50 left-0 right-0 mt-1 flex max-h-80 w-full flex-col overflow-y-auto rounded-2xl border border-[#4F534C]/20 bg-white shadow-2xl divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Master Coimbatore Localities */}
          {localResults.length > 0 && (
            <div className="order-2">
              <div className="px-3 py-1.5 bg-[#F3FBEE] text-[10px] font-black uppercase tracking-wider text-[#50563D] flex items-center justify-between border-b border-[#656B4F]/10">
                <span>Coimbatore Areas & Sub-Localities ({localResults.length})</span>
                <span>Approximate area pins</span>
              </div>
              {localResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMasterArea(item)}
                  className="flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-[#EAF0E5] transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#EAF0E5] group-hover:bg-[#656B4F] text-[#656B4F] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#1A1E16] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-semibold text-[#61665D] truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20">
                      ₹{item.deliveryFee} fee
                    </span>
                    <div className="text-[10px] text-stone-400 font-bold mt-0.5">
                      ~{item.distanceKm} km
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* OpenStreetMap Live GPS Results */}
          {osmResults.length > 0 && (
            <div className="order-1">
              <div className="px-3 py-1.5 bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <span>Street / Building Map Matches</span>
              </div>
              {osmResults.map((item, index) => (
                <button
                  key={`${item.place_id}-${index}`}
                  type="button"
                  onClick={() => selectOsmAddress(item)}
                  className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <span className="text-xs font-medium leading-relaxed text-[#1A1E16]">
                    {item.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-[#59604F] flex items-center gap-1">
        <span>📍 Direct bike delivery across all Coimbatore areas within 25 km from store (Koundampalayam). Delivery fee is ₹10/km (₹40 min to ₹250 max). Free over ₹2999.</span>
      </p>
    </div>
  );
}

