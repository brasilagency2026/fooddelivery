import { SignIn } from "@clerk/nextjs";

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">🍔</div>
        <h1 className="text-2xl font-bold gradient-text">Food Pronto</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Área dos restaurantes
        </p>
      </div>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#FF6B35",
            colorBackground: "#111111",
            colorText: "#F5F5F5",
            colorTextSecondary: "#888888",
            colorInputBackground: "#1A1A1A",
            colorInputText: "#F5F5F5",
            borderRadius: "12px",
          },
          elements: {
            card: {
              border: "1px solid #2D2D2D",
              boxShadow: "none",
            },
          },
        }}
        routing="hash"
        fallbackRedirectUrl="/admin/dashboard"
      />
    </div>
  );
}
