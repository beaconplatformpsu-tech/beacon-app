import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";

export const dateUtils = {
  /**
   * Formats a date string into a readable format (e.g., "Oct 12, 2023")
   */
  formatStandard(dateString: string | null | undefined): string {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "";
    }
  },

  /**
   * Returns a semantic relative string (Today, Tomorrow, or formatted date)
   */
  formatRelative(dateString: string | null | undefined): string {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMM d");
    } catch {
      return "";
    }
  },

  /**
   * Checks if a given date is overdue
   */
  isOverdue(dateString: string | null | undefined): boolean {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return isPast(date) && !isToday(date);
    } catch {
      return false;
    }
  },

  /**
   * Returns the number of days until a deadline
   */
  daysUntil(dateString: string | null | undefined): number {
    if (!dateString) return 0;
    try {
      const date = new Date(dateString);
      return differenceInDays(date, new Date());
    } catch {
      return 0;
    }
  }
};
