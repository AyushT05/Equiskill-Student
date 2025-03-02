import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  dbCredentials:{
    url: 'postgresql://neondb_owner:npg_moux2FC0eAVf@ep-misty-cake-a8ax8g6n-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',

  }
});
