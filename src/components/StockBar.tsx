export function StockBar({ stock, planned }: { stock: number; planned: number }) {
  const pct = Math.round(100 * Math.min(1, stock / Math.max(1, planned)));
  const color = stock === 0 ? "bg-ink/25" : stock <= 5 ? "bg-gold" : "bg-maroon-deep";
  return (
    <div className="mt-4 h-1.5 bg-ink/10">
      <div className={"h-full " + color} style={{ width: pct + "%" }} />
    </div>
  );
}
