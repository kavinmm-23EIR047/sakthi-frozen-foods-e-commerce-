'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchApi } from '@/lib/apiConfig';
import { useRouter } from 'next/navigation';

export default function CheckoutModal() {
  const { cart, isCheckoutOpen, setIsCheckoutOpen, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI / Online' | 'Cash on Delivery'>('UPI / Online');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  if (!isCheckoutOpen) return null;

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
      const data = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || `${customerPhone}@customer.com`,
          customerPhone,
          shippingAddress,
          items: cart,
          totalAmount: grandTotal,
          paymentMethod,
        }),
      });

      if (data.success) {
        setOrderConfirmed(data.data);
        clearCart();
      } else {
        alert('Failed to place order: ' + data.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Order placement failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderConfirmed(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1E201D]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAFAF5] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#4F534C]/20 relative">
        {/* Header */}
        <div className="bg-[#4D583F] px-6 py-4 text-[#FAFAF5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {orderConfirmed ? 'Order Confirmed!' : 'Checkout & Shipping'}
            </h3>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderConfirmed ? (
          /* Confirmation View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#EAF0E5] text-[#4D583F] rounded-full flex items-center justify-center mx-auto border border-[#4D583F]/20 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-extrabold text-[#1E201D]">Thank You for Your Order!</h4>
            <p className="text-xs text-[#61665D]">
              Your order <span className="font-bold text-[#4D583F]">{orderConfirmed.orderNumber}</span> has been placed successfully.
            </p>

            <div className="bg-[#E8EEE0] p-4 rounded-xl text-left border border-[#4F534C]/15 space-y-2 text-xs">
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
              <div className="flex justify-between border-t border-[#4F534C]/15 pt-2 font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-[#4D583F]">₹{orderConfirmed.totalAmount}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#61665D]">
              Our dispatch team at Sakthi Frozen Foods will prepare your frozen plant-based meats under strict temperature control!
            </p>

            <button
              onClick={() => {
                handleClose();
                router.push('/orders');
              }}
              className="w-full py-3 bg-[#4D583F] text-white font-bold rounded-xl hover:bg-[#414b35] transition-all shadow-md text-sm"
            >
              View My Orders
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E201D] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E201D] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E201D] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E201D] mb-1">Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="House / Flat No., Street, Landmark, City & Pincode"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E201D] mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI / Online')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'UPI / Online'
                        ? 'bg-[#4D583F] text-[#FAFAF5] border-[#4D583F] shadow-sm'
                        : 'bg-[#E8EEE0] text-[#61665D] border-[#4F534C]/20 hover:border-[#4D583F]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>UPI / Online</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'bg-[#4D583F] text-[#FAFAF5] border-[#4D583F] shadow-sm'
                        : 'bg-[#E8EEE0] text-[#61665D] border-[#4F534C]/20 hover:border-[#4D583F]'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#4F534C]/15 flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-[#61665D]">Total Payables ({cart.length} items)</span>
                <span className="text-lg font-extrabold text-[#4D583F]">₹{grandTotal}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 bg-[#4D583F] text-[#FAFAF5] font-bold rounded-xl hover:bg-[#414b35] transition-all shadow-md text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
