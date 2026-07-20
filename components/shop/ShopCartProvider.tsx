"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string | null;
  quantity: number;
}

interface ShopCartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  mounted: boolean;
}

export const ShopCartContext = createContext<ShopCartContextType | undefined>(undefined);

const CART_KEY = "tayamo-shop-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // silently fail
  }
}

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) {
      saveCart(items);
    }
  }, [items]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartCount = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const getCartTotal = useCallback(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

  return (
    <ShopCartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getCartCount, getCartTotal, mounted }}
    >
      {children}
    </ShopCartContext.Provider>
  );
}

export function useShopCart() {
  const context = useContext(ShopCartContext);
  if (!context) {
    throw new Error("useShopCart must be used within a ShopCartProvider");
  }
  return context;
}
