"use client"

import { motion } from "framer-motion"

export default function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-1/3 left-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(closest-side, rgba(0,102,255,.25), transparent 60%)",
        }}
        animate={{ rotate: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-1/3 left-1/3 h-[70vmax] w-[70vmax] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(closest-side, rgba(123,77,255,.25), transparent 60%)",
        }}
        animate={{ rotate: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </div>
  )
}