function RingCluster({
  cx,
  cy,
  r0 = 20,
  gap = 7,
  count = 8,
}: {
  cx: number;
  cy: number;
  r0?: number;
  gap?: number;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={cx} cy={cy} r={r0 + i * gap} />
      ))}
    </>
  );
}

/**
 * A bundle of parallel lines making one rounded turn (the "ribbon" motif).
 * Each copy shares the same arc center and grows its radius by `gap`,
 * which is what keeps the straight arms and the turn genuinely parallel
 * instead of just overlapping restated copies of the same line.
 */
function Ribbon({
  x0,
  xCorner,
  y0,
  radius,
  yEnd,
  gap = 7,
  count = 9,
}: {
  x0: number;
  xCorner: number;
  y0: number;
  radius: number;
  yEnd: number;
  gap?: number;
  count?: number;
}) {
  const cy = y0 + radius;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const d = i * gap;
        const r = radius + d;
        const armY = y0 - d;
        const vertX = xCorner + r;
        return <path key={i} d={`M ${x0} ${armY} L ${xCorner} ${armY} A ${r} ${r} 0 0 1 ${vertX} ${cy} L ${vertX} ${yEnd}`} />;
      })}
    </>
  );
}

export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-background">
      {/* Bauhaus line art: interlocking ribbon turns, concentric ripples
          and solid dots in one ink color - a full composition, but kept
          faint enough to stay behind the type. Scrolls with the page. */}

      <svg
        className="absolute left-[-6rem] top-[-2rem] h-[14rem] w-[14rem] text-foreground opacity-[0.08] dark:opacity-[0.12]"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <Ribbon x0={-20} xCorner={70} y0={40} radius={22} yEnd={150} count={8} />
        <circle cx={140} cy={24} r={5} fill="currentColor" stroke="none" />
      </svg>

      <svg
        className="absolute right-[-7rem] top-[42rem] h-[22rem] w-[22rem] text-foreground opacity-[0.09] dark:opacity-[0.13]"
        viewBox="0 0 220 220"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <Ribbon x0={240} xCorner={110} y0={40} radius={30} yEnd={-20} count={8} />
        <circle cx={70} cy={150} r={10} fill="currentColor" stroke="none" />
      </svg>

      <svg
        className="absolute left-[6%] top-[92rem] h-[15rem] w-[15rem] text-foreground opacity-[0.09] dark:opacity-[0.13]"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <RingCluster cx={80} cy={80} r0={12} gap={7} count={8} />
        <circle cx={80} cy={80} r={4} fill="currentColor" stroke="none" />
      </svg>

      <svg
        className="absolute right-[4%] top-[146rem] h-[16rem] w-[20rem] text-foreground opacity-[0.09] dark:opacity-[0.13]"
        viewBox="0 0 200 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <Ribbon x0={220} xCorner={100} y0={130} radius={26} yEnd={-20} count={8} />
        <circle cx={40} cy={20} r={7} fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}
