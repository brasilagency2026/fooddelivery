"use client";

import { MenuManager } from "@/components/admin/MenuManager";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SuperAdminMenuPage() {
  const params = useParams();
  const restaurantId = params.id as string;

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Link href="/admin/superadmin" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4">
            <ArrowLeft size={16} />
            Voltar para Super Admin
          </Link>
          <h1 className="text-2xl font-bold">Gerenciar Cardápio</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Adicione e edite os itens do cardápio para este restaurante.</p>
        </div>

        <MenuManager restaurantId={restaurantId as Id<"restaurants">} />
      </div>
    </div>
  );
}
