"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DeleteItemButtonProps {
  uid: string
  itemName: string
}

export function DeleteItemButton({ uid, itemName }: DeleteItemButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!uid) {
      alert("Cannot delete item: No ID found")
      return
    }

    setIsDeleting(true)

    try {
      // Delete the record by targeting the UID column directly
      const response = await fetch(`https://sheetdb.io/api/v1/wz9tlx4nv6ofo/uid/${encodeURIComponent(uid)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        const errorText = await response.text()
        console.error("Delete error:", errorText)
        alert("Error deleting item. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error deleting item. Please check your connection.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 bg-white transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Link href={`/delete/${uid}`}>
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Link>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure to delete this record?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{itemName}" (ID: #{uid}) from your spreadsheet. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
            {isDeleting ? "Deleting..." : "Yes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
