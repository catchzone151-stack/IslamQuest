export default function ScreenContainer({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(to bottom, #081426, #0e2340)",
        color: "white",
        padding: 16,
        paddingBottom: 90,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
