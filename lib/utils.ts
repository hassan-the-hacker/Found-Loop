import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return formatDate(dateString);
}

export function getStatusBadge(status: string) {
  const s = (status || "").toUpperCase().trim();
  switch (s) {
    case "REPORTED":
      return { label: "Reported", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
    case "AVAILABLE":
      return { label: "Available", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" };
    case "MATCH_PENDING":
      return { label: "Potential Match", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" };
    case "SUBMITTED":
    case "CLAIM_UNDER_REVIEW":
    case "UNDER_REVIEW":
      return { label: "Under Review", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
    case "VERIFIED":
    case "OWNERSHIP_VERIFIED":
    case "APPROVED":
      return { label: "Ownership Verified", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" };
    case "RETURNED":
    case "HANDED_OVER":
      return { label: "Returned", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" };
    case "CLOSED":
    case "REJECTED":
      return { label: "Closed", bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200" };
    default:
      return { label: status, bg: "bg-stone-50", text: "text-stone-700", border: "border-stone-200" };
  }
}

