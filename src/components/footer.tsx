export function Footer() {
  return (
    <footer className="w-full px-6 pt-20 pb-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-xs text-foreground/40 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} White Archive. All services SSO-enabled.</span>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/srytmj/sso.whitearchive"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-foreground/70"
          >
            sso.whitearchive
          </a>
          <a
            href="https://github.com/srytmj/malas"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-foreground/70"
          >
            malas
          </a>
          <a
            href="https://github.com/srytmj/whitearchive"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-foreground/70"
          >
            whitearchive
          </a>
        </div>
      </div>
    </footer>
  );
}
