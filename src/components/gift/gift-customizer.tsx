"use client"

import type React from "react"

import { useState, useReducer } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// تعريف الأنواع محلياً
interface GiftItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface GiftState {
  color: string;
  message: string;
  items: GiftItem[];
}

interface GiftAction {
  type: 'UPDATE_GIFT_COLOR' | 'UPDATE_GIFT_MESSAGE' | 'ADD_ITEM' | 'REMOVE_ITEM';
  payload?: string | GiftItem | number;
}

// Definir el estado inicial
const initialState: GiftState = {
  color: "#8B5CF6", // Purple default
  message: "",
  items: [],
}

// Reducer para manejar las acciones
function giftReducer(state: GiftState, action: GiftAction): GiftState {
  switch (action.type) {
    case "UPDATE_GIFT_COLOR":
      return { ...state, color: action.payload as string }
    case "UPDATE_GIFT_MESSAGE":
      return { ...state, message: action.payload as string }
    case "ADD_ITEM":
      return { ...state, items: [...(state.items || []), action.payload as GiftItem] }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: (state.items || []).filter((item) => item.id !== action.payload),
      }
    default:
      return state
  }
}

export default function GiftCustomizer() {
  const [state, dispatch] = useReducer(giftReducer, initialState)
  const [messageInput, setMessageInput] = useState("")

  const handleColorChange = (color: string) => {
    dispatch({ type: "UPDATE_GIFT_COLOR", payload: color })
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
  }

  const handleMessageSubmit = () => {
    dispatch({ type: "UPDATE_GIFT_MESSAGE", payload: messageInput })
    setMessageInput("")
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">تخصيص الهدية</h2>

      <div className="space-y-6">
        {/* Color Selection */}
        <div>
          <Label htmlFor="gift-color">لون الهدية</Label>
          <div className="flex gap-2 mt-2">
            <Select value={state.color} onValueChange={handleColorChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر اللون" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="#8B5CF6">بنفسجي</SelectItem>
                <SelectItem value="#EC4899">وردي</SelectItem>
                <SelectItem value="#EF4444">أحمر</SelectItem>
                <SelectItem value="#3B82F6">أزرق</SelectItem>
                <SelectItem value="#10B981">أخضر</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-10 h-10 rounded-full border" style={{ backgroundColor: state.color }}></div>
          </div>
        </div>

        {/* Custom Message */}
        <div>
          <Label htmlFor="gift-message">رسالة مخصصة</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="gift-message"
              value={messageInput}
              onChange={handleMessageChange}
              placeholder="أضف رسالة شخصية..."
            />
            <Button onClick={handleMessageSubmit}>إضافة</Button>
          </div>

          {state.message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-3 bg-gray-50 rounded-md text-sm"
            >
              {state.message}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
