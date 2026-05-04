export function formatDateLong(input: string): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateFile(input: string): string {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) return "00_00_0000";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}_${mm}_${yy}`;
}
