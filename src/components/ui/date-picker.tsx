"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerDemoProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  placeholder?: string
  fromDate?: Date
}

function DatePickerDemo({ 
  date, 
  setDate, 
  placeholder = "Pick a date",
  fromDate
}: DatePickerDemoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="bg-white rounded-md border shadow-md p-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            disabled={fromDate ? { before: fromDate } : undefined}
            className="rounded-md"
            showOutsideDays={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePickerDemo }
