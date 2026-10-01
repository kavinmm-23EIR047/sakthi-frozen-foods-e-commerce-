'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { calculateDistanceKm, SHOP_COORDINATES } from '@/lib/deliveryRates';

const LOCAL_RADIUS_KM = 25;
const LOCAL_VIEWBOX = '76.67,11.27,77.22,10.82';

export interface LocationData {
  lat: number;
  lng: number;
  displayName: string;
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

export default function AddressSearch({ onLocationSelect, onLocationSearchChange }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);

  useEffect(() => {
    if (hasSelectedAddress || query.trim().length < 3) {
      setSuggestions([]);
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
          limit: '10',
          viewbox: LOCAL_VIEWBOX,
          bounded: '1',
          q: query,
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' },
        });
        if (response.ok) {
          const text = await response.text();
          let results = [];
          try {
            results = text && text.trim() ? JSON.parse(text) : [];
          } catch {
            results = [];
          }
          if (Array.isArray(results)) {
            setSuggestions(results.filter((item: any) => {
              const lat = Number(item.lat);
              const lng = Number(item.lon);
              const address = item.address || {};
              const state = String(address.state || '').toLowerCase();
              const distance = calculateDistanceKm(SHOP_COORDINATES.lat, SHOP_COORDINATES.lng, lat, lng);
              return Number.isFinite(lat) && Number.isFinite(lng) &&
                state.includes('tamil nadu') && distance <= LOCAL_RADIUS_KM;
            }));
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.warn('Address search failed:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, hasSelectedAddress]);

  const selectAddress = (result: any) => {
    const address = result.address || {};
    const location: LocationData = {
      lat: Number(result.lat),
      lng: Number(result.lon),
      displayName: result.display_name,
      road: address.road || address.street || address.pedestrian || '',
      suburb: address.suburb || address.neighbourhood || address.residential || '',
      landmark: address.amenity || address.building || '',
      city: address.city || address.town || address.village || address.municipality || address.county || address.state_district || '',
      state: address.state || '',
      pincode: address.postcode || '',
    };
    setHasSelectedAddress(true);
    setQuery(result.display_name);
    setSuggestions([]);
    onLocationSelect(location);
  };

  return (
    <div className="relative">
      <label htmlFor="address-search" className="mb-1 block text-xs font-bold text-[#1A1E16]">
        Search a Coimbatore street, landmark or PIN code
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656B4F]" />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#656B4F]" />}
        <input
          id="address-search"
          type="search"
          value={query}
          onChange={(event) => {
            setHasSelectedAddress(false);
            setQuery(event.target.value);
            onLocationSearchChange();
          }}
          placeholder="Search within 25 km of the Coimbatore shop"
          autoComplete="off"
          className="w-full rounded-xl border border-[#4F534C]/25 bg-white py-3 pl-10 pr-10 text-sm text-[#1A1E16] outline-none focus:ring-2 focus:ring-[#656B4F]"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#4F534C]/20 bg-white shadow-xl">
          {suggestions.map((item, index) => (
            <button
              key={`${item.place_id}-${index}`}
              type="button"
              onClick={() => selectAddress(item)}
              className="flex w-full items-start gap-2 border-b border-[#4F534C]/10 px-3 py-3 text-left last:border-0 hover:bg-[#EAF0E5]"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#656B4F]" />
              <span className="text-xs font-medium leading-relaxed text-[#1A1E16]">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-1 text-[11px] text-[#59604F]">Only Tamil Nadu addresses within 25 km of the shop are shown. Select a result to calculate the local delivery charge.</p>
    </div>
  );
}
