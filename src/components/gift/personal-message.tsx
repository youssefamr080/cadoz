"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import { setPersonalMessage } from "@/lib/redux/slices/giftSlice"
import type { AppDispatch, RootState } from "@/lib/redux/store"

export default function PersonalMessage() {
  const dispatch = useDispatch<AppDispatch>()
  const personalMessage = useSelector((state: RootState) => state.gift.personalMessage)
  const [message, setMessage] = useState(personalMessage?.message || "")
  const [recipient, setRecipient] = useState(personalMessage?.recipient || "")
  const [sender, setSender] = useState(personalMessage?.sender || "")

  const handleSave = () => {
    dispatch(setPersonalMessage({
      message,
      recipient,
      sender,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-4 mb-6"
    >
      <h3 className="font-medium text-gray-900 mb-4">إضافة رسالة شخصية</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="recipient" className="block mb-2">
            إلى
          </Label>
          <Input
            id="recipient"
            placeholder="اسم المستلم"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="message" className="block mb-2">
            الرسالة
          </Label>
          <Textarea
            id="message"
            placeholder="اكتب رسالتك الشخصية هنا..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="sender" className="block mb-2">
            من
          </Label>
          <Input id="sender" placeholder="اسمك" value={sender} onChange={(e) => setSender(e.target.value)} />
        </div>

        <div className="text-right">
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            حفظ الرسالة
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
