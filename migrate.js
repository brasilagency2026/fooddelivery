const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://tame-marmot-554.convex.cloud");

async function run() {
  try {
    await client.mutation("restaurants:migrateSlugs");
    console.log("Migration successful on tame-marmot-554!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

run();
