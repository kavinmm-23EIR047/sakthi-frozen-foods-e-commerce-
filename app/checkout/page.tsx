'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { CheckCircle2, ShoppingBag, CreditCard, Truck, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchApi } from '@/lib/apiConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  useEffect(() => {
    if (cart.length === 0 && !orderConfirmed) {
      router.push('/cart');
    }
  }, [cart, orderConfirmed, router]);

  const deliveryFee = totalPrice >= 999 ? 0 : 60;
  const grandTotal = totalPrice + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) {
      alert('Please fill in your Name, Phone Number, and Shipping Address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create order in DB and get Razorpay Order ID
      const orderData = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || `${customerPhone}@customer.com`,
          customerPhone,
          shippingAddress,
          items: cart,
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyIdHere',
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
                orderId: orderData.data.id
              })
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
        alert('Payment Failed: ' + response.error.description);
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
    <div className="min-h-screen bg-[#E8EEE0] text-[#1E201D] flex flex-col font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className="site-shell py-6 sm:py-8 md:py-10 flex-1">
        {!orderConfirmed && (
          <button 
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-[#61665D] hover:text-[#4D583F] font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
        )}

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#4F534C]/15">
          {/* Header */}
          <div className="bg-[#4D583F] px-8 py-6 text-[#FAFAF5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" />
              <h1 className="font-black text-2xl font-poppins">
                {orderConfirmed ? 'Order Confirmed!' : 'Secure Checkout'}
              </h1>
            </div>
          </div>

          {orderConfirmed ? (
            /* Confirmation View */
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-[#EAF0E5] text-[#4D583F] rounded-full flex items-center justify-center mx-auto border border-[#4D583F]/20 shadow-md">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#1E201D]">Thank You for Your Order!</h2>
              <p className="text-base text-[#61665D]">
                Your order <span className="font-bold text-[#4D583F]">{orderConfirmed.orderNumber}</span> has been placed successfully.
              </p>

              <div className="bg-[#E8EEE0] p-6 rounded-2xl text-left border border-[#4F534C]/15 space-y-3 text-sm max-w-lg mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#61665D]">Customer:</span>
                  <span className="font-bold text-[#1E201D]">{orderConfirmed.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#61665D]">Phone:</span>
                  <span className="font-bold text-[#1E201D]">{orderConfirmed.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#61665D]">Payment Method:</span>
                  <span className="font-bold text-[#4D583F]">{orderConfirmed.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t border-[#4F534C]/15 pt-3 font-bold text-base mt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#4D583F]">₹{orderConfirmed.totalAmount}</span>
                </div>
              </div>

              <p className="text-sm text-[#61665D] max-w-lg mx-auto pb-4">
                Our dispatch team at Sakthi Frozen Foods will prepare your frozen plant-based meats under strict temperature control! You'll receive updates via SMS shortly.
              </p>

              <button
                onClick={() => router.push('/orders')}
                className="py-4 px-10 bg-[#4D583F] text-white font-bold rounded-2xl hover:bg-[#414b35] transition-all shadow-lg text-lg"
              >
                View My Orders
              </button>
            </div>
          ) : (
            /* Checkout Form */
          <div className="p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-8">
              <form onSubmit={handleSubmitOrder} className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1E201D] mb-4">Contact & Delivery Info</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#1E201D] mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-sm text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#1E201D] mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-sm text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#1E201D] mb-1.5">Email Address</label>
                        <input
                          type="email"
                          placeholder="name@example.com (Optional)"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-sm text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#1E201D] mb-1.5">Delivery Address *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="House / Flat No., Street, Landmark, City & Pincode"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-sm text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-lg font-bold text-[#1E201D] mb-4">Payment Method</h3>
                  <div className="p-5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center text-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    <h4 className="font-extrabold text-[#1E201D]">Secure Online Payment</h4>
                    <p className="text-xs text-emerald-700 font-medium">Pay safely via UPI, Credit/Debit Cards, Netbanking using Razorpay.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 mt-4 bg-[#4D583F] text-[#FAFAF5] font-black rounded-2xl hover:bg-[#414b35] transition-all shadow-lg text-lg disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span className="truncate">{isSubmitting ? 'Processing Order...' : `Confirm & Pay ₹${grandTotal}`}</span>
                </button>
              </form>

              {/* Order Summary Sidebar */}
              <div className="w-full md:w-1/3 bg-[#E8EEE0] rounded-2xl p-6 border border-[#4F534C]/15 h-fit">
                <h3 className="text-base font-bold text-[#1E201D] mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.weight}`} className="flex justify-between text-sm">
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-[#1E201D] truncate">{item.name}</div>
                        <div className="text-xs text-[#61665D]">{item.weight} × {item.quantity}</div>
                      </div>
                      <div className="font-bold text-[#4D583F]">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-[#4F534C]/15 space-y-2 text-sm">
                  <div className="flex justify-between text-[#61665D]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#1E201D]">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-[#61665D]">
                    <span>Delivery</span>
                    <span className="font-bold text-[#1E201D]">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-[#4F534C]/15 flex justify-between items-center">
                  <span className="font-bold text-[#1E201D]">Total to Pay</span>
                  <span className="text-2xl font-black text-[#4D583F]">₹{grandTotal}</span>
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
