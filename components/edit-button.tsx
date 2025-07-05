import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"

interface EditButtonProps {
  uid: string
}

export function EditButton({ uid }: EditButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
      asChild
    >
      <Link href={`/edit/${uid}`}>
        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Edit</span>
      </Link>
    </Button>
  )
}
