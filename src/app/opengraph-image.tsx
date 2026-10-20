import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const dynamic = "force-static";

export const alt = "TRUDEV — free browser-based PDF editor and invoice generator";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080808",
          color: "#f4f3ef",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#f4f3ef",
          }}
        >
          TRUDEV
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#f4f3ef",
              letterSpacing: -2,
            }}
          >
            Free PDF Editor &amp;
            <br />
            Invoice Generator
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#929292",
              maxWidth: 900,
            }}
          >
            Browser-based tools by Amal Dev Anilkumar — your files stay on your
            device.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#929292",
          }}
        >
          <span>trudev.in</span>
          <span style={{ color: "#ff3b2f", fontWeight: 700 }}>
            100% in-browser
          </span>
        </div>
      </div>
    ),
    size,
  );
}
