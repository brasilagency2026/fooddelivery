"use client";

import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, Suspense } from "react";
import { Store, Loader2, CheckCircle2 } from "lucide-react";

function ClaimContent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const claimRestaurant = useMutation(api.admin.claimRestaurant);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Nenhum token fornecido. O link é inválido.");
    }
  }, [token]);

  async function handleClaim() {
    if (!token || !user) return;
    
    setLoading(true);
    setError("");
    
    try {
      await claimRestaurant({
        transferToken: token,
        newOwnerId: user.id,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (e: any) {
      setError(e.message || "Erro ao assumir restaurante. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 size={32} className="animate-spin text-[var(--color-orange)]" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="glass-card max-w-md w-full p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center mb-6 shadow-sm border border-[var(--color-border)]">
          <Store size={32} className="text-[var(--color-orange)]" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Assumir Restaurante</h1>
        
        {!token ? (
          <p className="text-red-500 mt-4 font-medium">{error}</p>
        ) : success ? (
          <div className="flex flex-col items-center mt-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 size={48} className="text-green-500 mb-4" />
            <p className="text-green-500 font-bold text-lg mb-2">Restaurante transferido com sucesso!</p>
            <p className="text-[var(--color-text-muted)] text-sm">Redirecionando para o seu painel...</p>
          </div>
        ) : !isSignedIn ? (
          <div className="mt-4 flex flex-col items-center w-full">
            <p className="text-[var(--color-text-muted)] mb-6 text-sm">
              Você recebeu um convite para gerenciar um restaurante já configurado.
              Crie uma conta ou faça login para continuar.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <SignUpButton mode="modal" forceRedirectUrl={`/claim?token=${token}`}>
                <button className="btn-orange w-full py-3 text-base">
                  Criar minha conta
                </button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl={`/claim?token=${token}`}>
                <button className="px-4 py-3 text-sm font-semibold rounded-xl transition-all" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                  Já tenho uma conta (Login)
                </button>
              </SignInButton>
            </div>
          </div>
        ) : (
          <div className="mt-4 w-full">
            <p className="text-[var(--color-text-muted)] mb-6 text-sm">
              Você está conectado como <strong className="text-[var(--color-text)]">{user.primaryEmailAddress?.emailAddress}</strong>.
              Clique abaixo para assumir o controle do restaurante.
            </p>
            
            {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}
            
            <button 
              onClick={handleClaim}
              disabled={loading}
              className="btn-orange w-full py-3 text-base flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Assumir meu restaurante agora"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 size={32} className="animate-spin text-[var(--color-orange)]" />
      </div>
    }>
      <ClaimContent />
    </Suspense>
  );
}
