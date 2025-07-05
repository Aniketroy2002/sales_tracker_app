import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
      <Card className="max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-slate-900">Item Not Found</CardTitle>
          <CardDescription>The item you're looking for doesn't exist or may have been deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full gap-2">
            <Link href="/show">
              <ArrowLeft className="h-4 w-4" />
              Back to Items
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
