import { ImageResponse } from "next/og";
import { siteConfig } from "../lib/seo/site-config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 28,
          padding: 72,
          background: "#070707",
          color: "#f4f1ea",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: "rgba(200,169,106,0.18)",
            transform: "translate(110px, -130px)",
          }}
        />
        <div style={{ color: "#c8a96a", fontSize: 28, fontWeight: 800, letterSpacing: 6 }}>
          {siteConfig.business.name}
        </div>
        <div style={{ maxWidth: 760, fontSize: 78, lineHeight: 0.94, fontWeight: 900 }}>
          Premium mobile car detailing
        </div>
        <div style={{ maxWidth: 760, color: "#b8b2a7", fontSize: 30, lineHeight: 1.3 }}>
          Request maintenance cleans, deep cleans and finishing extras with manual approval.
        </div>
      </div>
    ),
    size,
  );
}
