'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { CheckCircle2, ShoppingBag, CreditCard, Truck, ArrowLeft, ShieldCheck, MapPin, Building, Home, HelpCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchApi } from '@/lib/apiConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LocationMapPicker, { LocationData } from '@/components/LocationMapPicker';

declare global {
  interface Window {
    Razorpay: any;
    L: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Structured Address Fields
  const [flatHouse, setFlatHouse] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  useEffect(() => {
    if (cart.length === 0 && !orderConfirmed) {
      router.push('/cart');
    }
  }, [cart, orderConfirmed, router]);

  // Pricing Calculations: Subtotal, Delivery Fee, Convenience Fee (2.5%)
  const subtotal = totalPrice;
  const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 60;
  const convenienceFee = Number((subtotal * 0.025).toFixed(2));
  const grandTotal = Number((subtotal + deliveryFee + convenienceFee).toFixed(2));

  // Handle location selected from Map
  const handleLocationSelect = (loc: LocationData) => {
    setCoordinates({ lat: loc.lat, lng: loc.lng });
    if (loc.road && !streetArea) {
      setStreetArea(loc.road);
    }
    if (loc.suburb || loc.neighbourhood || loc.landmark) {
      setLandmark(loc.landmark || loc.suburb || loc.neighbourhood || '');
    }
    if (loc.city) {
      setCity(loc.city);
    }
    if (loc.state) {
      setState(loc.state);
    }
    if (loc.pincode) {
      setPincode(loc.pincode);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !flatHouse || !streetArea || !city || !pincode) {
      alert('Please fill in all required fields: Name, Phone, House/Flat No, Street/Area, City, and 6-digit Pincode.');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    const fullShippingAddress = `${flatHouse.trim()}, ${streetArea.trim()}${
      landmark.trim() ? `, Landmark: ${landmark.trim()}` : ''
    }, ${city.trim()}, ${state.trim()} - ${pincode.trim()}${
      coordinates ? ` [GPS: ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}]` : ''
    }`;

    setIsSubmitting(true);
    try {
      // 1. Create order in DB and get Razorpay Order ID
      const orderData = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || `${customerPhone}@customer.com`,
          customerPhone,
          shippingAddress: fullShippingAddress,
          landmark: landmark.trim(),
          pincode: pincode.trim(),
          city: city.trim(),
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
        alert('Failed to initialize payment: ' + orderData.error);
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
              alert('Payment Verification Failed!');
            }
          } catch (err) {
            console.error('Verification Error:', err);
            alert('Error verifying payment. Please contact support.');
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail || `${customerPhone}@customer.com`,
          contact: customerPhone,
        },
        theme: {
          color: '#4D583F',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Payment Failed: ' + (response.error?.description || 'Transaction was not completed.'));
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert('Order placement failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="bg-[#4D583F] px-6 sm:px-8 py-5 text-[#FAFAF5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" />
              <h1 className="font-black text-xl sm:text-2xl font-poppins">
                {orderConfirmed ? 'Order Confirmed!' : 'Secure Checkout'}
              </h1>
            </div>
          </div>

          {orderConfirmed ? (
            /* Confirmation View */
            <div className="p-6 sm:p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-[#EAF0E5] text-[#4D583F] rounded-full flex items-center justify-center mx-auto border border-[#4D583F]/20 shadow-md">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A1E16]">Thank You for Your Order!</h2>
              <p className="text-base text-[#3C4136] font-medium">
                Your order <span className="font-mono font-black text-[#26311A]">{orderConfirmed.orderNumber}</span> has been placed successfully.
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
                  <span className="font-extrabold text-[#26311A]">{orderConfirmed.paymentMethod}</span>
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
                  <span className="text-[#26311A] text-xl font-black">₹{orderConfirmed.totalAmount}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#3E4536] font-medium max-w-lg mx-auto pb-4">
                Our dispatch team at Sakthi Frozen Foods will pack your items under strict temperature control (-18°C).
              </p>

              <button
                onClick={() => router.push('/orders')}
                className="py-3.5 px-8 bg-[#4D583F] text-white font-extrabold rounded-xl hover:bg-[#414b35] transition-all shadow-md text-base"
              >
                View My Orders
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-8">
              <form onSubmit={handleSubmitOrder} className="flex-1 space-y-6">
                
                {/* 1. Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#4F534C]/15 pb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4D583F] text-[11px] font-black text-white">1</span>
                    <h3 className="text-base font-black text-[#1A1E16]">Customer Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">Mobile Phone Number *</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-[#4D583F]">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Map & Delivery Location */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-[#4F534C]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4D583F] text-[11px] font-black text-white">2</span>
                      <h3 className="text-base font-black text-[#1A1E16]">Pin Location on Map</h3>
                    </div>
                    <span className="text-[11px] font-bold text-[#4D583F] bg-[#EAF0E5] px-2 py-0.5 rounded-md">
                      Auto-fills address
                    </span>
                  </div>

                  {/* Location Map & Search Picker */}
                  <LocationMapPicker onLocationSelect={handleLocationSelect} />
                </div>

                {/* 3. Detailed Address Form */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-[#4F534C]/15 pb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4D583F] text-[11px] font-black text-white">3</span>
                    <h3 className="text-base font-black text-[#1A1E16]">Delivery Address Details</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">
                        Flat / House No. / Floor / Building Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 302, Green Meadows Apartment"
                        value={flatHouse}
                        onChange={(e) => setFlatHouse(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1E16] mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Opposite Sakthi Hospital / Near Water Tank"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1A1E16] mb-1">City / Town *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Coimbatore"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1A1E16] mb-1">State *</label>
                        <input
                          type="text"
                          required
                          placeholder="Tamil Nadu"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                        />
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF0E5] border border-[#4F534C]/25 text-xs font-bold text-[#1A1E16] focus:outline-none focus:ring-2 focus:ring-[#4D583F] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 border-b border-[#4F534C]/15 pb-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4D583F] text-[11px] font-black text-white">4</span>
                    <h3 className="text-base font-black text-[#1A1E16]">Payment Method</h3>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="font-black text-sm text-[#1A1E16]">Secure Online Payment (Razorpay)</h4>
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5">Pay safely via UPI (GPay, PhonePe, Paytm), Cards, or Netbanking.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 mt-4 bg-[#4D583F] text-white font-black rounded-xl hover:bg-[#3D4732] transition-all shadow-md text-base disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
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
                      <div className="font-black text-xs text-[#26311A] shrink-0">₹{item.price * item.quantity}</div>
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
                      <span className="bg-[#4D583F]/10 text-[#4D583F] text-[10px] px-1.5 py-0.5 rounded font-bold">2.5%</span>
                    </span>
                    <span className="font-black text-[#1A1E16]">₹{convenienceFee}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-black text-[#1A1E16]">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">FREE</span>
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
                  <span className="text-2xl font-black text-[#26311A]">₹{grandTotal}</span>
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

