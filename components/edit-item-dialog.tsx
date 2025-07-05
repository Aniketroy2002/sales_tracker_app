"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"

interface EditItemDialogProps {
  item: any
}

export function EditItemDialog({ item }: EditItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleUpdate = async (formData: FormData) => {
    setIsUpdating(true)

    const updatedData = {
      uid: item.uid, // Keep the same UID
      date: formData.get("date") || item.date,
      item_name: formData.get("item_name") || item.item_name,
      customer_name: formData.get("customer_name") || "NA",
      price: formData.get("price") || item.price,
      due_price: formData.get("due_price") || "NA",
    }

    try {
      // Update using the unique UID
      const response = await fetch(`https://sheetdb.io/api/v1/wz9tlx4nv6ofo/uid/${item.uid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      } else {
        alert("Error updating item")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error updating item")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to the item details below. ID: {item.uid?.substring(0, 12)}...
          </DialogDescription>
        </DialogHeader>
        <form action={handleUpdate} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" name="date" type="date" defaultValue={item.date} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">Item Name</Label>
              <Input id="edit-item-name" name="item_name" defaultValue={item.item_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-customer-name">Customer Name</Label>
              <Input
                id="edit-customer-name"
                name="customer_name"
                defaultValue={item.customer_name === "NA" ? "" : item.customer_name}
                placeholder="Leave empty for NA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={item.price} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-due-price">Due Price</Label>
              <Input
                id="edit-due-price"
                name="due_price"
                type="number"
                step="0.01"
                defaultValue={item.due_price === "NA" ? "" : item.due_price}
                placeholder="Enter due price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
