// Purely decorative — turns a ticket code into a barcode-looking pattern
// of bars with varying widths, deterministic per code (not a real scanner
// format, just visual texture to sell "this is a physical ticket").
export function Barcode({ code, className }: { code: string; className?: string }) {
  const bars = code.split("").map((ch, i) => {
    const n = ch.charCodeAt(0);
    const width = (n % 3) + 1; // 1-3
    const gap = ((n + i) % 2) + 1; // 1-2
    return { width, gap };
  });

  return (
    <div className={`flex items-end ${className ?? ""}`} aria-hidden>
      {bars.map((b, i) => (
        <span
          key={i}
          style={{
            width: `${b.width}px`,
            marginRight: `${b.gap}px`,
            height: b.width === 3 ? "100%" : "70%",
          }}
          className="inline-block bg-current"
        />
      ))}
    </div>
  );
}
