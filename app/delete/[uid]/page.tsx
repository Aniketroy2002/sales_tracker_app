import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Package, Users, DollarSign, ArrowLeft, Trash2, AlertTriangle, Hash } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

// Function to convert Excel serial date to proper date
function formatDate(dateValue: any): string {
  if (!dateValue) return "N/A"

  // If it's already a proper date string (YYYY-MM-DD format)
  if (typeof dateValue === "string" && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateValue).toLocaleDateString()
  }

  // If it's an Excel serial number (like 45844)
  if (typeof dateValue === "number" || (typeof dateValue === "string" && !isNaN(Number(dateValue)))) {
    const serialNumber = Number(dateValue)
    // Excel serial date starts from 1900-01-01
    const excelEpoch = new Date(1900, 0, 1)
    const jsDate = new Date(excelEpoch.getTime() + (serialNumber - 1) * 24 * 60 * 60 * 1000)
    return jsDate.toLocaleDateString()
  }

  // Try to parse as regular date
  try {
    return new Date(dateValue).toLocaleDateString()
  } catch {
    return String(dateValue)
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

async function deleteItem(uid: string) {
  "use server"

  try {
    const response = await fetch(`https://sheetdb.io/api/v1/wz9tlx4nv6ofo/uid/${encodeURIComponent(uid)}`, {
      method: "DELETE",
    })

    if (response.ok) {
      // Revalidate the show page to update the cache
      revalidatePath("/show")

      redirect("/show?deleted=true")
    } else {
      const errorText = await response.text()
      console.error("Delete API Error:", response.status, errorText)
      redirect(`/delete/${uid}?error=true`)
    }
  } catch (error) {
    console.error("Delete Error:", error)

    // Check if it's a redirect error (which is expected)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    redirect(`/delete/${uid}?error=true`)
  }
}

export default async function DeletePage({ params }: { params: { uid: string } }) {
  const item = await getItemByUid(params.uid)

  if (!item) {
    notFound()
  }

  const deleteItemWithUid = deleteItem.bind(null, params.uid)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4 pt-8">
          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/show">
              <ArrowLeft className="h-4 w-4" />
              Back to Items
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Delete Item</h1>
            <p className="text-slate-600">Review the details before deleting item #{params.uid}</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur border-red-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Confirm Deletion
            </CardTitle>
            <CardDescription className="text-red-600">
              This action cannot be undone. Please review the item details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                    Date
                  </div>
                  <div className="text-lg font-semibold text-slate-900">{formatDate(item.date)}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Package className="h-4 w-4" />
                    Item Name
                  </div>
                  <div className="text-lg font-semibold text-slate-900">{item.item_name}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Hash className="h-4 w-4" />
                    Quantity
                  </div>
                  <Badge variant="outline" className="text-sm font-semibold">
                    {item.qty || "1"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Users className="h-4 w-4" />
                    Customer
                  </div>
                  <Badge variant={item.customer_name === "NA" ? "secondary" : "default"} className="text-sm">
                    {item.customer_name}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <DollarSign className="h-4 w-4" />
                    Price
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    ₹{Number.parseFloat(item.price || 0).toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <DollarSign className="h-4 w-4" />
                    Due Price
                  </div>
                  <Badge variant={item.due_price === "NA" ? "secondary" : "outline"} className="text-sm">
                    {item.due_price === "NA" ? "No Due Price" : `₹${Number.parseFloat(item.due_price).toFixed(2)}`}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800">Warning</h3>
                  <p className="text-red-700 text-sm mt-1">
                    This will permanently delete the item from your spreadsheet. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <form action={deleteItemWithUid} className="flex-1">
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg gap-2"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Item
                </Button>
              </form>
              <Button
                variant="outline"
                className="flex-1 border-slate-300 hover:bg-slate-50 bg-transparent"
                size="lg"
                asChild
              >
                <Link href="/show">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
