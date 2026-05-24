"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { 
  fetchAllRestaurantsAdmin, 
  updateRestaurantStatus, 
  deleteRestaurant, 
  addSubscriptionDays,
  generateTransferToken
} from "./actions";

import { Mail, Phone, Link2, UtensilsCrossed, Plus } from "lucide-react";
import Link from "next/link";
import { AdminCreateRestaurantModal } from "@/components/admin/AdminCreateRestaurantModal";

export default function SuperAdminPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

  async function loadRestaurants() {
    try {
      setLoading(true);
      const res = await fetchAllRestaurantsAdmin(convexUrl);
      if (!res.success) {
        setError(res.error || "Erro desconhecido");
        return;
      }
      setRestaurants(res.data || []);
    } catch (err: any) {
      setError(err.message || "Unauthorized or error loading data");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string, currentStatus: string) {
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    const res = await updateRestaurantStatus(convexUrl, id, { approvalStatus: newStatus });
    if (res?.success) await loadRestaurants();
    else alert("Erro: " + res?.error);
  }

  async function handleAddDays(id: string, currentEndDate: number | undefined, days: number) {
    if (confirm(`Adicionar ${days} dias de assinatura?`)) {
      const res = await addSubscriptionDays(convexUrl, id, currentEndDate, days);
      if (res?.success) await loadRestaurants();
      else alert("Erro: " + res?.error);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Tem certeza que deseja DELETAR o restaurante ${name}? Isso apagará todos os itens e pedidos dele.`)) {
      const res = await deleteRestaurant(convexUrl, id);
      if (res?.success) await loadRestaurants();
      else alert("Erro: " + res?.error);
    }
  }

  async function handleGenerateToken(id: string) {
    if (confirm("Gerar um link mágico de transferência para este restaurante?")) {
      const res = await generateTransferToken(convexUrl, id);
      if (res?.success && res.token) {
        const link = `${window.location.origin}/claim?token=${res.token}`;
        navigator.clipboard.writeText(link);
        alert(`Link copiado para a área de transferência!\n\nEnvie este link para o dono assumir o restaurante:\n\n${link}`);
        await loadRestaurants();
      } else {
        alert("Erro ao gerar token: " + res?.error);
      }
    }
  }

  if (loading) {
    return <div className="min-h-dvh flex items-center justify-center">Carregando painel de controle...</div>;
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] p-6">
      {showCreateModal && (
        <AdminCreateRestaurantModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRestaurants();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Super Admin</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Gerenciamento de Restaurantes e Assinaturas</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-orange flex items-center gap-2"
            >
              <Plus size={16} />
              Criar Restaurante
            </button>
            <UserButton />
          </div>
        </div>

        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-4 font-semibold text-sm">Restaurante</th>
                <th className="p-4 font-semibold text-sm">Contato</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm">Assinatura</th>
                <th className="p-4 font-semibold text-sm">Vencimento</th>
                <th className="p-4 font-semibold text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((rest) => {
                const isApproved = rest.approvalStatus === "approved";
                const isTrial = rest.subscriptionStatus === "trial";
                const endDate = rest.subscriptionEndDate ? new Date(rest.subscriptionEndDate) : null;
                const isExpired = endDate ? endDate.getTime() < Date.now() : true;
                
                const rawPhone = rest.phone ? rest.phone.replace(/\D/g, '') : '';
                const whatsappLink = rawPhone ? `https://wa.me/55${rawPhone}` : '#';

                return (
                  <tr key={rest._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                    <td className="p-4">
                      <p className="font-bold">{rest.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{rest.city} - {rest.state}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {rest.phone ? (
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500/20 transition" title={`WhatsApp: ${rest.phone}`}>
                            <Phone size={16} />
                          </a>
                        ) : (
                          <span className="p-1.5 bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-full opacity-50" title="Sem WhatsApp">
                            <Phone size={16} />
                          </span>
                        )}
                        
                        {rest.ownerEmail && rest.ownerEmail !== "N/A" ? (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(rest.ownerEmail);
                              alert("E-mail copiado: " + rest.ownerEmail);
                            }}
                            className="p-1.5 bg-blue-500/10 text-blue-500 rounded-full hover:bg-blue-500/20 transition" 
                            title={`Copiar E-mail: ${rest.ownerEmail}`}
                          >
                            <Mail size={16} />
                          </button>
                        ) : (
                          <span className="p-1.5 bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-full opacity-50" title="Sem e-mail">
                            <Mail size={16} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleApprove(rest._id, rest.approvalStatus)}
                        className={`px-3 py-1 text-xs font-bold rounded-full ${isApproved ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}
                      >
                        {isApproved ? "Aprovado" : "Pendente"}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${isTrial ? 'bg-purple-500/10 text-purple-500' : (isExpired ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500')}`}>
                        {rest.subscriptionStatus === "trial" ? "Trial (Teste)" : "Ativo"}
                      </span>
                    </td>
                    <td className="p-4">
                      {endDate ? (
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${isExpired ? 'text-red-500' : ''}`}>
                            {endDate.toLocaleDateString("pt-BR")}
                          </span>
                          {isExpired && <span className="text-xs text-red-500">Expirado</span>}
                        </div>
                      ) : "Sem data"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/superadmin/menu/${rest._id}`}
                            className="px-3 py-1.5 text-xs font-bold bg-[var(--color-orange)] text-white rounded hover:opacity-90 flex items-center gap-1 transition"
                            title="Gerenciar Cardápio"
                          >
                            <UtensilsCrossed size={14} />
                            Menu
                          </Link>
                          
                          <button 
                            onClick={() => handleGenerateToken(rest._id)}
                            className="px-3 py-1.5 text-xs font-bold bg-gray-700 text-white rounded hover:bg-gray-800 flex items-center gap-1 transition"
                            title="Gerar link de transferência"
                          >
                            <Link2 size={14} />
                            Transferir
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAddDays(rest._id, rest.subscriptionEndDate, 30)}
                            className="px-3 py-1.5 text-xs font-bold bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            title="Adicionar 30 dias de assinatura"
                          >
                            +30 Dias
                          </button>
                          <button 
                            onClick={() => handleDelete(rest._id, rest.name)}
                            className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded hover:bg-red-600 transition"
                            title="Apagar Restaurante"
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {restaurants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">Nenhum restaurante encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
