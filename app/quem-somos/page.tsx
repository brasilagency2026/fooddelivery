import { ArrowLeft, CheckCircle2, Smartphone, Store, Truck, Umbrella } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem Somos | Food Pronto",
  description: "Conheça nossa missão de digitalizar bares, restaurantes, food trucks e quiosques de forma fácil, rápida e econômica.",
};

export default function QuemSomosPage() {
  const products = [
    {
      title: "Quiosque Praia",
      url: "quiosquepraia.com.br",
      icon: Umbrella,
      description: "A solução perfeita para quiosques de praia. Permite que os garçons atendam e sirvam os clientes diretamente nos guarda-sóis com um cardápio 100% digital e pedidos em tempo real.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Food Pronto",
      url: "foodpronto.com.br",
      icon: Store,
      description: "Ideal para food trucks e estabelecimentos de balcão. O cliente faz o pedido pelo menu digital e recebe um alerta sonoro e visual em seu celular assim que o pedido está pronto para ser retirado.",
      color: "from-orange-500 to-amber-400"
    },
    {
      title: "Delivery Food Pronto",
      url: "delivery.foodpronto.com.br",
      icon: Truck,
      description: "A plataforma completa para gerenciar o delivery do seu restaurante. Catálogo digital, cálculo de taxa de entrega, e gestão de pedidos simplificada para você vender mais.",
      color: "from-red-500 to-rose-400"
    }
  ];

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-3xl mx-auto flex items-center">
          <Link href="/" className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-orange)]" style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft size={18} />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 pb-24">
        
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Nossa missão é <br className="hidden md:block" />
            <span className="gradient-text">popularizar o cardápio digital</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Trazemos a transformação digital para bares, restaurantes, food trucks e quiosques de praia. 
            Permitimos uma inclusão fácil, rápida e econômica no mundo das vendas online.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="glass-card p-6 md:p-8 mb-16 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
              <Smartphone size={32} style={{ color: "var(--color-orange)" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-[var(--color-text)]">Tudo via Mercado Pago</h2>
              <p style={{ color: "var(--color-text-muted)" }}>
                Chega de complicações. Nossas 3 aplicações são integradas a uma única conta Mercado Pago, 
                garantindo que você receba os pagamentos digitais dos seus clientes de forma segura e com o 
                dinheiro caindo direto na sua conta, sem intermediários segurando seu fluxo de caixa.
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Nossas Aplicações
        </h2>
        
        <div className="grid gap-6">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <div 
                key={product.title}
                className="glass-card p-6 relative overflow-hidden animate-slide-up group hover:border-[var(--color-orange)] transition-colors"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${product.color} text-white shadow-lg`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 text-[var(--color-text)]">{product.title}</h3>
                    <a href={`https://${product.url}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium mb-4 inline-block hover:underline" style={{ color: "var(--color-orange)" }}>
                      {product.url}
                    </a>
                    <p style={{ color: "var(--color-text-muted)" }} className="leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
          <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} Food Pronto
          </p>
        </div>
      </footer>
    </div>
  );
}
