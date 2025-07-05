"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Calendar, ArrowLeft, Plus, Minus, FileDown } from "lucide-react"
import Link from "next/link"

export default function ExportPage() {
  const [exportType, setExportType] = useState<"single" | "multiple" | "range">("single")
  const [singleDate, setSingleDate] = useState("")
  const [multipleDates, setMultipleDates] = useState<string[]>([""])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const addDateField = () => {
    setMultipleDates([...multipleDates, ""])
  }

  const removeDateField = (index: number) => {
    if (multipleDates.length > 1) {
      setMultipleDates(multipleDates.filter((_, i) => i !== index))
    }
  }

  const updateMultipleDate = (index: number, value: string) => {
    const newDates = [...multipleDates]
    newDates[index] = value
    setMultipleDates(newDates)
  }

  const handleDownload = async () => {
    let dates: string[] = []

    if (exportType === "single") {
      if (!singleDate) {
        alert("Please select a date")
        return
      }
      dates = [singleDate]
    } else if (exportType === "multiple") {
      const validDates = multipleDates.filter((date) => date.trim() !== "")
      if (validDates.length === 0) {
        alert("Please select at least one date")
        return
      }
      dates = validDates
    } else if (exportType === "range") {
      if (!startDate || !endDate) {
        alert("Please select both start and end dates")
        return
      }
      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date must be before or equal to end date")
        return
      }

      // Generate all dates in the range
      const start = new Date(startDate)
      const end = new Date(endDate)
      const dateRange = []

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(d.toISOString().split("T")[0])
      }
      dates = dateRange
    }

    setIsDownloading(true)

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dates, exportType }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url

        let filename = ""
        if (exportType === "single") {
          filename = `items-${singleDate}.csv`
        } else if (exportType === "multiple") {
          filename = `items-multiple-dates.csv`
        } else {
          filename = `items-${startDate}-to-${endDate}.csv`
        }

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Error downloading CSV")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error downloading CSV")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 pt-4 sm:pt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Export Data</h1>
          <p className="text-sm sm:text-base text-slate-600">Download items data as CSV for selected dates</p>
        </div>

        {/* Export Options Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 text-slate-900">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileDown className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              CSV Export Options
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Choose how you want to export your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Type Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-slate-700">Export Type</Label>
              <div className="grid gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <Checkbox
                    id="single"
                    checked={exportType === "single"}
                    onCheckedChange={() => setExportType("single")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="single" className="text-sm font-medium cursor-pointer">
                      Single Date
                    </Label>
                    <p className="text-xs text-slate-500">Export data for one specific date</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <Checkbox
                    id="multiple"
                    checked={exportType === "multiple"}
                    onCheckedChange={() => setExportType("multiple")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="multiple" className="text-sm font-medium cursor-pointer">
                      Multiple Dates
                    </Label>
                    <p className="text-xs text-slate-500">Export data for multiple specific dates</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <Checkbox
                    id="range"
                    checked={exportType === "range"}
                    onCheckedChange={() => setExportType("range")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="range" className="text-sm font-medium cursor-pointer">
                      Date Range
                    </Label>
                    <p className="text-xs text-slate-500">Export data for a continuous date range</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Single Date */}
            {exportType === "single" && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label htmlFor="single-date" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Select Date
                </Label>
                <Input
                  id="single-date"
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  required
                />
              </div>
            )}

            {/* Multiple Dates */}
            {exportType === "multiple" && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">Select Multiple Dates</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDateField}
                    className="gap-1 bg-white hover:bg-slate-50 transition-all duration-200"
                  >
                    <Plus className="h-3 w-3" />
                    Add Date
                  </Button>
                </div>
                <div className="space-y-3">
                  {multipleDates.map((date, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => updateMultipleDate(index, e.target.value)}
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      />
                      {multipleDates.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDateField(index)}
                          className="px-3 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range */}
            {exportType === "range" && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-sm font-medium text-slate-700">
                      Start Date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-sm font-medium text-slate-700">
                      End Date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download CSV"}
              </Button>
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full gap-2 bg-white hover:bg-slate-50 transition-all duration-200"
            >
              <Link href="/show">
                <ArrowLeft className="h-4 w-4" />
                Back to Items
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
