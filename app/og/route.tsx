import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title    = searchParams.get("title")    ?? "CarOK"
  const subtitle = searchParams.get("subtitle") ?? "Encontrá tu próximo auto"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#050503",
          padding: "64px",
        }}
      >
        {/* Logo mark — círculo con ícono de auto, fiel al logo CarOK */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3px solid #1f6d53",
              fontSize: 30,
            }}
          >
            🚗
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#cecfc9",
              letterSpacing: "-0.5px",
            }}
          >
            CarOK
          </span>
        </div>

        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#cecfc9",
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 16,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#cecfc9",
            opacity: 0.5,
          }}
        >
          {subtitle}
        </div>

        {/* Barra verde inferior */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: "#1f6d53",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
