"use server"

import { MongoClient } from "mongodb"

// MongoDB connection
const uri = process.env.MONGODB_URI

export async function saveSubscription(email: string, name?: string) {
  const client = new MongoClient(uri as string)

  try {
    if (!email) {
      return { success: false, error: "البريد الإلكتروني مطلوب" }
    }

    // Connect to MongoDB
    await client.connect()
    const database = client.db("cadoz")
    const collection = database.collection("newsAttachment")

    // Check if email already exists
    const existingSubscriber = await collection.findOne({ email })
    if (existingSubscriber) {
      return { success: false, error: "البريد الإلكتروني مسجل بالفعل" }
    }

    // Insert new subscriber
    const result = await collection.insertOne({
      email,
      name: name || null,
      type: "email",
      subscribedAt: new Date(),
      source: "footer",
    })

    // Convert ObjectId to string to avoid serialization issues
    return {
      success: true,
      message: "تم الاشتراك بنجاح",
      id: result.insertedId.toString(), // Convert ObjectId to string
    }
  } catch (error) {
    console.error("Error saving subscription:", error)
    return { success: false, error: "فشل في حفظ الاشتراك" }
  } finally {
    // Close the connection
    await client.close()
  }
}

export async function saveWhatsAppContact(whatsappNumber: string, name?: string) {
  const client = new MongoClient(uri as string)

  try {
    if (!whatsappNumber) {
      return { success: false, error: "رقم الواتساب مطلوب" }
    }

    // Basic validation for phone number
    const phoneRegex = /^\d{10,15}$/
    if (!phoneRegex.test(whatsappNumber.replace(/\D/g, ""))) {
      return { success: false, error: "رقم الواتساب غير صالح" }
    }

    // Connect to MongoDB
    await client.connect()
    const database = client.db("cadoz")
    const collection = database.collection("newsAttachment")

    // Check if number already exists
    const existingContact = await collection.findOne({
      whatsappNumber: whatsappNumber.replace(/\D/g, ""),
    })

    if (existingContact) {
      return { success: false, error: "رقم الواتساب مسجل بالفعل" }
    }

    // Insert new contact
    const result = await collection.insertOne({
      whatsappNumber: whatsappNumber.replace(/\D/g, ""),
      name: name || null,
      type: "whatsapp",
      subscribedAt: new Date(),
      source: "footer",
    })

    // Convert ObjectId to string to avoid serialization issues
    return {
      success: true,
      message: "تم تسجيل رقم الواتساب بنجاح",
      id: result.insertedId.toString(), // Convert ObjectId to string
    }
  } catch (error) {
    console.error("Error saving WhatsApp contact:", error)
    return { success: false, error: "فشل في حفظ رقم الواتساب" }
  } finally {
    // Close the connection
    await client.close()
  }
}
