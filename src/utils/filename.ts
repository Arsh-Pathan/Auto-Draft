import { CLUB_NAME } from "./constants";
import { formatDateFile } from "./formatDate";

export function reportFilename(date: string, ext: "pdf" | "docx"): string {
  return `${CLUB_NAME} Report ${formatDateFile(date)}.${ext}`;
}

export function rfc5987(value: string): string {
  return encodeURIComponent(value)
    .replace(/['()]/g, escape)
    .replace(/\*/g, "%2A");
}
