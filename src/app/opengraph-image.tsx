import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
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
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #effaf6 0%, #ffffff 60%)",
          color: "#1c2321",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#1a7f62",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 64 64">
              <path d="M32 14 12 31h6v17h12V37h4v11h12V31h6z" fill="#fff" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#145141" }}>{siteConfig.name}</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>
          {siteConfig.tagline}
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#5f6b67", maxWidth: 1000 }}>{siteConfig.description}</div>
      </div>
    ),
    size,
  );
}
