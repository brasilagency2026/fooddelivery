# 🍔 Food Pronto Delivery

Aplicação web/PWA/mobile de delivery, construída com Next.js 14, Convex, Clerk e Mercado Pago.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + React + Tailwind CSS + TypeScript |
| Backend / DB | [Convex](https://convex.dev) — queries, mutations e actions em tempo real |
| Autenticação | [Clerk](https://clerk.com) — apenas para donos de restaurantes |
| Pagamentos | [Mercado Pago](https://mercadopago.com.br/developers) — direto para o restaurante |
| Mobile | [Capacitor](https://capacitorjs.com) — WebView nativo Android/iOS |

---

## Estrutura de Arquivos

```
app/
  page.tsx                        # Home: lista restaurantes por localização
  checkout/page.tsx               # Checkout: endereço + pagamento
  acompanhamento/[id]/page.tsx    # Rastreio do pedido em tempo real
  admin/
    login/page.tsx                # Login Clerk
    dashboard/page.tsx            # Dashboard do dono: pedidos, cardápio, config
  api/
    webhooks/mercadopago/         # Webhook para atualização de pagamentos

components/
  providers/ConvexClientProvider  # Provider do Convex
  restaurant/RestaurantCard       # Card de restaurante na listagem
  order/OrderCard                 # Card de pedido no dashboard
  admin/
    SettingsPanel                 # Configurações do restaurante
    MenuManager                   # CRUD do cardápio
    RegisterRestaurant            # Onboarding de novo restaurante
  ui/
    LocationPermission            # UI de permissão de GPS
    LoadingGrid                   # Skeleton loading

convex/
  schema.ts       # Tabelas: restaurants, menuItems, orders
  restaurants.ts  # Queries e mutations de restaurantes
  menuItems.ts    # Queries e mutations do cardápio
  orders.ts       # Queries e mutations de pedidos
  payments.ts     # Action para criar preferência Mercado Pago
```

---

## Setup Passo a Passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o Convex

```bash
npx convex dev
```

Isso criará o projeto no Convex e vai gerar os arquivos `convex/_generated/`. Deixe rodando em background.

### 3. Configurar o Clerk

1. Crie uma conta em [clerk.com](https://clerk.com)
2. Crie um novo Application
3. Copie as chaves para o `.env.local`

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha:
- `NEXT_PUBLIC_CONVEX_URL` — obtido ao rodar `npx convex dev`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY` — do painel Clerk
- `NEXT_PUBLIC_APP_URL` — URL de produção (para webhooks do MP)

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Fluxo de Pagamento (Mercado Pago)

O pagamento é processado **diretamente na conta do restaurante**:

1. O dono configura seu **Access Token** no painel (`/admin/dashboard` → Configurações)
2. No checkout, uma **Preference** é criada via Convex Action usando o token do restaurante
3. O cliente é redirecionado para o Mercado Pago
4. Após o pagamento, o MP chama o webhook `/api/webhooks/mercadopago`
5. O webhook atualiza o status do pedido no Convex
6. O dono vê o pedido aparecer na tela em tempo real (sem F5)

### Obtendo o Access Token

1. Acesse [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Vá em "Suas integrações" → selecione ou crie um aplicativo
3. Em "Credenciais de produção", copie o **Access Token**
4. Cole no painel do restaurante

---

## Build para Mobile (Capacitor)

```bash
# Build estático do Next.js
npm run build
npx next export

# Sincronizar com Capacitor
npx cap add android
npx cap sync android

# Abrir no Android Studio
npx cap open android
```

> **Nota:** Altere `capacitor.config.ts` — remova `server.url` para produção e use o build estático.

---

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_CONVEX_URL` | URL do seu projeto Convex |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_APP_URL` | URL de produção (https://delivery.foodpronto.com.br) |
| `MERCADO_PAGO_PLATFORM_TOKEN` | Token opcional para verificar webhooks |

---

## Funcionalidades

### Cliente
- ✅ Detecção de localização via GPS
- ✅ Lista de restaurantes abertos no raio configurado
- ✅ Cardápio com carrinho interativo
- ✅ Checkout com endereço de entrega completo
- ✅ Pagamento via Mercado Pago (Pix, cartão, boleto)
- ✅ Rastreamento em tempo real do pedido

### Dono do Restaurante
- ✅ Login via Clerk
- ✅ Toggle ABRIR/FECHAR delivery
- ✅ Pedidos aparecem em tempo real (sem botão de atualizar)
- ✅ Atualização de status com 1 clique
- ✅ CRUD completo do cardápio
- ✅ Configuração de raio, taxa e tempo
- ✅ Configuração do token Mercado Pago

---

## Licença

Propriedade de Food Pronto. Todos os direitos reservados.
