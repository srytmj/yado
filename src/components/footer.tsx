export function Footer() {
  return (
    <footer className="border-t border-foreground/10 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-foreground/40 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} White Archive</span>
        <div className="flex items-center gap-5">
          <a href="https://github.com/srytmj/sso.whitearchive" className="transition hover:text-foreground/70">
            sso.whitearchive
          </a>
          <a href="https://github.com/srytmj/malas" className="transition hover:text-foreground/70">
            malas
          </a>
        </div>
      </div>
    </footer>
  );
}
