// src/app.ts
// Main Express app entry point

import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";

import propertyRoutes from "./routes/property.routes";
import { seedValuationsForExistingListings } from "./services/property.service";
import { checkAIServiceHealth } from "./services/ai.service";

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/properties", propertyRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "CoOwn Backend" });
});

// ── Startup ───────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀  CoOwn Backend running on http://localhost:${PORT}`);
  console.log(`📋  API docs: http://localhost:${PORT}/api/properties\n`);

  // Check AI service is reachable
  const aiHealthy = await checkAIServiceHealth();
  if (aiHealthy) {
    console.log("✅  AI service is online.");
    // Attach valuations to any existing demo listings that don't have one yet
    await seedValuationsForExistingListings();
  } else {
    console.warn("⚠️  AI service is offline. Start it with: uvicorn main:app --reload --port 8000");
  }
});

export default app;
