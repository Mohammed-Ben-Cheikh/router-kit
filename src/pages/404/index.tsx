import React, { useState } from "react";
import { useRouter } from "../../hooks/useRouter";

const staile: { [k: string]: React.CSSProperties } = {
  errorPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  errorContainer: {
    textAlign: "center",
    padding: "0 1rem",
  },
  errorTitle: {
    fontSize: "9rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  errorSubtitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#4b5563",
    marginTop: "1rem",
    marginBottom: 0,
  },
  errorMessage: {
    color: "#6b7280",
    margin: "1rem 0 2rem 0",
  },
  errorButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  errorButtonHover: {
    backgroundColor: "#1d4ed8",
  },
};

const Page404 = () => {
  const { navigate } = useRouter();
  const [hover, setHover] = useState(false);

  return (
    <div style={staile.errorPage}>
      <div style={staile.errorContainer}>
        <h1 style={staile.errorTitle}>404</h1>
        <h2 style={staile.errorSubtitle}>Page Not Found</h2>
        <p style={staile.errorMessage}>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => {
            navigate("/");
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            ...staile.errorButton,
            ...(hover ? staile.errorButtonHover : {}),
          }}
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default Page404;
