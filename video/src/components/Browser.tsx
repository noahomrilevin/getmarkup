import React from "react";
import { C, F } from "../theme";

/**
 * Chrome browser chrome wrapper — realistic tab bar + address bar.
 * All scenes render inside this.
 */
export const Browser: React.FC<{
  url?: string;
  children: React.ReactNode;
  showMarkupIcon?: boolean;
}> = ({
  url = "app.example.com/dashboard",
  children,
  showMarkupIcon = false,
}) => {
  const tabH = 30;
  const addrH = 34;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#202124",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          height: tabH,
          backgroundColor: "#35363a",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 5, marginRight: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: c,
              }}
            />
          ))}
        </div>
        {/* Active tab */}
        <div
          style={{
            height: 22,
            backgroundColor: "#202124",
            borderRadius: "6px 6px 0 0",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            fontSize: 10,
            color: "#e8eaed",
            fontFamily: F.body,
          }}
        >
          Dashboard — MyApp
        </div>
      </div>

      {/* Address bar */}
      <div
        style={{
          height: addrH,
          backgroundColor: "#202124",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {/* Nav */}
        {["←", "→", "↻"].map((ic) => (
          <span
            key={ic}
            style={{ color: "#9aa0a6", fontSize: 12, width: 20, textAlign: "center" }}
          >
            {ic}
          </span>
        ))}
        {/* URL pill */}
        <div
          style={{
            flex: 1,
            height: 24,
            backgroundColor: "#35363a",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            fontSize: 11,
            fontFamily: F.body,
          }}
        >
          <span style={{ color: "#6b6b6b" }}>https://</span>
          <span style={{ color: "#e8eaed" }}>
            {url.replace(/^https?:\/\//, "")}
          </span>
        </div>
        {/* Markup icon in toolbar */}
        {showMarkupIcon && (
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 3,
              backgroundColor: C.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: C.deepBlue,
              fontFamily: F.display,
            }}
          >
            M
          </div>
        )}
      </div>

      {/* Page content */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
