"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "3rem", fontWeight: 600, opacity: 0.3 }}>
          !
        </span>
        <h1
          style={{ marginTop: "0.5rem", fontSize: "1.25rem", fontWeight: 600 }}
        >
          Application error
        </h1>
        <p style={{ marginTop: "0.5rem", maxWidth: "24rem", color: "#666" }}>
          Something went badly wrong. Please try reloading the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
