'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { MapPin, Search, Navigation, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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

interface LocationMapPickerProps {
  onLocationSelect: (loc: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
}

export default function LocationMapPicker({ onLocationSelect, initialLocation }: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [geoError, setGeoError] = useState('');

  // Default: Coimbatore / Tamil Nadu or initialLocation
  const defaultCoords = initialLocation || { lat: 11.0168, lng: 76.9558 };

  // Helper to extract address fields from Nominatim response
  const parseNominatimAddress = (data: any, lat: number, lng: number): LocationData => {
    const addr = data.address || {};
    const road = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || '';
    const landmark = addr.landmark || addr.amenity || addr.building || suburb || '';
    const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Coimbatore';
    const state = addr.state || 'Tamil Nadu';
    const pincode = addr.postcode || '';

    return {
      lat,
      lng,
      displayName: data.display_name || `${road}, ${city}`,
      road,
      suburb,
      neighbourhood: addr.neighbourhood || '',
      landmark,
      city,
      state,
      pincode,
    };
  };

  // Reverse geocode lat, lng to address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const locData = parseNominatimAddress(data, lat, lng);
        setSelectedLocation(locData);
        onLocationSelect(locData);
        setGeoError('');
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || typeof window === 'undefined' || !window.L || !mapContainerRef.current) return;

    if (mapInstanceRef.current) return; // already initialized

    const L = window.L;

    // Custom Sakthi Green Pin Icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background-color: #4D583F;
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 3px solid #ffffff;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background-color: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([defaultCoords.lat, defaultCoords.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([defaultCoords.lat, defaultCoords.lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    // Map click event
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });

    // Marker drag event
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      reverseGeocode(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Live Location Search with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=in&limit=5&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Selection from Search Suggestions
  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerInstanceRef.current.setLatLng([lat, lng]);
    }

    const locData = parseNominatimAddress(item, lat, lng);
    setSelectedLocation(locData);
    onLocationSelect(locData);
    setSuggestions([]);
    setSearchQuery(item.display_name.split(',')[0]);
  };

  // GPS Locate Me
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }

        await reverseGeocode(lat, lng);
        setIsGeolocating(false);
      },
      (err) => {
        setIsGeolocating(false);
        setGeoError('Unable to retrieve your location. Please type your address or search above.');
        console.error(err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      {/* Leaflet Stylesheet */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="lazyOnload"
        onLoad={() => setLeafletLoaded(true)}
      />

      {/* Top Search & Locate Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4D583F]">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>
          <input
            type="text"
            placeholder="Search area, landmark, street, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] placeholder:text-[#676E60] focus:outline-none focus:ring-2 focus:ring-[#4D583F] shadow-xs"
          />

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white rounded-xl border border-[#4F534C]/20 shadow-xl overflow-hidden max-h-56 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#EAF0E5] transition-colors border-b last:border-0 border-[#4F534C]/10 flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-[#4D583F] mt-0.5 shrink-0" />
                  <span className="text-xs font-bold text-[#1A1E16] line-clamp-2 leading-snug">
                    {item.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Use GPS Button */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isGeolocating}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#4D583F] hover:bg-[#3D4732] text-white text-xs font-black transition-all shadow-xs shrink-0 disabled:opacity-60"
        >
          {isGeolocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
          <span>{isGeolocating ? 'Locating...' : 'Use Current GPS'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#4F534C]/25 shadow-inner bg-[#EAF0E5]">
        <div ref={mapContainerRef} className="w-full h-52 sm:h-64 z-10" />

        {/* Map instruction overlay */}
        <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#4F534C]/20 shadow-md text-[11px] font-bold text-[#2A3123] flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#4D583F] shrink-0" />
              <span>Tap or drag pin to your exact delivery entrance</span>
            </span>
            {selectedLocation?.pincode && (
              <span className="bg-[#4D583F] text-white text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 ml-2">
                PIN: {selectedLocation.pincode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Location Selected Confirmation Notice */}
      {selectedLocation && (
        <div className="p-2.5 bg-[#EAF0E5] border border-[#4D583F]/20 rounded-xl flex items-center justify-between text-xs font-bold text-[#1A1E16]">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-[#4D583F] shrink-0" />
            <span className="truncate">
              Selected: <span className="font-extrabold text-[#26311A]">{selectedLocation.displayName.split(',').slice(0, 3).join(',')}</span>
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#4D583F] shrink-0 ml-2 bg-white px-2 py-0.5 rounded">
            Auto-filled below
          </span>
        </div>
      )}
    </div>
  );
}
