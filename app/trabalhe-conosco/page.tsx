"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, DollarSign, Gift, Rocket, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function TrabalheConoscoPage() {
  const [clients, setClients] = useState(10);
  const planValue = 150;
  const commissionRate = 0.5; // 50%
  const commissionPerClient = planValue * commissionRate;
  const totalEarnings = clients * commissionPerClient;

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Como recebo minhas comissões?",
      answer: "As comissões são pagas mensalmente diretamente na sua conta bancária ou Mercado Pago cadastrada, sempre que o cliente renovar a assinatura."
    },
    {
      question: "Preciso pagar algo para ser parceiro?",
      answer: "Não! O programa de parceiros é 100% gratuito. Você não paga nada para se cadastrar ou para começar a vender."
    },
    {
      question: "Tem limite de indicações?",
      answer: "Não há limite! Quanto mais clientes você indicar, mais você ganha. O céu é o limite para as suas comissões recorrentes."
    },
    {
      question: "Como o cliente sabe que fui eu que indiquei?",
      answer: "Você receberá um link exclusivo e um cupom de desconto. Quando o restaurante se cadastrar usando seu link ou cupom, o sistema atrela a conta dele à sua."
    }
  ];

  return (
    <div className="min-h-dvh font-sans" style={{ background: "#0a0a0a", color: "#ffffff" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm transition-colors hover:text-[#22c55e]" style={{ color: "rgba(255,255,255,0.6)" }}>
            <ArrowLeft size={18} />
            Voltar
          </Link>
          <span className="font-bold">Food Pronto</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 pb-24">
        
        {/* Hero Section */}
        <div className="text-center mb-20 animate-slide-up">
          <div className="inline-block px-4 py-1.5 rounded-full mb-6 text-sm font-semibold" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
            ✨ Programa de Parceiros
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Venda Food Pronto.<br />
            <span style={{ color: "#22c55e" }}>Ganhe 50% todo mês.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Seja do nosso programa de parceiros e ganhe comissões recorrentes indicando bares, restaurantes, food trucks e quiosques.
          </p>
          <a 
            href="#cadastro" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105"
            style={{ background: "#22c55e", color: "#000", boxShadow: "0 10px 30px -10px rgba(34, 197, 94, 0.5)" }}
          >
            <Rocket size={20} />
            Quero começar
          </a>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-24 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {[
            { icon: DollarSign, title: "50% do que o cliente paga", desc: "Receba comissões recorrentes todos os meses enquanto o cliente estiver ativo." },
            { icon: Gift, title: "Voucher de desconto", desc: "Ofereça vantagens exclusivas para ajudar a fechar suas vendas mais rápido." },
            { icon: Users, title: "Painel exclusivo", desc: "Acompanhe seus indicados, pagamentos e comissões em tempo real." },
            { icon: Shield, title: "Suporte dedicado", desc: "Material de vendas e suporte para ajudar você a prospectar e vender." }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl transition-colors hover:bg-[rgba(255,255,255,0.05)]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                <item.icon size={20} />
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Calculator */}
        <div className="p-8 md:p-12 rounded-3xl mb-24 relative overflow-hidden animate-slide-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#22c55e", transform: "translate(30%, -30%)" }}></div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Quanto você pode ganhar?</h2>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>Baseado no plano de R$ 150/mês (Sua comissão: R$ 75/mês por cliente)</p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="mb-12">
              <div className="flex justify-between mb-4 font-bold">
                <span>{clients} cliente{clients !== 1 ? 's' : ''}</span>
                <span style={{ color: "#22c55e" }}>R$ {totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={clients} 
                onChange={(e) => setClients(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #22c55e ${(clients / 100) * 100}%, rgba(255,255,255,0.1) ${(clients / 100) * 100}%)` }}
              />
              <style jsx>{`
                input[type=range]::-webkit-slider-thumb {
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: #22c55e;
                  cursor: pointer;
                  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
                }
              `}</style>
            </div>

            <div className="p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="text-center md:text-left">
                <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Ganho estimado em 1 ano:</p>
                <p className="text-2xl font-bold">R$ {(totalEarnings * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Renovação automática:</p>
                <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>SIM</p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-24 animate-slide-up">
          <h2 className="text-3xl font-bold mb-12 text-center">Como funciona?</h2>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-[2px]" style={{ background: "rgba(255,255,255,0.1)", zIndex: 0 }}></div>
            
            {[
              { step: "1", title: "Cadastre-se", desc: "Faça seu cadastro no programa de afiliados." },
              { step: "2", title: "Receba seu link", desc: "Obtenha seu link e cupom exclusivo para divulgar." },
              { step: "3", title: "Indique", desc: "Mostre a solução para donos de restaurantes." },
              { step: "4", title: "Ganhe 50%", desc: "Receba sua comissão todo mês automaticamente." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-6 shadow-xl" style={{ background: "#22c55e", color: "#000" }}>
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-24 animate-slide-up">
          <h2 className="text-3xl font-bold mb-8 text-center">Perguntas frequentes</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden transition-colors" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-[rgba(255,255,255,0.02)]"
                >
                  {faq.question}
                  <ChevronDown size={18} className="transition-transform duration-300 flex-shrink-0 ml-4" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", color: "#22c55e" }} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div id="cadastro" className="text-center p-12 rounded-3xl animate-slide-up" style={{ background: "linear-gradient(145deg, rgba(34,197,94,0.1) 0%, rgba(0,0,0,0) 100%)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar a ganhar comissão?</h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
            Crie sua conta agora, pegue seu link e faça sua primeira venda hoje mesmo.
          </p>
          <a 
            href="/contato" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105"
            style={{ background: "#22c55e", color: "#000", boxShadow: "0 10px 30px -10px rgba(34, 197, 94, 0.5)" }}
          >
            Tornar-se Parceiro
          </a>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="w-full py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.1)", background: "#050505" }}>
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
          <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
            © {new Date().getFullYear()} Food Pronto
          </p>
        </div>
      </footer>
    </div>
  );
}
