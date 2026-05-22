import { MapPin } from "lucide-react";

export function LocationPermission({ onRequest }: { onRequest: () => void }) {
  return (
    <div className="glass-card p-6 text-center mt-8">
      <div
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: "var(--color-orange-glow)" }}
      >
        <MapPin size={28} style={{ color: "var(--color-orange)" }} />
      </div>
      <h2 className="font-bold text-lg mb-2">Precisamos da sua localização</h2>
      <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
        Para encontrar restaurantes que entregam perto de você, precisamos saber onde você está.
      </p>
      <button onClick={onRequest} className="btn-orange">
        Permitir localização
      </button>
    </div>
  );
}
