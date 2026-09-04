/**
 * Formats a UTC timestamp string or ISO string into local IST (Asia/Kolkata) time:
 * YYYY-MM-DD HH:mm
 */
export const formatScanTime = (timestamp) => {
  if (!timestamp) return "";

  let isoString = String(timestamp).trim();
  // If formatted like "2026-09-03 18:03" or "2026-09-03 18:03:00", replace space with 'T'
  if (isoString.includes(" ") && !isoString.includes("T")) {
    isoString = isoString.replace(" ", "T");
  }

  // If there is no timezone indicator, treat as UTC (append 'Z')
  if (!isoString.endsWith("Z") && !isoString.includes("+") && !/[+-]\d{2}:\d{2}$/.test(isoString)) {
    isoString += "Z";
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return timestamp;
  }

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);

  const getPart = (type) => parts.find((p) => p.type === type)?.value || "";
  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");
  const hour = getPart("hour");
  const minute = getPart("minute");

  return `${year}-${month}-${day} ${hour}:${minute}`;
};
