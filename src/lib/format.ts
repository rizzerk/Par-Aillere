export function peso(n: number): string {
  return "₱" + Math.round(n);
}

export function relativeWhen(date: Date): string {
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const wasYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const time = date.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today ${time}`;
  if (wasYesterday) return `Yesterday ${time}`;
  return (
    date.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) + " " + time
  );
}
