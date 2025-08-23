import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { notify } from '../utils/notifier';

export type Product = { id: string; title: string; price: number; desc?: string };
export type CartItem = { product: Product; qty: number };
export type OrderStatus = 'En attente' | 'Acceptée' | 'Prête' | 'Terminée';
export type Order = { id: string; items: CartItem[]; total: number; date: string; status: OrderStatus; city?: string; slot?: string };

type AppState = {
  city: string | null;
  slot: string | null; // ISO string for chosen pickup time
  cart: CartItem[];
  orders: Order[];
};

type AppContextType = AppState & {
  cartCount: number;
  cartTotal: number;
  setCity: (c: string | null) => void;
  setSlot: (slot: string | null) => void;
  addToCart: (p: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: () => string | null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'wft_app_state_v1';

function loadState(): AppState | null {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function saveState(state: AppState) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() =>
    loadState() || { city: null, slot: null, cart: [], orders: [] }
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  const cartCount = useMemo(
    () => state.cart.reduce((sum, i) => sum + i.qty, 0),
    [state.cart]
  );
  const cartTotal = useMemo(
    () => state.cart.reduce((sum, i) => sum + i.qty * i.product.price, 0),
    [state.cart]
  );

  const setCity = (c: string | null) => setState((s) => ({ ...s, city: c }));
  const setSlot = (slot: string | null) => setState((s) => ({ ...s, slot }));

  const addToCart = (p: Product, qty = 1) => {
    setState((s) => {
      const existing = s.cart.find((i) => i.product.id === p.id);
      if (existing) {
        return {
          ...s,
          cart: s.cart.map((i) =>
            i.product.id === p.id ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return { ...s, cart: [...s.cart, { product: p, qty }] };
    });
  };

  const setQty = (productId: string, qty: number) => {
    setState((s) => {
      const newCart = s.cart
        .map((i) => (i.product.id === productId ? { ...i, qty } : i))
        .filter((i) => i.qty > 0);
      return { ...s, cart: newCart };
    });
  };

  const removeFromCart = (productId: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((i) => i.product.id !== productId) }));
  };

  const clearCart = () => setState((s) => ({ ...s, cart: [], slot: null }));

  const placeOrder = () => {
    if (state.cart.length === 0) return null;
    const id = 'C' + Math.floor(Math.random() * 100000).toString();
    const total = state.cart.reduce((sum, i) => sum + i.qty * i.product.price, 0);
    const date = new Date().toISOString();
    const order: Order = {
      id,
      items: state.cart,
      total,
      date,
      status: 'En attente',
      city: state.city || undefined,
      slot: state.slot || undefined,
    };
    setState((s) => ({ ...s, orders: [order, ...s.orders], cart: [], slot: null }));

    // Notifications simulation
    notify('Commande envoyée', 'Nous vous confirmerons bientôt.');
    setTimeout(() => {
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'Acceptée' } : o)),
      }));
      notify("Commande acceptée", 'Votre commande est en préparation.');
    }, 4000);
    setTimeout(() => {
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'Prête' } : o)),
      }));
      notify('Commande prête', 'Votre commande est prête au food truck.');
    }, 9000);

    return id;
  };

  const value: AppContextType = {
    ...state,
    cartCount,
    cartTotal,
    setCity,
    setSlot,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    placeOrder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
