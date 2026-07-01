"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, MapPin, User, FileText, CreditCard, Loader2, Navigation, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variationName?: string;
  notes?: string;
}

// Steps: "form" → "payment"
type Step = "form" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);
  const brickControllerRef = useRef<any>(null);

  // Google Maps State
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
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

  // Initialize Google Maps Autocomplete
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
      let street = "", number = "", neighborhood = "", city = "";
      for (const component of place.address_components || []) {
        const type = component.types[0];
        if (type === "route") street = component.long_name;
        if (type === "street_number") number = component.long_name;
        if (type === "sublocality_level_1" || type === "sublocality") neighborhood = component.long_name;
        if (type === "administrative_area_level_2" || type === "locality") city = component.long_name;
      }
      setForm(prev => ({
        ...prev,
        street: street || place.formatted_address?.split(",")[0] || prev.street,
        number: number || prev.number,
        neighborhood: neighborhood || prev.neighborhood,
        city: city || prev.city,
      }));
    });
  }, [mapsLoaded]);

  const handleLocateMe = () => {
    if (!mapsLoaded || !window.google) { alert("Mapas ainda carregando..."); return; }
    if (!navigator.geolocation) { alert("Geolocalização não suportada."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: position.coords.latitude, lng: position.coords.longitude } }, (results, status) => {
          setLocating(false);
          if (status === "OK" && results?.[0]) {
            const place = results[0];
            let street = "", number = "", neighborhood = "", city = "";
            for (const component of place.address_components || []) {
              const type = component.types[0];
              if (type === "route") street = component.long_name;
              if (type === "street_number") number = component.long_name;
              if (type === "sublocality_level_1" || type === "sublocality" || type === "neighborhood") neighborhood = component.long_name;
              if (type === "administrative_area_level_2" || type === "locality") city = component.long_name;
            }
            setForm(prev => ({ ...prev, street: street || prev.street, number: number || prev.number, neighborhood: neighborhood || prev.neighborhood, city: city || prev.city }));
          }
        });
      },
      (err) => { setLocating(false); alert(`Erro: ${err.message}`); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const restaurant = useQuery(
    api.restaurants.getRestaurant,
    restaurantId ? { restaurantId: restaurantId as Id<"restaurants"> } : "skip"
  );

  const createOrder = useMutation(api.orders.createOrder);
  const getMpPublicKeyAction = useAction(api.payments.getMpPublicKey);
  const processPaymentAction = useAction(api.payments.processPayment);

  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = cartSubtotal + deliveryFee;

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function isFormValid() {
    return Boolean(
      form.customerName.trim() &&
      form.customerPhone.trim() &&
      form.customerEmail.trim() &&
      form.street.trim() &&
      form.number.trim()
    );
  }

  // Step 1: validate form, create order, fetch MP public key, go to payment step
  async function handleProceedToPayment() {
    if (!isFormValid() || !restaurantId || !restaurant) return;
    setLoading(true);
    setError(null);
    try {
      // Create order with awaiting_payment status
      const newOrderId = await createOrder({
        restaurantId: restaurantId as Id<"restaurants">,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: {
          street: form.street,
          number: form.number,
          complement: form.complement || undefined,
          neighborhood: form.neighborhood || undefined,
          city: form.city || undefined,
          reference: form.reference || undefined,
        },
        items: cart.map((item) => ({
          menuItemId: item.menuItemId as Id<"menuItems">,
          name: item.name,
          variationName: item.variationName,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        totalAmount: cartSubtotal,
        deliveryFee,
      });

      // Save order to history
      const currentOrders = JSON.parse(localStorage.getItem("myOrders") || "[]");
      localStorage.setItem("myOrders", JSON.stringify([newOrderId, ...currentOrders.filter((id: string) => id !== newOrderId)].slice(0, 10)));

      // Get MP public key
      const publicKey = await getMpPublicKeyAction({ restaurantId: restaurantId as Id<"restaurants"> });

      setOrderId(newOrderId);
      setMpPublicKey(publicKey);
      setStep("payment");
    } catch (err: any) {
      setError(err.message || "Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: initialize Payment Brick once we have publicKey and orderId
  const initBrick = useCallback(async () => {
    if (!mpPublicKey || !orderId || !window.MercadoPago) return;
    if (brickControllerRef.current) {
      await brickControllerRef.current.unmount();
      brickControllerRef.current = null;
    }

    const mp = new window.MercadoPago(mpPublicKey, { locale: "pt-BR" });
    const bricksBuilder = mp.bricks();

    brickControllerRef.current = await bricksBuilder.create("payment", "payment-brick-container", {
      initialization: {
        amount: total,
        payer: {
          firstName: form.customerName.split(" ")[0],
          lastName: form.customerName.split(" ").slice(1).join(" "),
          email: form.customerEmail,
          phone: { areaCode: form.customerPhone.slice(0, 2), number: form.customerPhone.slice(2) },
        },
      },
      customization: {
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
          ticket: "none",       // no boleto
          bankTransfer: "all",  // PIX
          mercadoPago: "none",  // no MP wallet login
          maxInstallments: 12,
        },
        visual: {
          style: {
            theme: "dark",
            customVariables: {
              textPrimaryColor: "#F5F5F5",
              textSecondaryColor: "#888888",
              inputBackgroundColor: "#1A1A1A",
              formBackgroundColor: "#111111",
              baseColor: "#FF6B35",
              borderRadiusFull: "16px",
              borderRadiusSmall: "8px",
            },
          },
          hideFormTitle: true,
        },
      },
      callbacks: {
        onReady: () => setLoading(false),
        onError: (error: any) => {
          console.error("Brick error:", error);
          setError("Erro no formulário de pagamento. Tente novamente.");
          setLoading(false);
        },
        onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
          setLoading(true);
          setError(null);
          try {
            const isPix = selectedPaymentMethod === "bank_transfer" || formData?.payment_method_id === "pix";

            const result = await processPaymentAction({
              orderId: orderId as Id<"orders">,
              restaurantId: restaurantId as Id<"restaurants">,
              token: formData?.token || "",
              paymentMethodId: formData?.payment_method_id || "",
              installments: formData?.installments || 1,
              totalAmount: total,
              customerName: form.customerName,
              customerEmail: form.customerEmail,
              customerPhone: form.customerPhone,
              pixMethod: isPix,
            });

            sessionStorage.removeItem("cart");
            sessionStorage.removeItem("restaurantId");

            if (isPix && result.pixQrCode) {
              setPixData({ qrCode: result.pixQrCode, qrCodeBase64: result.pixQrCodeBase64 });
              setLoading(false);
              return;
            }

            if (result.paymentStatus === "paid") {
              router.push(`/acompanhamento/${orderId}?payment=success`);
            } else if (result.paymentStatus === "failed") {
              setError("Pagamento recusado. Tente outro cartão ou método.");
              setLoading(false);
            } else {
              router.push(`/acompanhamento/${orderId}?payment=pending`);
            }
          } catch (err: any) {
            setError(err.message || "Erro ao processar pagamento.");
            setLoading(false);
          }
        },
      },
    });
  }, [mpPublicKey, orderId, total]);

  useEffect(() => {
    if (step === "payment" && mpPublicKey && orderId) {
      setLoading(true);
      initBrick();
    }
    return () => {
      brickControllerRef.current?.unmount?.();
    };
  }, [step, mpPublicKey, orderId, initBrick]);

  if (!restaurantId) return null;

  // PIX QR Code screen
  if (pixData) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
        <div className="glass-card max-w-sm w-full p-8 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="font-bold text-xl mb-2">Pague com Pix</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            Escaneie o QR Code ou copie o código Pix abaixo. O pedido será confirmado automaticamente após o pagamento.
          </p>
          {pixData.qrCodeBase64 && (
            <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" className="mx-auto mb-4 rounded-xl w-48 h-48" />
          )}
          <div className="glass-card p-3 rounded-xl mb-4">
            <p className="text-xs break-all font-mono" style={{ color: "var(--color-text-muted)" }}>{pixData.qrCode}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(pixData.qrCode); }}
            className="btn-orange w-full mb-3"
          >
            Copiar código Pix
          </button>
          <button
            onClick={() => router.push(`/acompanhamento/${orderId}?payment=pending`)}
            className="w-full py-2 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Já paguei — ver meu pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-32" style={{ background: "var(--color-bg)" }}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setMapsLoaded(true)}
      />
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => step === "payment" ? setStep("form") : router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-surface)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-lg">{step === "form" ? "Finalizar Pedido" : "Pagamento"}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-xs font-semibold ${step === "form" ? "text-[var(--color-orange)]" : ""}`} style={{ color: step === "form" ? "var(--color-orange)" : "var(--color-text-muted)" }}>1. Dados</span>
              <ChevronRight size={12} style={{ color: "var(--color-text-muted)" }} />
              <span className="text-xs font-semibold" style={{ color: step === "payment" ? "var(--color-orange)" : "var(--color-text-muted)" }}>2. Pagamento</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6 flex flex-col gap-5">

        {/* ── STEP 1: FORM ── */}
        {step === "form" && (
          <>
            {/* Order summary */}
            <section className="glass-card p-4">
              <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Resumo do Pedido</h2>
              <div className="flex flex-col gap-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-2">
                    <span className="flex-1 pr-2" style={{ color: "var(--color-text-muted)" }}>
                      <span className="font-medium mr-1">{item.quantity}x</span>{item.name}
                      {item.variationName && <span className="block text-[11px] mt-0.5" style={{ color: "var(--color-orange)" }}>Tamanho: {item.variationName}</span>}
                    </span>
                    <span className="whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
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
                <InputField label="Nome completo" value={form.customerName} onChange={(v) => updateForm("customerName", v)} placeholder="João Silva" required />
                <InputField label="WhatsApp" value={form.customerPhone} onChange={(v) => updateForm("customerPhone", v)} placeholder="(11) 99999-9999" type="tel" required />
                <InputField label="E-mail" value={form.customerEmail} onChange={(v) => updateForm("customerEmail", v)} placeholder="joao@email.com" type="email" required />
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
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Número" value={form.number} onChange={(v) => updateForm("number", v)} placeholder="123" required />
                  <InputField label="Complemento" value={form.complement} onChange={(v) => updateForm("complement", v)} placeholder="Apto 4B" />
                </div>
                <InputField label="Bairro" value={form.neighborhood} onChange={(v) => updateForm("neighborhood", v)} placeholder="Centro" />
                <InputField label="Cidade" value={form.city} onChange={(v) => updateForm("city", v)} placeholder="São Paulo" />
                <InputField label="Ponto de referência" value={form.reference} onChange={(v) => updateForm("reference", v)} placeholder="Próximo ao mercado X" icon={<FileText size={14} />} />
              </div>
            </section>

            {error && (
              <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                {error}
              </div>
            )}
          </>
        )}

        {/* ── STEP 2: PAYMENT BRICK ── */}
        {step === "payment" && (
          <>
            <section className="glass-card p-4">
              <div className="flex justify-between font-bold text-lg mb-1">
                <span>Total a pagar</span>
                <span style={{ color: "var(--color-orange)" }}>R$ {total.toFixed(2)}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Pix (aprovação imediata) ou Cartão de crédito/débito
              </p>
            </section>

            {loading && (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-orange)" }} />
                <span style={{ color: "var(--color-text-muted)" }}>Carregando formulário de pagamento...</span>
              </div>
            )}

            <div id="payment-brick-container" className="w-full" />

            {error && (
              <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                {error}
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom CTA — only on form step */}
      {step === "form" && (
        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}>
          <div className="max-w-xl mx-auto">
            <button
              onClick={handleProceedToPayment}
              disabled={!isFormValid() || loading}
              className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" />Processando...</>
              ) : (
                <><CreditCard size={18} />Continuar para pagamento — R$ {total.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, type = "text", required, icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; icon?: React.ReactNode;
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
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-orange)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
      />
    </div>
  );
}
