interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={`inline-flex items-baseline leading-none ${className ?? ""}`}>
      <span
        className="font-black text-primary drop-shadow-[0_2px_8px_rgba(255,215,0,0.35)]"
        style={{ fontSize: "1.6em", letterSpacing: "-0.04em" }}
      >
        V
      </span>
      {showWordmark && (
        <span
          className="font-extrabold text-foreground"
          style={{ letterSpacing: "-0.03em" }}
        >
          ura
        </span>
      )}
    </div>
  );
}
