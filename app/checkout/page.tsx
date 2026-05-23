"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, MapPin, User, Phone, FileText, CreditCard, Loader2, Navigation } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Maps State
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    reference: "",
  });

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    const savedRestaurantId = sessionStorage.getItem("restaurantId");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedRestaurantId) setRestaurantId(savedRestaurantId);
    else router.push("/");
  }, []);

  // Initialize Autocomplete once maps is loaded
  useEffect(() => {
    if (!mapsLoaded || !addressInputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "BR" }, 
      fields: ["address_components", "geometry", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      
      let street = "";
      let number = "";
      let neighborhood = "";
      let city = "";
      
      for (const component of place.address_components || []) {
        const type = component.types[0];
        if (type === "route") street = component.long_name;
        if (type === "street_number") number = component.long_name;
        if (type === "sublocality_level_1" || type === "sublocality") neighborhood = component.long_name;
        if (type === "administrative_area_level_2" || type === "locality") city = component.long_name;
      }
      
      setForm(prev => ({
        ...prev,
        street: street || place.formatted_address?.split(',')[0] || prev.street,
        number: number || prev.number,
        neighborhood: neighborhood || prev.neighborhood,
        city: city || prev.city,
      }));
    });
  }, [mapsLoaded]);

  const handleLocateMe = () => {
    if (!mapsLoaded || !window.google) return;
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada neste navegador.");
      return;
    }

    setLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
        
        geocoder.geocode({ location: latlng }, (results, status) => {
          setLocating(false);
          if (status === "OK" && results && results[0]) {
            const place = results[0];
            
            let street = "";
            let number = "";
            let neighborhood = "";
            let city = "";
            
            for (const component of place.address_components || []) {
              const type = component.types[0];
              if (type === "route") street = component.long_name;
              if (type === "street_number") number = component.long_name;
              if (type === "sublocality_level_1" || type === "sublocality") neighborhood = component.long_name;
              if (type === "administrative_area_level_2" || type === "locality") city = component.long_name;
            }
            
            setForm(prev => ({
              ...prev,
              street: street || prev.street,
              number: number || prev.number,
              neighborhood: neighborhood || prev.neighborhood,
              city: city || prev.city,
            }));
          } else {
            alert("Não foi possível identificar o endereço exato.");
          }
        });
      },
      (err) => {
        setLocating(false);
        alert("Erro ao obter sua localização. Verifique as permissões do navegador.");
      },
      { enableHighAccuracy: true }
    );
  };

  const restaurant = useQuery(
    api.restaurants.getRestaurant,
    restaurantId ? { restaurantId: restaurantId as Id<"restaurants"> } : "skip"
  );

  const createOrder = useMutation(api.orders.createOrder);
  const createPayment = useAction(api.payments.createPaymentPreference);

  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = cartSubtotal + deliveryFee;

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function isFormValid() {
    return (
      form.customerName.trim() &&
      form.customerPhone.trim() &&
      form.street.trim() &&
      form.number.trim() &&
      form.neighborhood.trim() &&
      form.city.trim()
    );
  }

  async function handleSubmit() {
    if (!isFormValid() || !restaurantId || !restaurant) return;
    setLoading(true);
    setError(null);

    try {
      const orderId = await createOrder({
        restaurantId: restaurantId as Id<"restaurants">,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: {
          street: form.street,
          number: form.number,
          complement: form.complement || undefined,
          neighborhood: form.neighborhood,
          city: form.city,
          reference: form.reference || undefined,
        },
        items: cart.map((item) => ({
          menuItemId: item.menuItemId as Id<"menuItems">,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        totalAmount: cartSubtotal,
        deliveryFee,
      });

      // Bypassing Mercado Pago for testing
      // const baseUrl = window.location.origin;
      // const payment = await createPayment({
      //   orderId,
      //   restaurantId: restaurantId as Id<"restaurants">,
      //   items: cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      //   deliveryFee,
      //   totalAmount: total,
      //   customerName: form.customerName,
      //   customerPhone: form.customerPhone,
      //   backUrls: {
      //     success: `${baseUrl}/acompanhamento/${orderId}?payment=success`,
      //     failure: `${baseUrl}/acompanhamento/${orderId}?payment=failure`,
      //     pending: `${baseUrl}/acompanhamento/${orderId}?payment=pending`,
      //   },
      // });

      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("restaurantId");

      // Redirect immediately to success for testing
      router.push(`/acompanhamento/${orderId}?payment=success`);
      // const isDev = process.env.NODE_ENV === "development";
      // window.location.href = isDev ? payment.sandboxInitPoint : payment.initPoint;
    } catch (err: any) {
      setError(err.message || "Erro ao processar pedido. Tente novamente.");
      setLoading(false);
    }
  }

  if (!restaurantId) return null;

  return (
    <div className="min-h-dvh pb-32" style={{ background: "var(--color-bg)" }}>
      {/* Script Google Maps */}
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        strategy="lazyOnload"
        onLoad={() => setMapsLoaded(true)}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-bold text-lg">Finalizar Pedido</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6 flex flex-col gap-5">
        {/* Order summary */}
        <section className="glass-card p-4">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Resumo do Pedido
          </h2>
          <div className="flex flex-col gap-2">
            {cart.map((item) => (
              <div key={item.menuItemId} className="flex justify-between text-sm">
                <span style={{ color: "var(--color-text-muted)" }}>
                  {item.quantity}x {item.name}
                </span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
              <span>R$ {cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-muted)" }}>Taxa de entrega</span>
              <span>{deliveryFee === 0 ? <span style={{ color: "#22c55e" }}>Grátis</span> : `R$ ${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span style={{ color: "var(--color-orange)" }}>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Customer info */}
        <section className="glass-card p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User size={16} style={{ color: "var(--color-orange)" }} />
            Seus dados
          </h2>
          <div className="flex flex-col gap-3">
            <InputField
              label="Nome completo"
              value={form.customerName}
              onChange={(v) => updateForm("customerName", v)}
              placeholder="João Silva"
              required
            />
            <InputField
              label="WhatsApp"
              value={form.customerPhone}
              onChange={(v) => updateForm("customerPhone", v)}
              placeholder="(11) 99999-9999"
              type="tel"
              required
            />
          </div>
        </section>

        {/* Delivery address */}
        <section className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin size={16} style={{ color: "var(--color-orange)" }} />
              Endereço de entrega
            </h2>
            <button 
              onClick={handleLocateMe}
              disabled={locating || !mapsLoaded}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ background: "rgba(255, 107, 53, 0.1)", color: "var(--color-orange)" }}
            >
              {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {locating ? "Localizando..." : "Usar minha localização"}
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Campo especial Autocomplete */}
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>
                Rua / Avenida <span style={{ color: "var(--color-orange)" }}>*</span>
              </label>
              <input
                ref={addressInputRef}
                type="text"
                value={form.street}
                onChange={(e) => updateForm("street", e.target.value)}
                placeholder="Busque sua rua ou avenida..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Número" value={form.number} onChange={(v) => updateForm("number", v)} placeholder="123" required />
              <InputField label="Complemento" value={form.complement} onChange={(v) => updateForm("complement", v)} placeholder="Apto 4B" />
            </div>
            <InputField label="Bairro" value={form.neighborhood} onChange={(v) => updateForm("neighborhood", v)} placeholder="Centro" required />
            <InputField label="Cidade" value={form.city} onChange={(v) => updateForm("city", v)} placeholder="São Paulo" required />
            <InputField
              label="Ponto de referência"
              value={form.reference}
              onChange={(v) => updateForm("reference", v)}
              placeholder="Próximo ao mercado X"
              icon={<FileText size={14} />}
            />
          </div>
        </section>

        {/* Payment method info */}
        <section className="glass-card p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <CreditCard size={16} style={{ color: "var(--color-orange)" }} />
            Pagamento
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Você será redirecionado para o Mercado Pago para pagar com cartão, Pix ou boleto. O pagamento é processado com segurança.
          </p>
        </section>

        {error && (
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            {error}
          </div>
        )}
      </main>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}>
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Pagar R$ {total.toFixed(2)} com Mercado Pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label} {required && <span style={{ color: "var(--color-orange)" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
      />
    </div>
  );
}

