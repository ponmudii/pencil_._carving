'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import type { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, logActivity } = useAuth();
  const supabase = createClient();

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as CartItem[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (item: Omit<CartItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    // Check if already in cart
    const existing = items.find(
      (i) => i.product_title === item.product_title && i.product_category === item.product_category
    );
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + item.quantity);
      return;
    }
    await supabase.from('cart_items').insert({ ...item, user_id: user.id });
    await logActivity('cart_add', `Added ${item.product_title} to cart`);
    await fetchCart();
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('id', id);
    await logActivity('cart_remove', 'Removed item from cart');
    await fetchCart();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user || quantity < 1) return;
    await supabase.from('cart_items').update({ quantity }).eq('id', id);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        itemCount,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
