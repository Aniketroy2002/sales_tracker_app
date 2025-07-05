import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, Package, Users, DollarSign, ArrowLeft, Hash, Save } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

// Function to convert Excel serial date to YYYY-MM-DD format
function formatDateForInput(dateValue: any): string {
  if (!dateValue) {
    const now = new Date()
    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0")
    )
  }

  // If it's already a proper date string (YYYY-MM-DD format)
  if (typeof dateValue === "string" && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue
  }

  // If it's an Excel serial number (like 45844)
  if (typeof dateValue === "number" || (typeof dateValue === "string" && !isNaN(Number(dateValue)))) {
    const serialNumber = Number(dateValue)
    // Excel serial date starts from 1900-01-01
    const excelEpoch = new Date(1900, 0, 1)
    const jsDate = new Date(excelEpoch.getTime() + (serialNumber - 1) * 24 * 60 * 60 * 1000)
    return jsDate.toISOString().split("T")[0]
  }

  // Try to parse as regular date
  try {
    return new Date(dateValue).toISOString().split("T")[0]
  } catch {
    const now = new Date()
    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0")
    )
  }
}

async function getItemByUid(uid: string) {
  try {
    // Get all items and find the one with matching UID
    const response = await fetch("https://sheetdb.io/api/v1/wz9tlx4nv6ofo", {
      cache: "no-store",
    })
    if (response.ok) {
      const allItems = await response.json()
      const item = allItems.find((item: any) => item.uid === uid)
      return item || null
    }
  } catch (error) {
    console.error("Error fetching item:", error)
  }
  return null
}

async function updateItem(uid: string, formData: FormData) {
  "use server"

  const updatedData = {
    uid,
    date: formData.get("date") as string,
    item_name: formData.get("item_name") as string,
    qty: formData.get("qty") as string,
    customer_name: (formData.get("customer_name") as string) || "NA",
    price: formData.get("price") as string,
    due_price: (formData.get("due_price") as string) || "NA",
  }

  const resp = await fetch(`https://sheetdb.io/api/v1/wz9tlx4nv6ofo/uid/${encodeURIComponent(uid)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  })

  if (!resp.ok) {
    // Surface real API errors
    const text = await resp.text()
    throw new Error(`SheetDB update failed ${resp.status}: ${text}`)
  }

  // Keep list fresh
  revalidatePath("/show")

  // SUCCESS — let the redirect bubble up
  redirect("/show?updated=true")
}

export default async function EditPage({
  params,
  searchParams,
}: {
  params: { uid: string }
  searchParams: { error?: string }
}) {
  const item = await getItemByUid(params.uid)

  if (!item) {
    notFound()
  }

  const updateItemWithUid = updateItem.bind(null, params.uid)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 sm:pt-8">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 bg-white hover:bg-slate-50 w-fit transition-all duration-200"
          >
            <Link href="/show">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Items</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Edit Item</h1>
            <p className="text-sm sm:text-base text-slate-600">Update details for item #{params.uid}</p>
          </div>
        </div>

        {/* Error Message */}
        {searchParams.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="h-5 w-5 bg-red-600 rounded-full flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">Failed to update item. Please try again.</p>
          </div>
        )}

        {/* Edit Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 text-slate-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Update Item Details
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Make changes to the item information below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={updateItemWithUid} className="space-y-6">
              {/* Form Grid */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={formatDateForInput(item.date)}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="item_name" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Package className="h-4 w-4 text-slate-500" />
                    Item Name
                  </Label>
                  <Input
                    id="item_name"
                    name="item_name"
                    defaultValue={item.item_name || ""}
                    placeholder="Enter item name"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="qty" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Hash className="h-4 w-4 text-slate-500" />
                    Quantity
                  </Label>
                  <Input
                    id="qty"
                    name="qty"
                    type="number"
                    min="1"
                    defaultValue={item.qty || "1"}
                    placeholder="Enter quantity"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Users className="h-4 w-4 text-slate-500" />
                    Customer <span className="text-slate-400 text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    defaultValue={item.customer_name === "NA" ? "" : item.customer_name || ""}
                    placeholder="Customer name"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Price (₹)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={item.price || ""}
                    placeholder="0.00"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    required
                  />
                </div>

                {/* Due Price */}
                <div className="space-y-2">
                  <Label htmlFor="due_price" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    Due Price <span className="text-slate-400 text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="due_price"
                    name="due_price"
                    type="number"
                    step="0.01"
                    defaultValue={item.due_price === "NA" ? "" : item.due_price || ""}
                    placeholder="0.00"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Item
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-300 hover:bg-slate-50 bg-white transition-all duration-200 hover:shadow-md"
                  size="lg"
                  asChild
                >
                  <Link href="/show">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
