"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DayPickerSingleProps, DayPickerRangeProps, DayPickerMultipleProps } from "react-day-picker"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import "react-day-picker/dist/style.css"

type CalendarMode = "single" | "range" | "multiple"

type CalendarModeMap = {
  single: DayPickerSingleProps
  range: DayPickerRangeProps
  multiple: DayPickerMultipleProps
}

type BaseCalendarProps = {
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
}

type CalendarProps<T extends CalendarMode> = BaseCalendarProps & 
  Omit<CalendarModeMap[T], keyof BaseCalendarProps> & {
    mode: T
  }

function Calendar<T extends CalendarMode>({
  className,
  classNames,
  showOutsideDays = true,
  mode,
  ...props
}: CalendarProps<T>) {
  return (
    <DayPicker
      mode={mode}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "w-full",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell: cn(
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          "first:text-left last:text-right mx-0.5 flex-1 flex justify-center items-center"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "first:text-left last:text-right flex-1"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 mx-auto"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...(props as any)}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
