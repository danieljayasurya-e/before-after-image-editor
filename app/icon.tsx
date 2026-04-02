import { ImageResponse } from "next/og";

export const size = {
  width: 256,
  height: 256,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #120f1f 0%, #22143d 42%, #3b1756 100%)",
        }}
      >
        <div
          style={{
            width: 208,
            height: 208,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 54,
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div
            style={{
              width: 164,
              height: 164,
              display: "flex",
              position: "relative",
              overflow: "hidden",
              borderRadius: 40,
              background: "rgba(8, 8, 12, 0.4)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              style={{
                width: "50%",
                height: "100%",
                background:
                  "linear-gradient(180deg, rgba(167,139,250,0.95), rgba(109,40,217,0.75))",
              }}
            />
            <div
              style={{
                width: "50%",
                height: "100%",
                background:
                  "linear-gradient(180deg, rgba(244,114,182,0.95), rgba(234,88,12,0.82))",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 18,
                bottom: 18,
                width: 10,
                transform: "translateX(-50%)",
                borderRadius: 999,
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 0 0 6px rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 26,
                bottom: 24,
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 19,
                background: "rgba(10,10,14,0.34)",
                color: "white",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              B
            </div>
            <div
              style={{
                position: "absolute",
                right: 26,
                top: 24,
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 19,
                background: "rgba(10,10,14,0.34)",
                color: "white",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              A
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
