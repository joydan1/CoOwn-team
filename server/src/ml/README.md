# CoOwn  — Full Integration

Python AI ↔ Node.js Backend ↔ Next.js Frontend

---

## How the 3 services connect

```
Next.js (port 3000)
    ↓  GET /api/properties
Node.js Backend (port 3001)
    ↓  POST /predict/valuation  (X-API-Key header)
Python AI Service (port 8000)
```

---

## Start all 3 services

Open **3 separate terminals**:

### Terminal 1 — Python AI service
```bash
cd DAY1_AnitaTruscott_ML
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Node.js backend
```bash
cd coown-backend
cp .env.example .env
npm install
npm run dev
```

```
🚀  CoOwn Backend running on http://localhost:3001
✅  AI service is online.
✅  prop_001 — Est. ₦X.XM – ₦X.XM
✅  prop_002 — Est. ₦XXM – ₦XXM
```

### Terminal 3 — Next.js frontend
```bash
cd coown-frontend
cp .env.example .env.local
npm install
npm run dev
```
Then open: http://localhost:3000/listings

---

## Files to add to each project

### Backend (add to your existing Node.js/TypeScript project)
```
src/
├── types/
│   └── property.types.ts    ← TypeScript interfaces
├── services/
│   ├── ai.service.ts        ← calls Python /predict/valuation
│   └── property.service.ts  ← property CRUD + valuation seeding
└── routes/
    └── property.routes.ts   ← Express router
```
Then register the router in your `app.ts`:
```typescript
import propertyRoutes from "./routes/property.routes";
app.use("/api/properties", propertyRoutes);
```

### Frontend (add to your existing Next.js project)
```
types/
└── property.ts              ← TypeScript interfaces

components/
├── PropertyCard.tsx         ← listing card with AI valuation badge
└── ListingsPage.tsx         ← marketplace page (use as app/listings/page.tsx)
```

---

## What the AI valuation badge shows

On every listing card:
```
┌─────────────────────────────────┐
│ 🤖 AI Valuation     High ●     │
│ Est. ₦7.2M – ₦8.8M            │
│ ≈ Fairly priced                │
└─────────────────────────────────┘
```
- Green "✅ Below market estimate — good deal" if asking price is 5%+ below AI mid
- Red "⚠️ Above market estimate" if asking price is 10%+ above AI mid
- Grey "≈ Fairly priced" otherwise

---

## Supabase integration (replace the in-memory store)

In `property.service.ts`, replace the `propertyStore` array operations with:

```typescript
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Get all
const { data } = await supabase.from("properties").select("*");

// Create
await supabase.from("properties").insert(property);
```
