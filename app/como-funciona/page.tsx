import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CreditCard, Smartphone, Zap, Shield, Clock, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Como Funciona | Food Pronto Delivery",
  description: "Entenda como o Food Pronto Delivery ajuda restaurantes a vender mais com pagamentos rápidos via Mercado Pago e comunicação fácil com motoboys via WhatsApp.",
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-orange)]" style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft size={18} /> Voltar
          </Link>
          <h1 className="font-bold text-lg">Como Funciona</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 pb-24">
        <section className="text-center mb-16 animate-slide-up">
          <p className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: "var(--color-orange)" }}>Para donos de restaurante</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ lineHeight: 1.05 }}>
            Food Pronto Delivery é a plataforma que entrega simplicidade, velocidade e controle para seu delivery.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Configure seu restaurante, aceite pedidos online, receba pagamentos via Mercado Pago e conecte seus motoboys pelo WhatsApp com apenas alguns cliques.
          </p>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            O portal é geolocalizado: seus clientes veem os entregadores mais próximos em um mapa e também em uma lista ordenada por distância.
          </p>
          <p className="mt-6 text-base font-semibold" style={{ color: "var(--color-orange)" }}>
            Sem risco: os primeiros 30 dias são gratuitos. Depois, a mensalidade é de apenas R$ 150.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 mb-16">
          <div className="glass-card p-6 rounded-3xl" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255, 165, 0, 0.15)", color: "var(--color-orange)" }}>
                <Smartphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Simplicidade total</h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Cadastre restaurante, cardápio e taxas em poucos minutos com uma interface limpa e fácil de usar.
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Mesmo sem experiência em tecnologia, você consegue começar a receber pedidos em poucos passos. Tudo é pensado para donos de restaurante e equipes operando delivery.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Pagamento rápido com Mercado Pago</h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Aceite cartão, Pix e outras formas digitais diretamente pela plataforma.
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Seus clientes pagam fácil e você recebe o valor do pedido de forma segura e confiável, sem perda de vendas ou atrasos.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">WhatsApp para motoboys</h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Notifique seus motoboys automaticamente pelo WhatsApp quando o pedido estiver pronto.
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Simples e direto: menos chamadas, menos erro de comunicação e mais entregas rápidas e organizadas.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0, 0, 0, 0.15)", color: "var(--color-text)" }}>
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Portal geolocalizado</h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Cliente e motoboy veem o status da entrega com mapa e lista de opções mais próximas.
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Seus clientes escolhem o delivery mais próximo e acompanham a rota em tempo real para maior transparência.
            </p>
          </div>
        </section>

        <section className="mb-16 animate-slide-up" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-border)", borderRadius: "28px", padding: "32px" }}>
          <div className="flex flex-col gap-8 md:flex-row items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Como o aplicativo funciona para seu restaurante</h2>
              <p className="leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                O Food Pronto Delivery conecta o restaurante, o cliente e os motoboys em uma operação única. Você cadastra o menu, define valores e recebe os pedidos já com pagamento confirmado pelo Mercado Pago.
              </p>
            </div>
            <div className="w-full md:w-auto p-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255, 165, 0, 0.15)", color: "var(--color-orange)" }}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Configuração rápida</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Cadastre seu restaurante em poucos minutos.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Receba rápido</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Mercado Pago integrado para pagamentos imediatos.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Entrega conectada</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Notifique motoboys via WhatsApp com o link de entrega.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3 mb-16">
          {[
            {
              title: "1. Cadastro do Restaurante",
              description: "Preencha nome, endereço, taxa de entrega e horários de atendimento para começar a receber pedidos online.",
              icon: Smartphone,
            },
            {
              title: "2. Menu e preços",
              description: "Adicione produtos, categorias e fotos. O cliente vê tudo no app e finaliza o pedido sem precisar ligar.",
              icon: CreditCard,
            },
            {
              title: "3. Entrega e motoboys",
              description: "Envie o pedido pronto diretamente no WhatsApp do motoboy, com endereço, referência e link para status.",
              icon: Zap,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-card p-6 rounded-3xl" style={{ border: "1px solid var(--color-border)" }}>
                <div className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", color: "var(--color-text)" }}>
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{item.description}</p>
              </div>
            );
          })}
        </section>

        <section className="text-center animate-slide-up">
          <div className="max-w-2xl mx-auto p-10 rounded-[32px]" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-3xl font-bold mb-4">Por que escolher o Food Pronto Delivery?</h2>
            <p className="mb-8 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Porque ele foi criado para donos de restaurante que querem reduzir a complexidade do delivery, acelerar os pagamentos e ter uma comunicação direta com os motoboys, sem precisar de sistemas separados.
            </p>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm font-semibold mb-2">Simples de usar</p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Navegação intuitiva para você e sua equipe.</p>
              </div>
              <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm font-semibold mb-2">Pagamentos confiáveis</p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Mercado Pago integrado para receber rápido.</p>
              </div>
              <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm font-semibold mb-2">Comunicação direta</p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>WhatsApp para avisar seus motoboys imediatamente.</p>
              </div>
            </div>

            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-bold transition-transform hover:scale-105"
              style={{ background: "var(--color-orange)", color: "white" }}
            >
              Começar agora
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
