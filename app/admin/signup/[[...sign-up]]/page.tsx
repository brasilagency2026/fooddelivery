import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminSignUpPage() {
  return (
    <div className="min-h-dvh w-full flex" style={{ background: "var(--color-bg)" }}>
      {/* Back button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
        style={{ 
          background: "rgba(10,10,10,0.6)", 
          backdropFilter: "blur(10px)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)" 
        }}
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      {/* Left panel - Image & Value Prop */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-end p-12 overflow-hidden border-r" style={{ borderColor: "var(--color-border)" }}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2874&auto=format&fit=crop')",
          }}
        />
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 z-10"
          style={{ 
            background: "linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.2) 100%)" 
          }}
        />
        
        {/* Content */}
        <div className="relative z-20 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--color-orange)", boxShadow: "0 0 10px var(--color-orange)" }}></span>
            <span className="text-xs font-semibold" style={{ color: "var(--color-orange)" }}>Portal do Parceiro</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ color: "var(--color-text)", fontFamily: "'DM Sans', sans-serif" }}>
            Aumente as <br/>
            <span className="gradient-text">vendas do seu</span><br/>
            restaurante.
          </h1>
          <p className="text-lg mb-8 font-light" style={{ color: "var(--color-text-muted)" }}>
            Junte-se a centenas de restaurantes no Food Pronto e alcance novos clientes todos os dias com nosso sistema de delivery simplificado.
          </p>
          
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">+40%</span>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Mais pedidos</span>
            </div>
            <div className="w-px h-12" style={{ background: "var(--color-border)" }}></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">0</span>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Taxa de adesão</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Clerk Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Mobile Logo (only visible on small screens) */}
        <div className="mb-8 text-center lg:hidden">
          <div className="text-4xl mb-3">🍔</div>
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'DM Sans', sans-serif" }}>Food Pronto</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Área dos restaurantes
          </p>
        </div>

        <SignUp
          appearance={{
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            },
            variables: {
              colorPrimary: "#FF6B35",
              colorBackground: "#111111",
              colorText: "#F5F5F5",
              colorTextSecondary: "#888888",
              colorInputBackground: "#1A1A1A",
              colorInputText: "#F5F5F5",
              borderRadius: "16px",
            },
            elements: {
              card: {
                border: "1px solid #2D2D2D",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                background: "rgba(17, 17, 17, 0.7)",
                backdropFilter: "blur(20px)",
                padding: "2rem",
              },
              headerTitle: {
                fontSize: "1.5rem",
                fontFamily: "'DM Sans', sans-serif",
                color: "#FFFFFF"
              },
              headerSubtitle: {
                fontSize: "0.95rem",
              },
              formButtonPrimary: {
                fontSize: "1rem",
                textTransform: "none",
                fontWeight: "600",
              },
              socialButtonsBlockButton: {
                border: "1px solid #2D2D2D",
                background: "#161616",
              }
            },
          }}
        />
      </div>
    </div>
  );
}
