"use client"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function ClientToastContainer() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={true}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  )
} 