export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.8px] text-ink-mute">
      {children}
    </span>
  );
}

export function H2({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`m-0 text-[clamp(32px,4.5vw,48px)] font-semibold leading-[1.08] tracking-[-1.6px] ${className}`}
    >
      {children}
    </h2>
  );
}

export function H3({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`m-0 mb-2 text-[22px] font-semibold leading-[1.1] tracking-[-0.5px] ${className}`}
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 max-w-[380px] text-[14.5px] text-ink-sub">{children}</p>
  );
}
