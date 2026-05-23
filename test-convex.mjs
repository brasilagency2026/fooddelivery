import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient("https://tame-marmot-554.convex.cloud");

async function main() {
  const orders = await client.query("orders:getRestaurantOrders", { restaurantId: "jd75a50n69etq8wah9qw851sm9878dpg" });
  console.log("Orders:", orders.map(o => ({id: o._id, name: o.customerName, orderNumber: o.orderNumber, status: o.status})));
}

main().catch(console.error);
