// // src/routes/property.routes.ts
// // Express router — all /api/properties endpoints

// import { Router, Request, Response } from "express";
// import {
//   getAllProperties,
//   getPropertyById,
//   createProperty,
// } from "../services/property.service";
// import { checkAIServiceHealth } from "../services/ai.service";
// import { CreatePropertyDTO } from "../types/property.types";

// const router = Router();

// // ── GET /api/properties ───────────────────────────────────────────────────────
// // Returns all listings with AI valuations attached.
// // Frontend calls this to render the listings marketplace.
// router.get("/", async (_req: Request, res: Response) => {
//   try {
//     const properties = await getAllProperties();
//     res.json({ status: "ok", count: properties.length, data: properties });
//   } catch (error) {
//     console.error("[Routes] GET /properties error:", error);
//     res.status(500).json({ status: "error", message: "Failed to fetch properties." });
//   }
// });

// // ── GET /api/properties/:id ───────────────────────────────────────────────────
// router.get("/:id", async (req: Request, res: Response) => {
//   try {
//     const property = await getPropertyById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ status: "error", message: "Property not found." });
//     }
//     res.json({ status: "ok", data: property });
//   } catch (error) {
//     console.error("[Routes] GET /properties/:id error:", error);
//     res.status(500).json({ status: "error", message: "Failed to fetch property." });
//   }
// });

// // ── POST /api/properties ──────────────────────────────────────────────────────
// // Creates a new listing. AI valuation is attached automatically.
// router.post("/", async (req: Request, res: Response) => {
//   try {
//     const dto: CreatePropertyDTO = req.body;

//     // Basic validation
//     const required = ["title", "location", "property_type", "bedrooms", "size_sqm", "asking_price"];
//     const missing  = required.filter((field) => dto[field as keyof CreatePropertyDTO] === undefined);

//     if (missing.length > 0) {
//       return res.status(400).json({
//         status:  "error",
//         message: `Missing required fields: ${missing.join(", ")}`,
//       });
//     }

//     const property = await createProperty(dto);
//     res.status(201).json({ status: "ok", data: property });

//   } catch (error) {
//     console.error("[Routes] POST /properties error:", error);
//     res.status(500).json({ status: "error", message: "Failed to create property." });
//   }
// });

// // ── GET /api/properties/meta/ai-health ───────────────────────────────────────
// // Lets the frontend know if the AI service is up (for the admin panel).
// router.get("/meta/ai-health", async (_req: Request, res: Response) => {
//   const healthy = await checkAIServiceHealth();
//   res.json({
//     status:     healthy ? "ok" : "degraded",
//     ai_service: healthy ? "online" : "offline",
//     message:    healthy
//       ? "AI valuations are working normally."
//       : "AI service is offline. Listings will save without valuations.",
//   });
// });

// export default router;
