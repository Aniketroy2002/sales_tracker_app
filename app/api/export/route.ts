import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { dates, exportType } = await request.json()

    // Fetch all data from the spreadsheet
    const response = await fetch("https://sheetdb.io/api/v1/wz9tlx4nv6ofo")

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    const allItems = await response.json()

    // Filter items by the selected dates
    const filteredItems = allItems.filter((item: any) => {
      const itemDate = new Date(item.date).toISOString().split("T")[0]
      return dates.includes(itemDate)
    })

    // Create CSV content
    const headers = ["UID", "Date", "Item Name", "Quantity", "Customer Name", "Price (₹)", "Due Price (₹)"]
    const csvContent = [
      headers.join(","),
      ...filteredItems.map((item: any) =>
        [
          `"${item.uid}"`,
          item.date,
          `"${item.item_name}"`,
          item.qty || "1",
          `"${item.customer_name}"`,
          `₹${item.price}`,
          item.due_price === "NA" ? "NA" : `₹${item.due_price}`,
        ].join(","),
      ),
    ].join("\n")

    // Generate filename based on export type
    let filename = ""
    if (exportType === "single") {
      filename = `items-${dates[0]}.csv`
    } else if (exportType === "multiple") {
      filename = `items-multiple-dates.csv`
    } else {
      filename = `items-${dates[0]}-to-${dates[dates.length - 1]}.csv`
    }

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
