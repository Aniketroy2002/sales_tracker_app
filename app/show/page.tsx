"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Download, Plus, ArrowLeft, Trash2, Search, RefreshCw, CheckCircle } from "lucide-react"
import Link from "next/link"
import { EditButton } from "@/components/edit-button"
import { DeleteItemButton } from "@/components/delete-item-button"
import { useRouter } from "next/navigation"

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
    // Excel serial date starts from 1900-01-01, but JavaScript Date starts from 1970-01-01
    // Excel serial 1 = 1900-01-01, so we need to adjust
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

// Function to sort items by date (latest first)
function sortItemsByDate(items: any[]) {
  return items.sort((a, b) => {
    // Convert dates to comparable format
    const dateA = new Date(a.date || 0)
    const dateB = new Date(b.date || 0)

    return dateB.getTime() - dateA.getTime() // Latest date first
  })
}

export default function ShowPage() {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const fetchItems = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true)
    try {
      const response = await fetch("https://sheetdb.io/api/v1/wz9tlx4nv6ofo", {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        const sortedData = sortItemsByDate(data)
        setItems(sortedData)
        setFilteredItems(sortedData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
      if (showRefreshIndicator) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items)
    } else {
      const filtered = items.filter(
        (item) =>
          item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.uid?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredItems(filtered)
    }
  }, [searchTerm, items])

  useEffect(() => {
    // Check for URL parameters to show success messages
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("updated") === "true") {
      // Show a temporary success message for updates
      setTimeout(() => {
        window.history.replaceState({}, "", "/show")
      }, 3000)
    }
    if (urlParams.get("deleted") === "true") {
      // Show a temporary success message for deletions
      setTimeout(() => {
        window.history.replaceState({}, "", "/show")
      }, 3000)
    }
  }, [])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map((item) => item.uid).filter(Boolean))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (uid: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, uid])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== uid))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert("Please select items to delete")
      return
    }

    if (
      !confirm(`Are you sure you want to delete ${selectedItems.length} selected items? This action cannot be undone.`)
    ) {
      return
    }

    setIsDeleting(true)

    try {
      // Delete items one by one
      const deletePromises = selectedItems.map((uid) =>
        fetch(`https://sheetdb.io/api/v1/wz9tlx4nv6ofo/uid/${encodeURIComponent(uid)}`, {
          method: "DELETE",
        }),
      )

      await Promise.all(deletePromises)

      // Refresh the items list
      await fetchItems()
      setSelectedItems([])
    } catch (error) {
      console.error("Error deleting items:", error)
      alert("Error deleting some items. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const isAllSelected =
    filteredItems.length > 0 && selectedItems.length === filteredItems.filter((item) => item.uid).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600">Loading items...</p>
        </div>
      </div>
    )
  }

  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const showUpdatedMessage = urlParams?.get("updated") === "true"
  const showDeletedMessage = urlParams?.get("deleted") === "true"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 sm:pt-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Items Overview</h1>
            <p className="text-sm sm:text-base text-slate-600">
              Manage and track all your items ({filteredItems.length} {filteredItems.length === 1 ? "item" : "items"})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => fetchItems(true)}
              variant="outline"
              size="sm"
              className="gap-2 bg-white hover:bg-slate-50 transition-all duration-200"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 bg-white hover:bg-slate-50 transition-all duration-200"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Form</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2 bg-green-600 hover:bg-green-700 transition-all duration-200">
              <Link href="/export">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Success Messages */}
        {showUpdatedMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm font-medium">Item updated successfully!</p>
          </div>
        )}

        {showDeletedMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-blue-800 text-sm font-medium">Item deleted successfully!</p>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search items, customers, or IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="bg-white hover:bg-slate-50"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-lg sm:text-xl">
                {searchTerm ? `Search Results (${filteredItems.length})` : `All Items (${filteredItems.length})`}
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedItems.length > 0 && (
                  <Button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    variant="destructive"
                    size="sm"
                    className="gap-2 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : `Delete (${selectedItems.length})`}
                  </Button>
                )}
                <Button asChild size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                  <Link href="/">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Item</span>
                    <span className="sm:hidden">Add</span>
                  </Link>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-slate-400 text-lg mb-2">{searchTerm ? "No items found" : "No items yet"}</div>
                <p className="text-slate-500 mb-4 text-sm sm:text-base">
                  {searchTerm ? "Try adjusting your search terms" : "Start by adding your first item"}
                </p>
                <Button asChild className="transition-all duration-200 hover:scale-105">
                  <Link href="/">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 pl-4">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all items"
                        />
                      </TableHead>
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Item</TableHead>
                      <TableHead className="font-semibold text-center">Qty</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold text-right">Price</TableHead>
                      <TableHead className="font-semibold text-right">Due</TableHead>
                      <TableHead className="font-semibold text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item: any, index: number) => (
                      <TableRow
                        key={item.uid || index}
                        className="hover:bg-slate-50/50 transition-colors duration-150 group"
                      >
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={selectedItems.includes(item.uid)}
                            onCheckedChange={(checked) => handleSelectItem(item.uid, checked as boolean)}
                            aria-label={`Select item ${item.item_name}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs sm:text-sm font-semibold text-blue-600">
                          #{item.uid || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 text-sm sm:text-base max-w-[150px] sm:max-w-none truncate">
                            {item.item_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-semibold text-xs">
                            {item.qty || "1"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.customer_name === "NA" ? "secondary" : "default"}
                            className="text-xs max-w-[100px] sm:max-w-none truncate"
                          >
                            {item.customer_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-green-600 text-sm">
                            ₹{Number.parseFloat(item.price || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={item.due_price === "NA" ? "secondary" : "outline"} className="text-xs">
                            {item.due_price === "NA" ? "None" : `₹${Number.parseFloat(item.due_price).toFixed(2)}`}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex gap-1 sm:gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                            <EditButton uid={item.uid} />
                            <DeleteItemButton uid={item.uid} itemName={item.item_name} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
