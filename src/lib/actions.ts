"use server"

import { prisma } from "@/lib/prisma"

export async function saveSubscription(email: string, name?: string) {
  try {
    if (!email) {
      return { success: false, error: "البريد الإلكتروني مطلوب" }
    }    // Check if email already exists
    const existingSubscriber = await prisma.newsAttachment.findFirst({
      where: { 
        email,
        type: "email"
      }
    })
    
    if (existingSubscriber) {
      return { success: false, error: "البريد الإلكتروني مسجل بالفعل" }
    }

    // Insert new subscriber
    const result = await prisma.newsAttachment.create({
      data: {
        email,
        name: name || null,
        type: "email",
        subscribedAt: new Date(),
        source: "footer",
      }
    })

    return {
      success: true,
      message: "تم الاشتراك بنجاح",
      id: result.id,
    }
  } catch (error) {
    console.error("Error saving subscription:", error)
    return { success: false, error: "فشل في حفظ الاشتراك" }
  }
}

export async function saveWhatsAppContact(whatsappNumber: string, name?: string) {
  try {
    if (!whatsappNumber) {
      return { success: false, error: "رقم الواتساب مطلوب" }
    }

    // Basic validation for phone number
    const phoneRegex = /^\d{10,15}$/
    const cleanedNumber = whatsappNumber.replace(/\D/g, "")
    
    if (!phoneRegex.test(cleanedNumber)) {
      return { success: false, error: "رقم الواتساب غير صالح" }
    }

    // Check if number already exists
    const existingContact = await prisma.newsAttachment.findFirst({
      where: {
        whatsappNumber: cleanedNumber,
      }
    })

    if (existingContact) {
      return { success: false, error: "رقم الواتساب مسجل بالفعل" }
    }

    // Insert new contact
    const result = await prisma.newsAttachment.create({
      data: {
        whatsappNumber: cleanedNumber,
        name: name || null,
        type: "whatsapp",
        subscribedAt: new Date(),
        source: "footer",
      }
    })

    return {
      success: true,
      message: "تم تسجيل رقم الواتساب بنجاح",
      id: result.id,
    }
  } catch (error) {
    console.error("Error saving WhatsApp contact:", error)
    return { success: false, error: "فشل في حفظ رقم الواتساب" }
  }
}
