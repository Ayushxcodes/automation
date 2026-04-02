"use client"

import React, { createContext, useContext, useState } from "react"

type SelectCtx = {
  value?: string | null
  onChange?: (v: string) => void
  open?: boolean
  setOpen?: (b: boolean) => void
}

const Ctx = createContext<SelectCtx>({})

export function Select({ children, onValueChange, value }: any) {
  const [open, setOpen] = useState(false)
  return (
    <Ctx.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
      {children}
    </Ctx.Provider>
  )
}

export function SelectTrigger({ children }: any) {
  const ctx = useContext(Ctx)
  return (
    <button
      type="button"
      className="w-full rounded-md border px-3 py-2 text-left"
      onClick={() => ctx.setOpen?.(!ctx.open)}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: any) {
  const ctx = useContext(Ctx)
  return <span>{ctx.value ?? placeholder}</span>
}

export function SelectContent({ children }: any) {
  const ctx = useContext(Ctx)
  if (!ctx.open) return null
  return (
    <div className="border rounded-md mt-2 bg-white z-50 shadow-sm">
      {children}
    </div>
  )
}

export function SelectItem({ value, children }: any) {
  const ctx = useContext(Ctx)
  return (
    <div
      className="p-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => {
        ctx.onChange?.(value)
        ctx.setOpen?.(false)
      }}
    >
      {children}
    </div>
  )
}

export default Select
