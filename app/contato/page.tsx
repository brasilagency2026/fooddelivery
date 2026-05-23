"use client";

import { ArrowLeft, MessageCircle, Mail, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContatoPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95" style={{ background: "var(--color-surface)" }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-bold text-lg">Contato</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--color-orange-glow)" }}>
            <MessageCircle size={32} style={{ color: "var(--color-orange)" }} />
          </div>
          <h2 className="text-xl font-bold mb-2">Fale Conosco</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Tem alguma dúvida ou precisa de ajuda com o sistema Food Pronto? Entre em contato pelos canais abaixo.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          
          <a href="https://wa.me/5513982032534" target="_blank" rel="noopener noreferrer">
            <div className="glass-card p-4 flex items-center gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">WhatsApp</h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>(13) 98203-2534</p>
              </div>
            </div>
          </a>

          <a href="mailto:delivery@foodpronto.com.br">
            <div className="glass-card p-4 flex items-center gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">E-mail</h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>delivery@foodpronto.com.br</p>
              </div>
            </div>
          </a>

          <div className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} style={{ color: "var(--color-orange)" }} />
              <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Dados da Empresa</h3>
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>CNPJ: 64.465.357/0001-28</p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
