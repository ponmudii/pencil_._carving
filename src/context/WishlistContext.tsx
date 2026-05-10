'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import type { WishlistItem } from '@/types';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  isInWishlist: (title: string, category: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, logActivity } = useAuth();
  const supabase = createClient();

  const fetchWishlist = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as WishlistItem[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (title: string, category: string) => {
    return items.some((i) => i.product_title === title && i.product_category === category);
  };

  const toggleWishlist = async (item: Omit<WishlistItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const existing = items.find(
      (i) => i.product_title === item.product_title && i.product_category === item.product_category
    );
    if (existing) {
      await removeFromWishlist(existing.id);
    } else {
      await supabase.from('wishlist_items').insert({ ...item, user_id: user.id });
      await logActivity('wishlist_add', `Added ${item.product_title} to wishlist`);
      await fetchWishlist();
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user) return;
    await supabase.from('wishlist_items').delete().eq('id', id);
    await logActivity('wishlist_remove', 'Removed item from wishlist');
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
