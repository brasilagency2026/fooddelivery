import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendNewRegistrationAlert = action({
  args: {
    restaurantName: v.string(),
    city: v.string(),
    state: v.string(),
    phone: v.optional(v.string()),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set. Skipping email.");
      return;
    }

    const resend = new Resend(apiKey);
    const destinationEmail = "deliveryfoodpronto@parishopping.com"; // Resend free tier restriction

    try {
      await resend.emails.send({
        from: "Delivery Food Pronto <onboarding@resend.dev>",
        to: destinationEmail,
        subject: `🎉 Novo Restaurante Cadastrado: ${args.restaurantName}`,
        html: `
          <h2>Novo cadastro recebido!</h2>
          <p>Um novo restaurante acabou de se cadastrar na plataforma.</p>
          <ul>
            <li><strong>Nome:</strong> ${args.restaurantName}</li>
            <li><strong>Cidade/Estado:</strong> ${args.city} - ${args.state}</li>
            <li><strong>WhatsApp:</strong> ${args.phone || "Não informado"}</li>
          </ul>
          <p>Acesse o <a href="https://delivery.foodpronto.com.br/admin/superadmin">Super Admin</a> para aprovar o restaurante.</p>
        `,
      });
      console.log(`New registration email sent to ${destinationEmail}`);
    } catch (error) {
      console.error("Error sending registration email:", error);
    }
  },
});

export const sendExpirationReminder = action({
  args: {
    expiringRestaurants: v.array(
      v.object({
        name: v.string(),
        phone: v.optional(v.string()),
        endDate: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (args.expiringRestaurants.length === 0) return;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set. Skipping email.");
      return;
    }

    const resend = new Resend(apiKey);
    const destinationEmail = "deliveryfoodpronto@parishopping.com"; // Resend free tier restriction

    const restaurantsListHtml = args.expiringRestaurants.map(r => `
      <li>
        <strong>${r.name}</strong><br/>
        Vence em: ${new Date(r.endDate).toLocaleDateString("pt-BR")}<br/>
        WhatsApp: ${r.phone || "Não informado"}
      </li>
    `).join("");

    try {
      await resend.emails.send({
        from: "Delivery Food Pronto <onboarding@resend.dev>",
        to: destinationEmail,
        subject: `⚠️ Alerta: ${args.expiringRestaurants.length} assinatura(s) vencendo em breve!`,
        html: `
          <h2>Atenção!</h2>
          <p>Os seguintes restaurantes estão a 5 dias (ou menos) de expirar o plano de testes ou assinatura mensal:</p>
          <ul>
            ${restaurantsListHtml}
          </ul>
          <p>Por favor, entre em contato para oferecer a renovação.</p>
          <p>Acesse o <a href="https://delivery.foodpronto.com.br/admin/superadmin">Super Admin</a> para gerenciar.</p>
        `,
      });
      console.log(`Expiration reminder email sent to ${destinationEmail}`);
    } catch (error) {
      console.error("Error sending expiration reminder email:", error);
    }
  },
});
