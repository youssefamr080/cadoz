"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  setSelectedBox,
  addProduct,
  removeProduct,
  updateProductQuantity,
  addDecoration,
  removeDecoration,
  setSelectedBag,
  setPersonalMessage,
  clearGift,
  fetchSavedItems,
  addSavedItemThunk,
  removeSavedItemThunk,
  clearSavedItemsThunk,
  loadSavedItemsFromLocalStorage,
} from "@/lib/redux/slices/giftSlice"
import type { Box, GiftProduct, Decoration, Bag, SavedItem, Inspiration, PersonalMessage } from "@/types/database"

interface GiftContextType {
  selectedBox: Box | null
  selectedProducts: GiftProduct[]
  selectedDecorations: Decoration[]
  selectedBag: Bag | null
  savedItems: SavedItem[]
  personalMessage: PersonalMessage | null
  setSelectedBox: (box: Box) => void
  addProduct: (product: GiftProduct) => void
  removeProduct: (productId: string) => void
  updateProductQuantity: (productId: string, quantity: number) => void
  addDecoration: (decoration: Decoration) => void
  removeDecoration: (decorationId: string) => void
  setSelectedBag: (bag: Bag) => void
  saveForLater: (item: SavedItem) => void
  removeSavedItem: (itemId: string) => void
  clearSavedItems: () => void
  clearGift: () => void
  setPersonalMessage: (message: PersonalMessage) => void
  loadInspiration: (gift: Inspiration) => void
}

const GiftContext = createContext<GiftContextType | undefined>(undefined)

export function GiftProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  // Seleccionar el estado desde Redux
  const selectedBox = useAppSelector((state) => state.gift.selectedBox)
  const selectedProducts = useAppSelector((state) => state.gift.selectedProducts)
  const selectedDecorations = useAppSelector((state) => state.gift.selectedDecorations)
  const selectedBag = useAppSelector((state) => state.gift.selectedBag)
  const savedItems = useAppSelector((state) => state.gift.savedItems)
  const personalMessage = useAppSelector((state) => state.gift.personalMessage)

  // Cargar los elementos guardados al montar el componente
  useEffect(() => {
    dispatch(fetchSavedItems())

    // Cargar desde localStorage como respaldo
    const savedItemsFromStorage = localStorage.getItem("savedItems")
    if (savedItemsFromStorage) {
      try {
        const items = JSON.parse(savedItemsFromStorage)
        dispatch(loadSavedItemsFromLocalStorage(items))
      } catch (error) {
        console.error("Error parsing saved items from localStorage:", error)
      }
    }
  }, [dispatch])

  // Mantener localStorage sincronizado como respaldo
  useEffect(() => {
    localStorage.setItem("savedItems", JSON.stringify(savedItems))
  }, [savedItems])

  // Funciones para manipular el estado
  const handleSetSelectedBox = (box: Box) => {
    dispatch(setSelectedBox(box))
  }

  const handleAddProduct = (product: GiftProduct) => {
    dispatch(addProduct(product))
  }

  const handleRemoveProduct = (productId: string) => {
    dispatch(removeProduct(productId))
  }

  const handleUpdateProductQuantity = (productId: string, quantity: number) => {
    dispatch(updateProductQuantity({ id: productId, quantity }))
  }

  const handleAddDecoration = (decoration: Decoration) => {
    dispatch(addDecoration(decoration))
  }

  const handleRemoveDecoration = (decorationId: string) => {
    dispatch(removeDecoration(decorationId))
  }

  const handleSetSelectedBag = (bag: Bag) => {
    dispatch(setSelectedBag(bag))
  }

  const handleSaveForLater = (item: SavedItem) => {
    dispatch(addSavedItemThunk(item))
  }

  const handleRemoveSavedItem = (itemId: string) => {
    dispatch(removeSavedItemThunk(itemId))
  }

  const handleClearSavedItems = () => {
    dispatch(clearSavedItemsThunk())
  }

  const handleClearGift = () => {
    dispatch(clearGift())
  }

  const handleSetPersonalMessage = (message: PersonalMessage) => {
    dispatch(setPersonalMessage(message))
  }

  const handleLoadInspiration = (gift: Inspiration) => {
    dispatch(setSelectedBox(gift.box))
    gift.products.forEach((product) => {
      dispatch(addProduct(product))
    })
    gift.decorations.forEach((decoration) => {
      dispatch(addDecoration(decoration))
    })
    dispatch(setSelectedBag(gift.bag))
  }

  return (
    <GiftContext.Provider
      value={{
        selectedBox,
        selectedProducts,
        selectedDecorations,
        selectedBag,
        savedItems,
        personalMessage,
        setSelectedBox: handleSetSelectedBox,
        addProduct: handleAddProduct,
        removeProduct: handleRemoveProduct,
        updateProductQuantity: handleUpdateProductQuantity,
        addDecoration: handleAddDecoration,
        removeDecoration: handleRemoveDecoration,
        setSelectedBag: handleSetSelectedBag,
        saveForLater: handleSaveForLater,
        removeSavedItem: handleRemoveSavedItem,
        clearSavedItems: handleClearSavedItems,
        clearGift: handleClearGift,
        setPersonalMessage: handleSetPersonalMessage,
        loadInspiration: handleLoadInspiration,
      }}
    >
      {children}
    </GiftContext.Provider>
  )
}

export function useGift() {
  const context = useContext(GiftContext)
  if (context === undefined) {
    throw new Error("useGift must be used within a GiftProvider")
  }
  return context
}
