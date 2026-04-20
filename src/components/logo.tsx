import type { CSSProperties } from "react";

interface LogoProps {
  size?: number;
  color?: string;
  slashColor?: string;
  mono?: boolean;
  style?: CSSProperties;
  className?: string;
}

const INK = "#111111";
const ACCENT = "#E56B3A";
const DISPLAY_FONT = "'Inter Tight', 'Inter', system-ui, sans-serif";

/**
 * cita/lab wordmark.
 *
 * Default: "cita" + "lab" in ink (#111), slash in accent (#E56B3A).
 * Pass `mono` for single-ink variant (slash at 55% opacity).
 * Pass `color="#fff"` for inverted variant — auto-switches to mono mode.
 *
 * @example
 * <Logo size={32} />                  // default ink + ámbar
 * <Logo size={40} color="#fff" />     // sobre fondo oscuro (auto-mono)
 * <Logo size={24} mono />             // monocromo forzado
 */
export function Logo({
  size = 24,
  color = INK,
  slashColor,
  mono = false,
  style,
  className,
}: LogoProps) {
  const autoMono = mono || (color !== INK && !slashColor);
  const slashFill = autoMono ? color : (slashColor ?? ACCENT);
  const slashOpacity = autoMono ? 0.55 : 1;

  return (
    <span
      className={className}
      style={{
        fontFamily: DISPLAY_FONT,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: size >= 24 ? `${-size * 0.04}px` : "-0.6px",
        color,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "baseline",
        userSelect: "none",
        ...style,
      }}
      aria-label="cita/lab"
    >
      cita
      <span
        style={{
          fontWeight: 400,
          color: slashFill,
          opacity: slashOpacity,
          margin: "0 1px",
        }}
        aria-hidden="true"
      >
        /
      </span>
      lab
    </span>
  );
}

/**
 * Monograma c/l — para favicons, badges y espacios cuadrados pequeños.
 */
export function LogoGlyph({
  size = 24,
  color = INK,
  slashColor,
  mono = false,
  style,
  className,
}: LogoProps) {
  const autoMono = mono || (color !== INK && !slashColor);
  const slashFill = autoMono ? color : (slashColor ?? ACCENT);
  const slashOpacity = autoMono ? 0.55 : 1;

  return (
    <span
      className={className}
      style={{
        fontFamily: DISPLAY_FONT,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: `${-size * 0.05}px`,
        color,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "baseline",
        userSelect: "none",
        ...style,
      }}
      aria-label="cita/lab"
    >
      c
      <span
        style={{
          fontWeight: 400,
          color: slashFill,
          opacity: slashOpacity,
          margin: "0 0.5px",
        }}
        aria-hidden="true"
      >
        /
      </span>
      l
    </span>
  );
}
