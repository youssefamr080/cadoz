// context/GiftContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { Product, GiftOption } from '../data/products';

// Type definitions with improved documentation
export type GiftStep = 'chocolates' | 'candies' | 'box' | 'decorations' | 'wrap' | 'summary';

export type GiftCartItem = {
  id: string;
  type: 'product' | 'gift';
  quantity: number;
  data: Product | GiftOption;
  addedAt: number; // Timestamp for sorting and analytics
};

export type GiftState = {
  cart: GiftCartItem[];
  selectedBox: GiftOption | null;
  selectedWrap: GiftOption | null;
  currentStep: GiftStep;
  lastUpdated: number; // For tracking state changes
};

type GiftAction =
  | { type: 'ADD_TO_CART'; payload: Product | GiftOption }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SELECT_BOX'; payload: GiftOption | null }
  | { type: 'SELECT_WRAP'; payload: GiftOption | null }
  | { type: 'CHANGE_STEP'; payload: GiftStep }
  | { type: 'CLEAR_CART' }
  | { type: 'RESET_GIFT' };

// Constants
const GIFT_STATE_KEY = 'giftState';
const GIFT_STATE_VERSION = '1.0'; // For future migrations

// Initial state creator with version tracking
const createInitialState = (): GiftState => ({
  cart: [],
  selectedBox: null,
  selectedWrap: null,
  currentStep: 'chocolates',
  lastUpdated: Date.now(),
});

// Get initial state with error handling and data validation
const getInitialState = (): GiftState => {
  if (typeof window === 'undefined') {
    return createInitialState();
  }
  
  try {
    const savedState = localStorage.getItem(GIFT_STATE_KEY);
    
    if (!savedState) {
      return createInitialState();
    }
    
    const parsedState = JSON.parse(savedState);
    
    // Validate structure of the saved state
    if (!parsedState || 
        typeof parsedState !== 'object' || 
        !Array.isArray(parsedState.cart)) {
      console.warn('Invalid gift state structure in localStorage, resetting');
      return createInitialState();
    }
    
    // Ensure all expected properties exist
    return {
      cart: Array.isArray(parsedState.cart) ? parsedState.cart : [],
      selectedBox: parsedState.selectedBox || null,
      selectedWrap: parsedState.selectedWrap || null,
      currentStep: ['chocolates', 'candies', 'box', 'decorations', 'wrap', 'summary'].includes(parsedState.currentStep) 
        ? parsedState.currentStep 
        : 'chocolates',
      lastUpdated: parsedState.lastUpdated || Date.now(),
    };
  } catch (error) {
    console.error("Failed to parse gift state from localStorage:", error);
    localStorage.removeItem(GIFT_STATE_KEY);
    return createInitialState();
  }
};

