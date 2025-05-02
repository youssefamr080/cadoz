"use client"

// NOTE: This component is deprecated - ToastContainer is now centralized in layout.tsx
// Using multiple ToastContainer instances causes conflicts and errors
// Keep this component for backwards compatibility but render nothing

export default function ClientToastContainer() {
  // Return null to prevent rendering duplicate ToastContainer
  return null
}