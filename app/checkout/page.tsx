'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { CheckCircle2, ShoppingBag, CreditCard, Truck, ArrowLeft, ShieldCheck, Lock, UserCheck, LogIn, ArrowRight, Search, ChevronDown, Package, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AddressSearch from '@/components/AddressSearch';
import type { LocationData } from '@/components/AddressSearch';
import { DELIVERY_STATES, DELIVERY_ZONES, getDeliveryCalculation, getDeliveryDistrictsForState, getDeliveryZonesForDistrict } from '@/lib/deliveryRates';
import Link from 'next/link';
import DeliveryLoadingScreen from '@/components/DeliveryLoadingScreen';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, totalPrice, clearCart, isCartLoading } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Structured Address Fields
  const [flatHouse, setFlatHouse] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Coimbatore');
  const [destinationZoneId, setDestinationZoneId] = useState('coimbatore');
  const [destinationQuery, setDestinationQuery] = useState('Coimbatore');
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  // Auto-populate logged-in customer info
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName((prev) => prev || user.name);
      if (user.email) setCustomerEmail((prev) => prev || user.email);
      if (user.phone) {
        const cleanP = user.phone.replace(/\D/g, '').slice(-10);
        setCustomerPhone((prev) => prev || cleanP);
      }
    }
  }, [user, flatHouse, streetArea]);

  useEffect(() => {
    if (!isCartLoading && cart.length === 0 && !orderConfirmed) {
      router.push('/cart');
    }
  }, [cart, isCartLoading, orderConfirmed, router]);

  const selectedDestination = DELIVERY_ZONES.find((zone) => zone.id === destinationZoneId) || null;
  const city = selectedDestination
    ? selectedDestination.id === 'coimbatore'
      ? 'Coimbatore'
      : selectedDestination.name.split(' (')[0]
    : '';
  const availableDistricts = getDeliveryDistrictsForState(state);
  const availableDestinations = getDeliveryZonesForDistrict(state, district);

  // Pricing Calculations: Subtotal, Distance/District-based Delivery Fee, Convenience Fee (2.5%)
  const subtotal = totalPrice;
  const deliveryCalc = useMemo(() => {
    return getDeliveryCalculation({
      subtotal,
      coordinates,
      cityOrDistrictText: city,
      state,
    });
  }, [subtotal, coordinates, city, state]);

  const deliveryFee = deliveryCalc.fee;
  const convenienceFee = Number((subtotal * 0.025).toFixed(2));
  const grandTotal = Number((subtotal + deliveryFee + convenienceFee).toFixed(2));

  // Address search fills the street, coordinates, and PIN for Coimbatore pricing.
  const handleLocationSelect = (loc: LocationData) => {
    setCoordinates({ lat: loc.lat, lng: loc.lng });
    
    // Auto-fill Street/Area
    const streetParts = [loc.road, loc.suburb].filter(Boolean);
    if (streetParts.length > 0) {
      setStreetArea(streetParts.join(', '));
    } else if (loc.displayName) {
      setStreetArea(loc.displayName.split(',').slice(0, 2).join(', ').trim());
    }

    // Auto-fill Landmark / Suburb
    if (loc.landmark || loc.neighbourhood || loc.suburb) {
      setLandmark(loc.landmark || loc.neighbourhood || loc.suburb || '');
    }

    // The selected delivery dropdown controls the destination and pricing zone.
    if (loc.pincode) {
      setPincode(loc.pincode.replace(/\D/g, '').slice(0, 6));
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to complete your checkout and secure order tracking.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!customerName || !customerPhone || !flatHouse || !streetArea || !city || !district || !state || !pincode) {
      alert('Please fill in all required fields: Name, Phone, House/Flat No, Street/Area, City, and 6-digit Pincode.');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    if (!deliveryCalc.isServiceable) {
      alert(!selectedDestination
        ? 'Select one of the listed delivery destinations first.'
        : selectedDestination.id === 'coimbatore'
          ? 'Search and select your Coimbatore street or PIN so we can calculate the distance from the shop.'
          : 'This destination is not currently serviceable. Choose a destination with a listed delivery rate.');
      return;
    }

    const fullShippingAddress = `${flatHouse.trim()}, ${streetArea.trim()}${
      landmark.trim() ? `, Landmark: ${landmark.trim()}` : ''
    }, ${city.trim()}, ${district.trim()}, ${state.trim()} - ${pincode.trim()}${
      coordinates ? ` [GPS: ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}]` : ''
    }`;

    setIsSubmitting(true);
    try {
      // 1. Create order in DB and get Razorpay Order ID
      const orderData = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: (user.email || customerEmail || `${customerPhone}@customer.com`).trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: fullShippingAddress,
          landmark: landmark.trim(),
          pincode: pincode.trim(),
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          coordinates,
          items: cart,
          subtotal,
          deliveryFee,
          convenienceFee,
          totalAmount: grandTotal,
        }),
      });

      if (!orderData.success) {
        alert('Failed to initialize payment: ' + (orderData.error || 'Server error'));
        setIsSubmitting(false);
        return;
      }

      // 2. Initialize Razorpay popup
      const options = {
        key: orderData.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Tb3aRjusts7JYy',
        amount: orderData.razorpayAmount,
        currency: 'INR',
        name: 'Sakthi Frozen Foods',
        description: 'Secure Online Payment',
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          setIsVerifyingPayment(true);
          setPaymentMessage('');
          try {
            const verifyData = await fetchApi('/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.data.id,
              }),
            });

            if (verifyData.success) {
              setOrderConfirmed(verifyData.data);
              clearCart();
            } else {
              setPaymentMessage('Payment could not be verified yet. Your cart is saved; please check your Orders before trying again.');
            }
          } catch (err) {
            console.error('Verification Error:', err);
            setPaymentMessage('We could not confirm the payment response. Your cart is saved; please check your Orders or contact support before paying again.');
          } finally {
            setIsVerifyingPayment(false);
          }
        },
        prefill: {
          name: customerName || user.name,
          email: user.email || customerEmail || `${customerPhone}@customer.com`,
          contact: customerPhone || user.phone,
        },
        theme: {
          color: '#656B4F',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setPaymentMessage('Payment was not confirmed. Your cart is still saved; you can try again.');
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert('Order placement failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading || isSubmitting || isVerifyingPayment) {
    return <DeliveryLoadingScreen message={isVerifyingPayment ? 'Confirming your payment securely' : isSubmitting ? 'Preparing secure checkout' : 'Loading your checkout'} />;
  }

  // Auth Loading Skeleton
  if (authLoading) {
    return <DeliveryLoadingScreen message="Preparing secure checkout" />;
  }

  // Auth Guard: If not logged in and order is not confirmed, show dedicated auth prompt
  if (!user && !orderConfirmed) {
    return (
      <div className="min-h-screen bg-[#F3FBEE] text-[#1E201D] flex flex-col font-sans">
        <Navbar />
        <main className="mx-auto w-full max-w-[540px] px-4 py-12 sm:py-20 flex-1 flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#4F534C]/15 shadow-xl w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center mx-auto shadow-sm border border-[#656B4F]/20">
              <Lock className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block text-xs font-black uppercase tracking-widest text-[#656B4F] bg-[#EAF0E5] px-3 py-1 rounded-full mb-3">
                Secure Order Access
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A1E16] font-poppins">Sign In to Continue</h2>
              <p className="text-xs sm:text-sm text-[#52594B] font-semibold mt-2.5 leading-relaxed">
                Please sign in or create an account before paying. This ensures your Razorpay transaction and delivery status are permanently saved in your dashboard.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login?redirect=/checkout"
                className="w-full py-4 bg-[#656B4F] text-white font-black rounded-2xl hover:bg-[#656B4F] transition-all shadow-md text-base flex items-center justify-center gap-2 group"
              >
                <span>Sign In & Proceed</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register?redirect=/checkout"
                className="w-full py-3.5 bg-[#EAF0E5] text-[#656B4F] font-black rounded-2xl hover:bg-[#dfe7d9] transition-all border border-[#656B4F]/20 text-sm flex items-center justify-center gap-2"
              >
                Create New Account
              </Link>
            </div>

            <div className="pt-4 border-t border-[#4F534C]/15">
              <button
                onClick={() => router.push('/cart')}
                className="text-xs font-bold text-[#61665D] hover:text-[#1A1E16] transition-colors"
              >
                &larr; Return to Cart
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#1E201D] flex flex-col font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-4 sm:py-8 md:py-10 flex-1">
        {!orderConfirmed && (
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-[#3D4533] hover:text-[#1A1E16] font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
        )}

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#4F534C]/15">
          {/* Header */}
          <div className="bg-[#656B4F] px-6 sm:px-8 py-5 text-[#FAFAF5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" />
              <h1 className="font-black text-xl sm:text-2xl font-poppins">
                {orderConfirmed ? 'Order Confirmed!' : 'Secure Checkout'}
              </h1>
            </div>
            {user && !orderConfirmed && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                <UserCheck className="w-4 h-4 text-[#E8F0E5]" />
                <span>Account: {user.name}</span>
              </div>
            )}
          </div>

          {orderConfirmed ? (
            /* Confirmation View */
            <div className="p-6 sm:p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-[#EAF0E5] text-[#656B4F] rounded-full flex items-center justify-center mx-auto border border-[#656B4F]/20 shadow-md">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A1E16]">Thank You for Your Order!</h2>
              <p className="text-base text-[#3C4136] font-medium">
                Your order <span className="font-mono font-black text-[#50563D]">{orderConfirmed.orderNumber}</span> has been placed successfully.
              </p>

              <div className="bg-[#EAF0E5] p-5 sm:p-6 rounded-2xl text-left border border-[#4F534C]/20 space-y-3 text-sm max-w-lg mx-auto shadow-xs">
                <div className="flex justify-between">
                  <span className="text-[#3E4536] font-bold">Customer:</span>
                  <span className="font-extrabold text-[#1A1E16]">{orderConfirmed.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3E4536] font-bold">Phone:</span>
                  <span className="font-extrabold text-[#1A1E16]">{orderConfirmed.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3E4536] font-bold">Delivery Address:</span>
                  <span className="font-bold text-[#1A1E16] text-right max-w-[65%]">{orderConfirmed.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3E4536] font-bold">Payment Method:</span>
                  <span className="font-extrabold text-[#50563D]">{orderConfirmed.paymentMethod}</span>
                </div>
                
                <div className="border-t border-[#4F534C]/20 pt-3 space-y-1.5 text-xs font-bold text-[#3E4536]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1A1E16]">₹{orderConfirmed.subtotal ?? subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee (2.5%)</span>
                    <span className="text-[#1A1E16]">₹{orderConfirmed.convenienceFee ?? convenienceFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-[#1A1E16]">{(orderConfirmed.deliveryFee ?? deliveryFee) === 0 ? 'FREE' : `₹${orderConfirmed.deliveryFee ?? deliveryFee}`}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-[#4F534C]/20 pt-3 font-black text-base">
                  <span className="text-[#1A1E16]">Total Amount Paid:</span>
                  <span className="text-[#50563D] text-xl font-black">₹{orderConfirmed.totalAmount}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#3E4536] font-medium max-w-lg mx-auto pb-4">
                Our dispatch team at Sakthi Frozen Foods will pack your items under strict temperature control (-18°C).
              </p>

              <button
                onClick={() => router.push('/orders')}
                className="py-3.5 px-8 bg-[#656B4F] text-white font-extrabold rounded-xl hover:bg-[#50563D] transition-all shadow-md text-base"
              >
                View My Orders
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-8">
              <form onSubmit={handleSubmitOrder} className="flex-1 space-y-6">
                {paymentMessage && (
                  <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold leading-relaxed text-amber-950">
                    {paymentMessage}{' '}
                    <button type="button" onClick={() => router.push('/orders')} className="underline underline-offset-2">Check order status</button>
                  </div>
                )}
                
                {/* 1. Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#4F534C]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#656B4F] text-[11px] font-black text-white">1</span>
                      <h3 className="text-base font-black text-[#1A1E16]">Customer Information</h3>
                    </div>
                    {user && (
                      <span className="text-[11px] font-bold text-[#50563D] bg-[#EAF0E5] border border-[#656B4F]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Verified Customer
                      </span>
                    )}
                  </div>

                  {user && (
                    <div className="p-3 bg-[#EAF0E5] rounded-xl border border-[#656B4F]/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#3E4536]">Signed in as: </span>
                        <strong className="text-[#1A1E16] font-black">{user.name}</strong>
                        <span className="text-[#656B4F] font-semibold ml-1">({user.email || user.phone})</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">Mobile Phone Number *</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-[#656B4F]">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Select a serviceable delivery destination */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-[#4F534C]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#656B4F] text-[11px] font-black text-white">2</span>
                      <h3 className="text-base font-black text-[#1A1E16]">Where should we deliver?</h3>
                    </div>
                    <span className="text-[11px] font-bold text-[#656B4F] bg-[#EAF0E5] px-2 py-0.5 rounded-md">
                      Rates are matched automatically
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="delivery-state" className="mb-1 block text-xs font-bold text-[#1A1E16]">State *</label>
                      <select
                        id="delivery-state"
                        value={state}
                        onChange={(event) => {
                          setState(event.target.value);
                          setDistrict('');
                          setDestinationZoneId('');
                          setDestinationQuery('');
                          setCoordinates(null);
                        }}
                        className="w-full rounded-xl border border-[#4F534C]/25 bg-white px-3.5 py-3 text-sm font-semibold text-[#1A1E16] outline-none focus:ring-2 focus:ring-[#656B4F]"
                      >
                        {DELIVERY_STATES.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="delivery-district" className="mb-1 block text-xs font-bold text-[#1A1E16]">District *</label>
                      <select
                        id="delivery-district"
                        value={district}
                        disabled={availableDistricts.length === 0}
                        onChange={(event) => {
                          setDistrict(event.target.value);
                          setDestinationZoneId('');
                          setDestinationQuery('');
                          setCoordinates(null);
                        }}
                        className="w-full rounded-xl border border-[#4F534C]/25 bg-white px-3.5 py-3 text-sm font-semibold text-[#1A1E16] outline-none focus:ring-2 focus:ring-[#656B4F] disabled:bg-gray-50"
                      >
                        <option value="">Choose district</option>
                        {availableDistricts.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>

                    <div className="relative">
                      <label htmlFor="delivery-destination" className="mb-1 block text-xs font-bold text-[#1A1E16]">Search destination city *</label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656B4F]" />
                        <input
                          id="delivery-destination"
                          type="text"
                          role="combobox"
                          aria-expanded={destinationOpen}
                          aria-controls="delivery-destination-options"
                          autoComplete="off"
                          placeholder="Type a city or destination"
                          value={destinationQuery}
                          onFocus={() => {
                            setDestinationQuery('');
                            setDestinationOpen(true);
                          }}
                          onChange={(event) => {
                            setDestinationQuery(event.target.value);
                            setDestinationZoneId('');
                            setCoordinates(null);
                            setDestinationOpen(true);
                          }}
                          onBlur={() => setTimeout(() => setDestinationOpen(false), 150)}
                          className="w-full rounded-xl border border-[#4F534C]/25 bg-white py-3 pl-10 pr-3 text-sm font-semibold text-[#1A1E16] outline-none focus:ring-2 focus:ring-[#656B4F]"
                        />
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656B4F]" />
                      </div>
                      {destinationOpen && (
                        <div id="delivery-destination-options" role="listbox" className="absolute left-0 z-40 mt-1 max-h-64 w-max min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[#4F534C]/20 bg-white shadow-xl">
                          {availableDestinations
                            .filter((zone) => `${zone.name} ${zone.aliases.join(' ')}`.toLowerCase().includes(destinationQuery.toLowerCase()))
                            .map((zone) => (
                              <button
                                key={zone.id}
                                type="button"
                                role="option"
                                aria-selected={destinationZoneId === zone.id}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setDestinationZoneId(zone.id);
                                  setDestinationQuery(zone.id === 'coimbatore' ? 'Coimbatore' : zone.name);
                                  setCoordinates(null);
                                  setDestinationOpen(false);
                                }}
                                className="flex w-full min-w-0 items-center justify-between gap-3 border-b border-[#4F534C]/10 px-3.5 py-3 text-left last:border-0 hover:bg-[#EAF0E5]"
                              >
                                <span className="text-sm font-semibold text-[#1A1E16]">{zone.id === 'coimbatore' ? 'Coimbatore (local)' : zone.name}</span>
                                <span className="shrink-0 text-xs font-bold text-[#656B4F]">{zone.id === 'coimbatore' ? '₹40–₹250 by distance' : `₹${zone.price}`}</span>
                              </button>
                            ))}
                          {availableDestinations.length === 0 && (
                            <p className="px-3.5 py-3 text-sm text-[#59604F]">No delivery destinations are listed for this state yet.</p>
                          )}
                          {availableDestinations.length > 0 && !availableDestinations.some((zone) => `${zone.name} ${zone.aliases.join(' ')}`.toLowerCase().includes(destinationQuery.toLowerCase())) && (
                            <p className="px-3.5 py-3 text-sm text-[#59604F]">No matching destination. Try another spelling.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {state === 'Andhra Pradesh' && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">Delivery to Andhra Pradesh is coming soon. Charges will appear once a route is added.</p>
                  )}
                </div>

                {/* 3. Structured Delivery Address */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-[#4F534C]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#656B4F] text-[11px] font-black text-white">3</span>
                      <h3 className="text-base font-black text-[#1A1E16]">Delivery Address Details</h3>
                    </div>
                    <span className="text-[11px] font-bold text-[#656B4F] bg-[#EAF0E5] px-2 py-0.5 rounded-md">
                      {selectedDestination ? 'Destination selected above' : 'Choose a destination above'}
                    </span>
                  </div>

                  {selectedDestination?.id === 'coimbatore' && (
                    <div className="rounded-2xl border border-[#656B4F]/25 bg-white p-4">
                      <AddressSearch
                        onLocationSelect={handleLocationSelect}
                        onLocationSearchChange={() => setCoordinates(null)}
                      />
                    </div>
                  )}

                  {/* Automatically matched destination and delivery rate */}
                  <div className="p-4 rounded-2xl bg-[#EAF0E5] border border-[#656B4F]/25 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-black text-[#1A1E16] flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#656B4F]" />
                        <span>Delivery route and charge</span>
                      </label>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white text-[#656B4F] border border-[#656B4F]/20 w-fit">
                        {!deliveryCalc.isServiceable ? 'Destination required' : deliveryCalc.mode === 'BIKE' ? 'Local delivery' : deliveryCalc.mode === 'BUS' ? 'Bus parcel' : 'Travels parcel'}
                      </span>
                    </div>



                    {/* Active Calculation Banner */}
                    <div className="p-3 bg-white rounded-xl border border-[#656B4F]/20 flex items-start gap-2.5 text-xs">
                      <div className="w-7 h-7 rounded-lg bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-[#1A1E16] flex items-center justify-between gap-2">
                          <span>{deliveryCalc.details}</span>
                          <span className="font-black text-sm text-[#50563D]">
                            {!deliveryCalc.isServiceable ? (
                              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] font-black">{selectedDestination?.id === 'coimbatore' ? 'SEARCH ADDRESS' : 'SELECT CITY'}</span>
                            ) : deliveryCalc.isFree ? (
                              <span className="text-[#50563D] bg-[#EAF0E5] border border-[#656B4F]/20 px-2 py-0.5 rounded text-[11px] font-black">FREE</span>
                            ) : (
                              `₹${deliveryCalc.fee}`
                            )}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#52594B] mt-0.5">
                          {!deliveryCalc.isServiceable ? (
                            selectedDestination?.id === 'coimbatore'
                              ? 'Search a street or PIN to calculate the distance from the shop.'
                              : 'Choose a listed delivery city to see its charge.'
                          ) : deliveryCalc.isFree ? (
                            <span className="text-[#50563D] font-extrabold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-[#656B4F] inline shrink-0" />
                              <span>FREE Delivery applied for order over ₹2999!</span>
                            </span>
                          ) : deliveryCalc.mode === 'BIKE' ? (
                            `Coimbatore rate: ₹10 per km from Sakthi store (minimum ₹40, maximum ₹250)`
                          ) : (
                            `Dispatched via reliable ${deliveryCalc.mode === 'BUS' ? 'Bus' : 'Travels'} parcel service to destination office`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Street & House Address Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">
                        Flat / House No. / Floor / Building Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 302, Green Meadows Apartment, No. 12"
                        value={flatHouse}
                        onChange={(e) => setFlatHouse(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">
                        Street / Area / Locality *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 4th Cross, Gandhi Nagar, Peelamedu"
                        value={streetArea}
                        onChange={(e) => setStreetArea(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">
                        Landmark / Nearest Popular Spot (Recommended)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Opposite Sakthi Hospital / Near Water Tank"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#656B4F]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1A1E16] mb-1">City / Destination</label>
                        <input readOnly value={city} placeholder="Choose destination above" className="w-full rounded-xl border border-[#4F534C]/25 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-[#1A1E16]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1A1E16] mb-1">District</label>
                        <input readOnly value={district} placeholder="Choose district above" className="w-full rounded-xl border border-[#4F534C]/25 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-[#1A1E16]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1A1E16] mb-1">State</label>
                        <input readOnly value={state} className="w-full rounded-xl border border-[#4F534C]/25 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-[#1A1E16]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1A1E16] mb-1">PIN Code (6 digits) *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="641004"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#656B4F] font-mono"
                        />
                      </div>
                    </div>

                    {/* Address Verification Preview */}
                    {(flatHouse || streetArea || city) && (
                      <div className="p-3 bg-[#F4F7F0] rounded-xl border border-[#656B4F]/15 text-xs">
                        <span className="font-bold text-[#656B4F] flex items-center gap-1.5 mb-1">
                          <Package className="w-3.5 h-3.5 text-[#656B4F] shrink-0" />
                          <span>Delivery Slip Address Preview:</span>
                        </span>
                        <p className="text-[#1A1E16] font-semibold leading-relaxed">
                          {[flatHouse, streetArea, landmark ? `(Landmark: ${landmark})` : '', city, district, state, pincode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 border-b border-[#4F534C]/15 pb-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#656B4F] text-[11px] font-black text-white">4</span>
                    <h3 className="text-base font-black text-[#1A1E16]">Payment Method</h3>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-[#656B4F] bg-[#EAF0E5]/70 flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-[#656B4F] shrink-0" />
                    <div>
                      <h4 className="font-black text-sm text-[#1A1E16]">Secure Online Payment (Razorpay)</h4>
                      <p className="text-xs text-[#50563D] font-semibold mt-0.5">Pay safely via UPI (GPay, PhonePe, Paytm), Cards, or Netbanking.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !deliveryCalc.isServiceable}
                  className="w-full py-4 px-6 mt-4 bg-[#656B4F] text-white font-black rounded-xl hover:bg-[#50563D] transition-all shadow-md text-base disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>{isSubmitting ? 'Initializing Payment...' : `Proceed & Pay ₹${grandTotal}`}</span>
                </button>
              </form>

              {/* Order Summary Sidebar */}
              <div className="w-full md:w-80 lg:w-96 bg-[#EAF0E5] rounded-2xl p-5 sm:p-6 border border-[#4F534C]/20 h-fit shadow-xs space-y-5">
                <h3 className="text-base font-black text-[#1A1E16] border-b border-[#4F534C]/20 pb-2">Order Summary</h3>
                
                {/* Items List */}
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.weight}`} className="flex justify-between text-sm items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-xs text-[#1A1E16] truncate">{item.name}</div>
                        <div className="text-[11px] font-bold text-[#3E4536] mt-0.5">{item.weight} × {item.quantity}</div>
                      </div>
                      <div className="font-black text-xs text-[#50563D] shrink-0">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                
                {/* Calculations Breakdown */}
                <div className="pt-3 border-t border-[#4F534C]/20 space-y-2.5 text-xs font-bold text-[#3E4536]">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-black text-[#1A1E16]">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>Convenience Fee</span>
                      <span className="bg-[#656B4F]/10 text-[#656B4F] text-[10px] px-1.5 py-0.5 rounded font-bold">2.5%</span>
                    </span>
                    <span className="font-black text-[#1A1E16]">₹{convenienceFee}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span>Delivery Charges</span>
                      <span className="block text-[10px] text-[#5A6355] font-normal">
                        {!deliveryCalc.isServiceable ? 'Choose destination' : deliveryCalc.mode === 'BIKE' ? 'Bike (Coimbatore)' : deliveryCalc.mode === 'BUS' ? `Bus (${deliveryCalc.zoneName})` : `Travels (${deliveryCalc.zoneName})`}
                      </span>
                    </div>
                    <span className="font-black text-[#1A1E16]">
                      {!deliveryCalc.isServiceable ? (
                        <span className="text-amber-800">{selectedDestination?.id === 'coimbatore' ? 'Search address' : 'Select city'}</span>
                      ) : deliveryFee === 0 ? (
                        <span className="text-[#50563D] bg-[#EAF0E5] border border-[#656B4F]/20 px-2 py-0.5 rounded text-[11px] font-black">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-[#4F534C]/25 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-sm text-[#1A1E16] block">Total to Pay</span>
                    <span className="text-[10px] text-[#4F5547] font-semibold">Incl. all taxes & fees</span>
                  </div>
                  <span className="text-2xl font-black text-[#50563D]">₹{grandTotal}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
