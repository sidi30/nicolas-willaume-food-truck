import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { notify } from '../utils/notifier';

export type Product = { id: string; title: string; price: number; desc?: string; category?: string };
export type CartItem = { product: Product; qty: number };
export type OrderStatus = 'En attente' | 'Acceptée' | 'Prête' | 'Terminée';
export type Order = { id: string; items: CartItem[]; total: number; date: string; status: OrderStatus; city?: string; slot?: string };

type AppState = {
  city: string | null;
  slot: string | null; // ISO string for chosen pickup time
  cart: CartItem[];
  orders: Order[];
  products: Product[];
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
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  removeOrder: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => void;
  removeProduct: (id: string) => void;
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

// Default products used on first load
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', title: 'Burger Classique', desc: 'Bœuf, cheddar, salade, tomate, sauce maison', price: 9.5, category: 'Burgers' },
  { id: '2', title: 'Burger Signature', desc: 'Bœuf maturé, double cheddar, oignons confits', price: 12, category: 'Burgers' },
  { id: '3', title: 'Wrap Poulet', desc: 'Poulet croustillant, salade, tomate, sauce yaourt', price: 8.5, category: 'Wraps' },
  { id: 'm1', title: 'Menu Classique', desc: 'Burger Classique + Frites + Boisson', price: 13.5, category: 'Menus' },
  { id: 'm2', title: 'Menu Signature', desc: 'Burger Signature + Frites + Boisson', price: 16, category: 'Menus' },
  { id: 'm3', title: 'Menu Wrap', desc: 'Wrap Poulet + Frites + Boisson', price: 12, category: 'Menus' },
  { id: 'b1', title: 'Coca-Cola 33cl', desc: 'Canette fraîche', price: 2.5, category: 'Boissons' },
  { id: 'b2', title: 'Eau minérale 50cl', desc: 'Plate', price: 1.8, category: 'Boissons' },
  { id: 'b3', title: 'Limonade artisanale 33cl', desc: 'Citron bio', price: 3.2, category: 'Boissons' },
  { id: 'd1', title: 'Cookie chocolat', desc: 'Moelleux, pépites de chocolat', price: 2.2, category: 'Desserts' },
  { id: 'd2', title: 'Tiramisu maison', desc: 'Classique italien', price: 4.0, category: 'Desserts' },
  { id: 'd3', title: 'Cheesecake', desc: 'Coulis fruits rouges', price: 3.8, category: 'Desserts' },
];

const DEFAULT_STATE: AppState = {
  city: null,
  slot: null,
  cart: [],
  orders: [],
  products: DEFAULT_PRODUCTS,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState();
    if (!loaded) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...loaded,
      cart: Array.isArray((loaded as any).cart) ? (loaded as any).cart : [],
      orders: Array.isArray((loaded as any).orders) ? (loaded as any).orders : [],
      products: Array.isArray((loaded as any).products) ? (loaded as any).products : DEFAULT_PRODUCTS,
    };
  });

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

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  };

  const removeOrder = (id: string) => {
    setState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) }));
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const id = 'P' + Math.floor(Math.random() * 100000).toString();
    setState((s) => ({ ...s, products: [{ id, ...p }, ...s.products] }));
  };

  const updateProduct = (id: string, patch: Partial<Omit<Product, 'id'>>) => {
    setState((s) => ({
      ...s,
      products: s.products.map((pr) => (pr.id === id ? { ...pr, ...patch } : pr)),
    }));
  };

  const removeProduct = (id: string) => {
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
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
    updateOrderStatus,
    removeOrder,
    addProduct,
    updateProduct,
    removeProduct,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// DEFAULT_PRODUCTS now declared above DEFAULT_STATE
