"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, Package, Users, DollarSign, Hash, CheckCircle } from "lucide-react"
import Link from "next/link"

function generateUniqueId() {
  const timestamp = Date.now().toString().slice(-3)
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0")
  return timestamp + random
}

// YYYY-MM-DD for today
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowSuccess(false)
    setShowError(false)

    const formData = new FormData(e.currentTarget)
    const uid = generateUniqueId()

    const dateValue = (formData.get("date") as string) || today()

    const payload = {
      uid,
      date: dateValue, // store as YYYY-MM-DD, **not** Excel serial
      item_name: formData.get("item_name"),
      qty: formData.get("qty") || "1",
      customer_name: formData.get("customer_name") || "NA",
      price: formData.get("price"),
      due_price: formData.get("due_price") || "NA",
    }

    try {
      const resp = await fetch("https://sheetdb.io/api/v1/wz9tlx4nv6ofo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        throw new Error(`SheetDB ${resp.status}`)
      }

      /* ---------- SUCCESS ---------- */
      // safely reset the form via ref
      if (formRef.current) {
        formRef.current.reset()
        // restore default values
        const dateInput = formRef.current.querySelector<HTMLInputElement>('input[name="date"]')
        const qtyInput = formRef.current.querySelector<HTMLInputElement>('input[name="qty"]')
        if (dateInput) dateInput.value = today()
        if (qtyInput) qtyInput.value = "1"
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error("Submit Error:", err)
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* header */}
        <div className="text-center space-y-2 pt-4 sm:pt-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Sales Tracker App</h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Manage your items and track customer orders efficiently.
          </p>
        </div>

        {showSuccess && (
          <div className="mx-auto max-w-md">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 text-sm font-medium">Item added successfully!</p>
            </div>
          </div>
        )}

        {showError && (
          <div className="mx-auto max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="h-5 w-5 bg-red-600 rounded-full" />
              <p className="text-red-800 text-sm font-medium">Failed to add item. Please try again.</p>
            </div>
          </div>
        )}

        {/* form card */}
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Add New Item
            </CardTitle>
            <CardDescription>Fill in the details below.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    Date
                  </Label>
                  <Input id="date" name="date" type="date" defaultValue={today()} required />
                </div>
                {/* item */}
                <div className="space-y-2">
                  <Label htmlFor="item_name" className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4 text-slate-500" />
                    Item Name
                  </Label>
                  <Input id="item_name" name="item_name" required />
                </div>
                {/* qty */}
                <div className="space-y-2">
                  <Label htmlFor="qty" className="flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-4 w-4 text-slate-500" />
                    Quantity
                  </Label>
                  <Input id="qty" name="qty" type="number" min="1" defaultValue="1" required />
                </div>
                {/* customer */}
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-slate-500" />
                    Customer <span className="text-slate-400 text-xs">(optional)</span>
                  </Label>
                  <Input id="customer_name" name="customer_name" />
                </div>
                {/* price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Price (₹)
                  </Label>
                  <Input id="price" name="price" type="number" step="0.01" required />
                </div>
                {/* due price */}
                <div className="space-y-2">
                  <Label htmlFor="due_price" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Due Price <span className="text-slate-400 text-xs">(optional)</span>
                  </Label>
                  <Input id="due_price" name="due_price" type="number" step="0.01" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding Item..." : "Add Item"}
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/show">View Items</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
