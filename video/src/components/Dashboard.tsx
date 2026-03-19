import React from "react";
import { F } from "../theme";

/**
 * Mock SaaS dashboard — dark UI, cards, charts, mid-build, visibly rough.
 * Scaled to fit inside the browser content area.
 */
export const Dashboard: React.FC<{ width?: string }> = ({
  width = "100%",
}) => (
  <div
    style={{
      width,
      height: "100%",
      backgroundColor: "#111827",
      fontFamily: F.body,
      display: "flex",
      overflow: "hidden",
    }}
  >
    {/* Side nav */}
    <div
      style={{
        width: 140,
        backgroundColor: "#0f172a",
        padding: "14px 0",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "0 12px 12px",
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
          borderBottom: "1px solid #1e293b",
          marginBottom: 6,
        }}
      >
        MyApp
      </div>
      {["Dashboard", "Analytics", "Users", "Settings"].map((t, i) => (
        <div
          key={t}
          style={{
            padding: "7px 12px",
            fontSize: 11,
            color: i === 0 ? "#fff" : "#64748b",
            backgroundColor: i === 0 ? "#1e293b" : "transparent",
          }}
        >
          {t}
        </div>
      ))}
    </div>

    {/* Main */}
    <div style={{ flex: 1, padding: "14px 18px", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>
          Dashboard
        </span>
        <button
          style={{
            padding: "5px 10px",
            fontSize: 10,
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 4,
          }}
        >
          New Report
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {[
          { l: "Users", v: "12,847", c: "+12%" },
          { l: "Revenue", v: "$48,290", c: "+8%" },
          { l: "Sessions", v: "1,024", c: "-3%" },
          { l: "Conversion", v: "undefined", c: "" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              flex: 1,
              backgroundColor: "#1e293b",
              borderRadius: 6,
              padding: "10px 12px",
              border: "1px solid #334155",
            }}
          >
            <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 2 }}>
              {s.l}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: s.v === "undefined" ? "#ef4444" : "#f1f5f9",
              }}
            >
              {s.v}
            </div>
            {s.c && (
              <div
                style={{
                  fontSize: 9,
                  color: s.c.startsWith("+") ? "#34d399" : "#f87171",
                  marginTop: 2,
                }}
              >
                {s.c}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart + table */}
      <div style={{ display: "flex", gap: 10 }}>
        {/* Chart */}
        <div
          style={{
            flex: 2,
            backgroundColor: "#1e293b",
            borderRadius: 6,
            padding: 12,
            border: "1px solid #334155",
            height: 180,
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}
          >
            Revenue Overview
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 4,
              height: 130,
              padding: "0 8px",
            }}
          >
            {[65, 80, 45, 90, 70, 85, 55, 95, 60, 78, 88, 72].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  backgroundColor: i === 7 ? "#3b82f6" : "#1e40af30",
                  borderRadius: "3px 3px 0 0",
                }}
              />
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#1e293b",
            borderRadius: 6,
            padding: 12,
            border: "1px solid #334155",
            height: 180,
            overflow: "hidden",
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}
          >
            Recent Users
          </div>
          {["Sarah Chen", "Mike Johnson", "Alex Rivera", "Jordan Kim"].map(
            (n, i) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: i < 3 ? "1px solid #334155" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: ["#3b82f620", "#f4364820", "#34d39920", "#f59e0b20"][i],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 600,
                      color: "#94a3b8",
                    }}
                  >
                    {n[0]}
                  </div>
                  <span style={{ fontSize: 10, color: "#cbd5e1" }}>{n}</span>
                </div>
                <button
                  style={{
                    fontSize: 8,
                    padding: "2px 6px",
                    backgroundColor: "#334155",
                    border: "none",
                    borderRadius: 3,
                    color: "#94a3b8",
                    marginRight: i === 2 ? -6 : 0, // intentional misalignment
                  }}
                >
                  View
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  </div>
);
