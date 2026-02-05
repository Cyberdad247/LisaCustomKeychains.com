// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createCart, addToCart, getCart, removeFromCart, ShopifyCart } from '../lib/shopify';
import { useNotification } from './NotificationSentry';

type CartContextType = {
  cart: ShopifyCart | null;
  cartOpen: boolean;
  toggleCart: () => void;
  addItemToCart: (variantId: string, quantity?: number, attributes?: { key: string, value: string }[]) => Promise<void>;
  removeItemFromCart: (lineId: string) => Promise<void>;
  updateLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  checkoutUrl: string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { notify } = useNotification();

  useEffect(() => {
    async function initializeCart() {
      const existingCartId = localStorage.getItem('shopify_cart_id');

      if (existingCartId) {
        try {
          const existingCart = await getCart(existingCartId);
          if (existingCart) {
            setCart(existingCart);
            setCheckoutUrl(existingCart.checkoutUrl);
            return;
          }
        } catch (e) {
          console.error("Cart init failed, creating new");
        }
      }

      const newCart = await createCart();
      setCart(newCart);
      setCheckoutUrl(newCart.checkoutUrl);
      localStorage.setItem('shopify_cart_id', newCart.id);
    }

    initializeCart();
  }, []);

  const toggleCart = () => setCartOpen(!cartOpen);

  const addItemToCart = async (variantId: string, quantity = 1, attributes?: { key: string, value: string }[]) => {
    let currentCartId = cart?.id;
    if (!currentCartId) {
      const newCart = await createCart();
      currentCartId = newCart.id;
      localStorage.setItem('shopify_cart_id', currentCartId);
    }

    try {
      console.log(`[Cart] Adding item. CartID: ${currentCartId}, Variant: ${variantId}, Qty: ${quantity}`);
      const { cart: updatedCart, userErrors } = await addToCart(currentCartId, [{ merchandiseId: variantId, quantity, attributes }]);

      if (userErrors && userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }

      console.log(`[Cart] Item added successfully. Total Qty: ${updatedCart.totalQuantity}`);
      setCart(updatedCart);
      setCheckoutUrl(updatedCart.checkoutUrl);
      setCartOpen(true);
      notify("Added to Bag!", "success");
    } catch (e) {
      console.error("Failed to add to cart:", e);
      notify("Failed to add item to bag.", "error");
      throw e; // Re-throw to be caught by UI
    }
  };

  const removeItemFromCart = async (lineId: string) => {
    if (!cart?.id) return;
    try {
      const updatedCart = await removeFromCart(cart.id, [lineId]);
      setCart(updatedCart);
      setCheckoutUrl(updatedCart.checkoutUrl);
    } catch (e) {
      console.error("Failed to remove item:", e);
    }
  };

  const updateLineQuantity = async (lineId: string, quantity: number) => {
    if (!cart?.id) return;
    try {
      const { updateCartLineQuantity } = await import('../lib/shopify');
      const { cart: updatedCart, userErrors } = await updateCartLineQuantity(cart.id, lineId, quantity);

      if (userErrors && userErrors.length > 0) {
        console.error("Shopify User Error:", userErrors[0].message);
        // Optional: Add a toast notification here
        return;
      }

      setCart(updatedCart);
      setCheckoutUrl(updatedCart.checkoutUrl);
    } catch (e) {
      console.error("Failed to update quantity:", e);
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartOpen, toggleCart, addItemToCart, removeItemFromCart, updateLineQuantity, checkoutUrl }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
