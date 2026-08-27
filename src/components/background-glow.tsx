export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
      <div className="absolute left-1/2 top-[-10%] h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />
      <div className="absolute right-[-10%] top-[30%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[140px]" />
      <div className="absolute left-[-10%] bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-[140px]" />
    </div>
  );
}
