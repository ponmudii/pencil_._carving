import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'Graphite Gallery – by Ponmudi',
  description: 'Handcrafted pencil carvings, custom frames, chocolates, hampers & portraits. Turn your moments into treasured memories.',
  keywords: 'pencil carving, handmade gifts, custom frames, gift hampers, portraits, India',
  openGraph: {
    title: 'Graphite Gallery – by Ponmudi',
    description: 'Handcrafted memories, made with love.',
    type: 'website',
  },
};

export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {children}
                {modal}
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
