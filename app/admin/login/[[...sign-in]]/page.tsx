import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
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
        {/* Abstract Dark Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            background: "radial-gradient(circle at right center, rgba(255, 107, 53, 0.15) 0%, rgba(10, 10, 10, 1) 60%)" 
          }}
        />
        {/* Transparent Graphic Vector */}
        <div className="absolute top-20 -right-20 z-0 opacity-40 w-[600px] h-[600px] pointer-events-none transition-transform duration-1000 hover:scale-105">
          <img 
            src="https://api.iconify.design/ic:round-delivery-dining.svg?color=white" 
            alt="Delivery Courier Graphic"
            className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,107,53,0.5)]"
          />
        </div>
        
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
          <ul className="text-base mb-8 font-light flex flex-col gap-3" style={{ color: "var(--color-text-muted)" }}>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Simples e rápido:</strong> Cadastro liberado na hora.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Sem maquininha:</strong> Receba direto pelo Mercado Pago.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Pagamento antecipado:</strong> Receba antes de entregar.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Sem surpresas:</strong> Plano fixo de apenas R$ 150/mês.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Zero risco:</strong> Os primeiros 30 dias são grátis para testar.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right panel - Clerk Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Mobile Header & Value Prop (only visible on small screens) */}
        <div className="mb-8 w-full max-w-sm lg:hidden">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img 
                src="https://api.iconify.design/ic:round-delivery-dining.svg?color=%23FF6B35" 
                alt="Delivery Courier Graphic"
                className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,107,53,0.4)]"
              />
            </div>
            <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'DM Sans', sans-serif" }}>Food Pronto Delivery</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Portal do Parceiro
            </p>
          </div>
          
          <ul className="text-sm font-light flex flex-col gap-2 mb-2 p-4 rounded-xl" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Simples:</strong> Cadastro na hora</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Mercado Pago:</strong> Sem maquininha</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">Seguro:</strong> Receba antes de entregar</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">R$ 150/mês fixo:</strong> Sem surpresas</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 
              <span><strong className="text-white font-medium">30 Dias Grátis:</strong> Teste sem risco</span>
            </li>
          </ul>
        </div>

        <SignIn
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
