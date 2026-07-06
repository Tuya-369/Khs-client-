"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((payload) => {
    const normalizedQty = Math.max(1, Number(payload?.quantity) || 1);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === payload.id &&
          item.size === (payload.size || "") &&
          item.color === (payload.color || ""),
      );

      if (existingIndex >= 0) {
        const next = [...prev];
        const existing = next[existingIndex];
        next[existingIndex] = {
          ...existing,
          qty: existing.qty + normalizedQty,
        };
        return next;
      }

      return [
        ...prev,
        {
          id: payload.id,
          title: payload.title || "Бараа",
          imageUrl: payload.imageUrl || "",
          qty: normalizedQty,
          size: payload.size || "",
          color: payload.color || "",
          price: Number(payload.price) || 0,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((indexToRemove) => {
    setCartItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems],
  );

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      totalItems,
      totalAmount,
    }),
    [cartItems, addToCart, removeFromCart, clearCart, totalItems, totalAmount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
