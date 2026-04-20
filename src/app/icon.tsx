import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          borderRadius: 7,
        }}
      >
        <span
          style={{
            fontFamily:
              "'Inter Tight', 'Inter', system-ui, -apple-system, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.5px",
            display: "flex",
            gap: 0,
          }}
        >
          c
          <span style={{ color: "#E56B3A", fontWeight: 400 }}>/</span>
          l
        </span>
      </div>
    ),
    { width: 32, height: 32 }
  );
}