// Enhanced reducer with better error handling and immutable updates
function giftReducer(state: GiftState, action: GiftAction): GiftState {
  try {
    switch (action.type) {
      case 'ADD_TO_CART': {
        if (!action.payload || typeof action.payload !== 'object' || !('id' in action.payload)) {
          console.error("Invalid payload for ADD_TO_CART action:", action.payload);
          return state;
        }

        const existingItemIndex = state.cart.findIndex(item => item.data.id === action.payload.id);
        const now = Date.now();
        
        let newCart;
        if (existingItemIndex >= 0) {
          // Create a new array with the updated item
          newCart = [...state.cart];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + 1
          };
        } else {
          // Add new item to cart
          newCart = [
            ...state.cart,
            {
              id: `item-${now}-${action.payload.id}`,
              type: 'price' in action.payload ? 'product' : 'gift',
              quantity: 1,
              data: action.payload,
              addedAt: now,
            },
          ];
        }
        
        return {
          ...state,
          cart: newCart,
          lastUpdated: now,
        };
      }

      case 'REMOVE_FROM_CART':
        return {
          ...state,
          cart: state.cart.filter(item => item.id !== action.payload),
          lastUpdated: Date.now(),
        };

      case 'UPDATE_QUANTITY': {
        const { id, quantity } = action.payload;
        if (quantity < 1) {
          console.warn("Attempted to set quantity below 1, defaulting to 1");
        }
        
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === id
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
          lastUpdated: Date.now(),
        };
      }

      case 'SELECT_BOX':
        return { 
          ...state, 
          selectedBox: action.payload,
          lastUpdated: Date.now(),
        };

      case 'SELECT_WRAP':
        return { 
          ...state, 
          selectedWrap: action.payload,
          lastUpdated: Date.now(),
        };

      case 'CHANGE_STEP':
        return { 
          ...state, 
          currentStep: action.payload,
          lastUpdated: Date.now(),
        };
        
      case 'CLEAR_CART':
        return {
          ...state,
          cart: [],
          lastUpdated: Date.now(),
        };
        
      case 'RESET_GIFT':
        return {
          ...createInitialState(),
          lastUpdated: Date.now(),
        };

      default:
        return state;
    }
  } catch (error) {
    console.error("Error in gift reducer:", error, "Action:", action);
    return state; // Return unchanged state on error
  }
}

// Context type with additional utility methods
interface GiftContextType {
  state: GiftState;
  dispatch: React.Dispatch<GiftAction>;
  totalItems: number;
  totalPrice: number;
  isBoxSelected: boolean;
  isWrapSelected: boolean;
  clearCart: () => void;
  resetGift: () => void;
}

// Create context with default values
const GiftContext = createContext<GiftContextType>({
  state: createInitialState(),
  dispatch: () => null,
  totalItems: 0,
  totalPrice: 0,
  isBoxSelected: false,
  isWrapSelected: false,
  clearCart: () => null,
  resetGift: () => null,
});

// Enhanced Provider with performance optimizations
export const GiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(giftReducer, getInitialState());

  // Synchronize with localStorage using debounce for performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(GIFT_STATE_KEY, JSON.stringify({
            ...state,
            version: GIFT_STATE_VERSION,
          }));
        } catch (error) {
          console.error("Failed to save gift state to localStorage:", error);
        }
      }
    }, 300); // Debounce saves to avoid excessive writes
    
    return () => clearTimeout(timeoutId);
  }, [state]);

  // Calculate derived values with memoization
  const totalItems = useMemo(() => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.cart]);

  const totalPrice = useMemo(() => {
    let total = state.cart.reduce(
      (sum, item) => sum + (item.data.price * item.quantity), 
      0
    );
    
    // Add box price if selected
    if (state.selectedBox) {
      total += state.selectedBox.price;
    }
    
    // Add wrap price if selected
    if (state.selectedWrap) {
      total += state.selectedWrap.price;
    }
    
    return total;
  }, [state.cart, state.selectedBox, state.selectedWrap]);

  // Check if box and wrap are selected
  const isBoxSelected = Boolean(state.selectedBox);
  const isWrapSelected = Boolean(state.selectedWrap);

  // Memoized utility functions
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const resetGift = useCallback(() => {
    dispatch({ type: 'RESET_GIFT' });
  }, []);

  // Memoize dispatch to prevent unnecessary re-renders
  const memoizedDispatch = useCallback(dispatch, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch: memoizedDispatch,
    totalItems,
    totalPrice,
    isBoxSelected,
    isWrapSelected,
    clearCart,
    resetGift,
  }), [state, memoizedDispatch, totalItems, totalPrice, isBoxSelected, isWrapSelected, clearCart, resetGift]);

  return (
    <GiftContext.Provider value={contextValue}>
      {children}
    </GiftContext.Provider>
  );
};

// Enhanced custom hook with error boundary
export const useGift = () => {
  const context = useContext(GiftContext);
  
  if (!context) {
    throw new Error('useGift must be used within a GiftProvider');
  }
  
  return context;
};