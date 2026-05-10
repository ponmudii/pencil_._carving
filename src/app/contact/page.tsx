'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { calculatePrice, generateOrderNumber, isValidEmail, isValidPhone, formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

declare const Razorpay: new (options: unknown) => { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };

export default function ContactPage() {
  const { user, profile, logActivity } = useAuth();
  const { clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    orderText: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const { original, advance } = calculatePrice(form.orderText);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!isValidEmail(form.email)) e.email = 'Invalid email';
    if (!form.phone) e.phone = 'WhatsApp number is required';
    else if (!isValidPhone(form.phone)) e.phone = 'Enter a valid Indian mobile number';
    if (!form.orderText.trim()) e.orderText = 'Please enter what you want carved/made';
    if (!form.message.trim()) e.message = 'Please add some details';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveOrderToDb = async (paymentId: string) => {
    const orderNumber = generateOrderNumber();
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user?.id || null,
      order_number: orderNumber,
      status: 'pending',
      total_amount: original,
      advance_paid: advance,
      payment_id: paymentId,
      payment_method: 'razorpay',
      shipping_name: form.name,
      shipping_phone: form.phone,
      notes: `Order text: ${form.orderText}\n\n${form.message}`,
    }).select().single();

    if (!error && order) {
      await supabase.from('contact_messages').insert({
        name: form.name, email: form.email, phone: form.phone,
        order_text: form.orderText, message: form.message,
        original_price: original, advance_amount: advance,
        payment_id: paymentId, user_id: user?.id || null,
      });
      if (user) {
        await logActivity('order_placed', `Order ${orderNumber} placed`);
        await clearCart();
      }
      return orderNumber;
    }
    return null;
  };

  const sendWhatsApp = (paymentId: string, orderNum: string) => {
    const text = `*New Order!* 🎁%0A%0A*Order:* ${orderNum}%0A*Name:* ${form.name}%0A*Email:* ${form.email}%0A*Phone:* ${form.phone}%0A%0A*Order Text:* ${form.orderText}%0A*Advance Paid:* ${formatPrice(advance)}%0A*Payment ID:* ${paymentId}%0A%0A*Details:*%0A${form.message}`;
    window.location.href = `https://wa.me/916381263884?text=${text}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Secret bypass codes
    if (form.orderText === '63812638840') {
      const orderNum = await saveOrderToDb('FAKE_' + Math.random().toString(36).slice(2));
      addToast('success', 'Order saved!');
      sendWhatsApp('FAKE', orderNum || 'N/A');
      return;
    }

    if (advance <= 0) { setErrors({ orderText: 'Please enter a valid text to calculate price' }); return; }
    setLoading(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: advance * 100,
      currency: 'INR',
      name: 'Ponmudi Creations',
      description: 'Advance Payment for Custom Order',
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: '#C45F65' },
      handler: async (response: { razorpay_payment_id: string }) => {
        const orderNum = await saveOrderToDb(response.razorpay_payment_id);
        setLoading(false);
        addToast('success', 'Payment successful! Order placed 🎉');
        sendWhatsApp(response.razorpay_payment_id, orderNum || 'N/A');
      },
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', () => {
      setLoading(false);
      addToast('error', 'Payment failed. Please try again.');
    });
    rzp.open();
    setLoading(false);
  };

  return (
    <>
      <Link href="/" className="nav-home" title="Home" aria-label="Home">
        <img src="/assets/images/home.png" alt="Home" onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png'; }} />
      </Link>
      <div className="about-header" style={{ height: '35vh' }}>
        <h1 className="fade-in-up visible">Contact &amp; Order</h1>
      </div>

      <div className="contact-wrapper fade-in-up visible" style={{ maxWidth: 650, margin: '-60px auto 40px', position: 'relative', zIndex: 3, padding: '0 1rem' }}>
        <div className="section-card">
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Fill out the form to place your custom order. I&apos;ll reach out via WhatsApp to discuss designs! 🎁
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" type="text" className={`form-input${errors.name ? ' error' : ''}`} placeholder="John Doe" value={form.name} onChange={(e) => set('name', e.target.value)} disabled={loading} />
              {errors.name && <p className="form-error">⚠ {errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="hello@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={loading} />
              {errors.email && <p className="form-error">⚠ {errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">WhatsApp Number</label>
              <input id="phone" type="tel" className={`form-input${errors.phone ? ' error' : ''}`} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} disabled={loading} />
              {errors.phone && <p className="form-error">⚠ {errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="orderText">Text / Word to Create</label>
              <input id="orderText" type="text" className={`form-input${errors.orderText ? ' error' : ''}`} placeholder="e.g. Love, Amma, sculpture(mom and son)..." value={form.orderText} onChange={(e) => set('orderText', e.target.value)} disabled={loading} />
              {errors.orderText && <p className="form-error">⚠ {errors.orderText}</p>}
            </div>

            {form.orderText.trim() && original > 0 && (
              <div className="price-display">
                Original Price: <span>{formatPrice(original)}</span><br />
                Advance Amount (50%): <span>{formatPrice(advance)}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="message">Additional Details</label>
              <textarea id="message" className={`form-input form-textarea${errors.message ? ' error' : ''}`} rows={5} placeholder="Colour theme, occasion, gift wrapper, special requests..." value={form.message} onChange={(e) => set('message', e.target.value)} disabled={loading} />
              {errors.message && <p className="form-error">⚠ {errors.message}</p>}
            </div>

            {!user && (
              <div className="alert alert-info" style={{ marginBottom: '1.2rem' }}>
                ℹ <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link> to save your order history automatically.
              </div>
            )}

            <button type="submit" className={`btn btn-full btn-lg${loading ? ' btn-loading' : ''}`} disabled={loading}>
              {loading ? 'Processing…' : 'Pay Advance & Send Order'}
            </button>
          </form>
        </div>
      </div>


    </>
  );
}
