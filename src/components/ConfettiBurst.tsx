"use client";

// A one-shot burst of small paper scraps in the brand palette, fired when
// this component mounts. No canvas, no library — plain absolutely
// positioned spans animated with CSS, cleaned up automatically since the
// parent only renders this once per fresh booking.
const COLORS = ["#b98a3d", "#2f4538", "#a23e2f", "#1b2430"];

export function ConfettiBurst() {
  const pieces = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * 360 + (i % 2 === 0 ? 8 : -8);
    const distance = 60 + ((i * 37) % 50);
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;
    const color = COLORS[i % COLORS.length];
    const size = 5 + (i % 3) * 2;
    const delay = (i % 5) * 20;
    return { id: i, x, y, color, size, delay };
  });

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-sm opacity-0"
          style={
            {
              width: `${p.size}px`,
              height: `${p.size * 1.6}px`,
              backgroundColor: p.color,
              "--tx": `${p.x}px`,
              "--ty": `${p.y}px`,
              animation: `confetti-burst 0.7s ease-out ${p.delay}ms forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
