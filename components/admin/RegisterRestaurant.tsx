"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapPin, Loader2, Store } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function RegisterRestaurant({ ownerId }: { ownerId: string }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    state: "",
    city: "",
    cuisine: "",
    phone: "",
    deliveryRadiusKm: 10,
    deliveryFee: 5,
    estimatedTimeMinutes: 40,
    latitude: 0,
    longitude: 0,
    affiliateVoucher: "",
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationOk, setLocationOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const createRestaurant = useMutation(api.restaurants.createRestaurant);
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const initAutocomplete = () => {
      if (!addressInputRef.current) return;
      const autocomplete = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: "br" },
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setForm(p => ({ 
            ...p, 
            latitude: place.geometry!.location!.lat(), 
            longitude: place.geometry!.location!.lng() 
          }));
          setLocationOk(true);
        }
      });
    };

    if ((window as any).google?.maps?.places) {
      initAutocomplete();
    } else {
      const existingScript = document.getElementById("google-maps-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initAutocomplete);
      }
    }
  }, []);

  function getLocation() {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocationOk(true);
        setGettingLocation(false);
      },
      () => {
        alert("Não foi possível obter sua localização. Verifique as permissões.");
        setGettingLocation(false);
      }
    );
  }

  async function handleSubmit() {
    if (!form.name || !form.state || !form.city || !form.phone || !locationOk) return;
    setSaving(true);
    try {
      await createRestaurant({
        ownerId,
        name: form.name,
        description: form.description,
        state: form.state,
        city: form.city,
        cuisine: form.cuisine || undefined,
        phone: form.phone || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
        deliveryRadiusKm: form.deliveryRadiusKm,
        deliveryFee: form.deliveryFee,
        estimatedTimeMinutes: form.estimatedTimeMinutes,
        affiliateVoucher: form.affiliateVoucher || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { label: "Nome do restaurante *", key: "name", placeholder: "Ex: Burguer Palace" },
    { label: "Descrição *", key: "description", placeholder: "O que você serve? O que te diferencia?" },
    { label: "Estado (UF) *", key: "state", placeholder: "Ex: SP" },
    { label: "Cidade *", key: "city", placeholder: "Ex: São Paulo" },
    { label: "Tipo de culinária", key: "cuisine", placeholder: "Ex: Hambúrgueres, Pizza, Japonesa..." },
    { label: "WhatsApp do restaurante *", key: "phone", placeholder: "(11) 99999-9999" },
    { label: "Código do Parceiro / Voucher (Opcional)", key: "affiliateVoucher", placeholder: "Ex: FOOD50" },
  ];

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      <header className="px-4 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Store size={20} style={{ color: "var(--color-orange)" }} />
          <span className="font-bold gradient-text">Food Pronto</span>
        </div>
        <UserButton />
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Cadastre seu restaurante</h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            Preencha os dados abaixo para começar a receber pedidos. Seu cadastro será analisado em até 24h.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Text fields */}
          {fields.map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>{label}</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          ))}

          {/* Delivery settings */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Raio (km)", key: "deliveryRadiusKm", min: 1, step: 1 },
              { label: "Taxa (R$)", key: "deliveryFee", min: 0, step: 0.5 },
              { label: "Tempo (min)", key: "estimatedTimeMinutes", min: 10, step: 5 },
            ].map(({ label, key, min, step }) => (
              <div key={key}>
                <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>{label}</label>
                <input
                  type="number"
                  value={(form as any)[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  min={min}
                  step={step}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                />
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="glass-card p-4">
            <p className="text-sm font-semibold mb-1">Localização do restaurante (GPS) *</p>
            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
              Você pode capturar sua localização atual ou digitar manualmente as coordenadas (Latitude/Longitude).
            </p>
            
            <div className="mb-4">
              <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Digite o endereço completo</label>
              <input
                ref={addressInputRef}
                type="text"
                placeholder="Ex: Av. Paulista, 1000 - São Paulo"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
              {locationOk && (
                <p className="text-xs text-green-500 mt-1 font-semibold">Localização capturada com sucesso!</p>
              )}
            </div>

            <button
              onClick={getLocation}
              disabled={gettingLocation}
              className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-all w-full"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            >
              {gettingLocation ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <MapPin size={15} style={{ color: "var(--color-orange)" }} />
              )}
              Capturar minha localização atual via GPS
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.state || !form.city || !form.phone || !form.description || !locationOk || saving}
            className="btn-orange flex items-center justify-center gap-2 mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Enviar cadastro para análise"}
          </button>
        </div>
      </main>
    </div>
  );
}
