"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface SubscriptionCardProps {
  subscriptionStatus?: string;
  subscriptionEndDate?: number;
  restaurantName: string;
}

export default function SubscriptionCard({ subscriptionStatus, subscriptionEndDate, restaurantName }: SubscriptionCardProps) {
  const isTrial = subscriptionStatus === "trial";
  const endDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
  const now = new Date();
  
  let daysRemaining = 0;
  if (endDate) {
    const diffTime = endDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 5;

  const paymentLink = process.env.NEXT_PUBLIC_MP_SUBSCRIPTION_LINK || "https://wa.me/5535999999999?text=Quero%20renovar%20minha%20assinatura";

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          {isTrial ? "Período de Teste" : "Assinatura Ativa"}
          {!isExpired && <CheckCircle size={18} className="text-green-500" />}
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isExpired ? "bg-red-500/10 text-red-500" : 
          isExpiringSoon ? "bg-orange-500/10 text-orange-500" : 
          "bg-green-500/10 text-green-500"
        }`}>
          {isExpired ? "Expirado" : isExpiringSoon ? "Vence em breve" : "Ativo"}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Vencimento do seu plano:</p>
          <p className={`text-2xl font-bold ${isExpired ? "text-red-500" : ""}`}>
            {endDate ? endDate.toLocaleDateString("pt-BR") : "Data não definida"}
          </p>
          {endDate && (
            <p className="text-sm flex items-center gap-1 mt-1">
              <Clock size={14} className={isExpired ? "text-red-500" : "text-orange-400"} />
              {isExpired ? (
                <span className="text-red-500">Seu plano expirou. O restaurante será pausado.</span>
              ) : (
                <span className="text-[var(--color-text-muted)]">Restam {daysRemaining} dias</span>
              )}
            </p>
          )}
        </div>

        {(isExpired || isExpiringSoon || isTrial) && (
          <div className="pt-4 border-t border-[var(--color-border)] mt-2">
            <div className="flex items-start gap-3 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-4">
              <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-500 mb-1">Renove sua assinatura</p>
                <p className="text-xs text-blue-400/80">
                  Para continuar recebendo pedidos sem interrupções, realize o pagamento da sua assinatura mensal. 
                  Após o pagamento, sua conta será atualizada rapidamente.
                </p>
              </div>
            </div>
            
            <a 
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 text-center rounded-xl font-bold text-white transition-all bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            >
              Pagar Assinatura
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
