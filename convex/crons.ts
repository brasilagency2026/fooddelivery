import { cronJobs } from "convex/server";
import { internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

// This cron job runs every day at 9:00 AM UTC
crons.daily(
  "check-expiring-subscriptions",
  { hourUTC: 9, minuteUTC: 0 },
  internal.crons.processExpiringSubscriptions
);

export const processExpiringSubscriptions = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
    
    // Find all active or trial restaurants
    const allRestaurants = await ctx.db.query("restaurants").collect();
    
    const expiringRestaurants = [];

    for (const rest of allRestaurants) {
      if (rest.subscriptionStatus === "canceled") continue;
      if (!rest.subscriptionEndDate) continue;

      const timeRemaining = rest.subscriptionEndDate - now;
      const daysRemaining = timeRemaining / (1000 * 60 * 60 * 24);

      // If it expires in exactly 5 days (between 4 and 5)
      if (daysRemaining > 4 && daysRemaining <= 5) {
        expiringRestaurants.push({
          name: rest.name,
          phone: rest.phone,
          endDate: rest.subscriptionEndDate,
        });
      }
    }

    if (expiringRestaurants.length > 0) {
      await ctx.scheduler.runAfter(0, api.emails.sendExpirationReminder, {
        expiringRestaurants,
      });
    }
  },
});

export default crons;
