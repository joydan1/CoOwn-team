// src/services/property.service.ts
// Handles property CRUD. Calls AI service on creation to attach valuation.

import { CreatePropertyDTO, Property } from "../types/property.types";
import { getPropertyValuation } from "./ai.service";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Replace this in-memory store with your real Supabase/PostgreSQL calls.
// The logic and flow stays exactly the same.
// ─────────────────────────────────────────────────────────────────────────────
const propertyStore: Property[] = [
  {
    id:            "prop_001",
    title:         "Modern 3-Bedroom Flat in Lekki Phase 1",
    location:      "Lekki Phase 1",
    property_type: "flat",
    bedrooms:      3,
    size_sqm:      120,
    age_years:     5,
    asking_price:  55_000_000,
    images:        ["https://placehold.co/800x500?text=Lekki+Flat"],
    description:   "",
    status:        "available",
    created_at:    new Date().toISOString(),
    updated_at:    new Date().toISOString(),
  },
  {
    id:            "prop_002",
    title:         "4-Bedroom Duplex in Maitama Abuja",
    location:      "Maitama Abuja",
    property_type: "duplex",
    bedrooms:      4,
    size_sqm:      380,
    age_years:     3,
    asking_price:  185_000_000,
    images:        ["https://placehold.co/800x500?text=Maitama+Duplex"],
    description:   "",
    status:        "open_pool",
    stake_available_pct: 40,
    created_at:    new Date().toISOString(),
    updated_at:    new Date().toISOString(),
  },
  {
    id:            "prop_003",
    title:         "2-Bedroom Flat in Yaba",
    location:      "Yaba",
    property_type: "flat",
    bedrooms:      2,
    size_sqm:      85,
    age_years:     8,
    asking_price:  22_000_000,
    images:        ["https://placehold.co/800x500?text=Yaba+Flat"],
    description:   "",
    status:        "pooling",
    created_at:    new Date().toISOString(),
    updated_at:    new Date().toISOString(),
  },
];

// ── Get all listings (with valuations already attached) ──────────────────────
export async function getAllProperties(): Promise<Property[]> {
  return propertyStore;
}

// ── Get single listing ────────────────────────────────────────────────────────
export async function getPropertyById(id: string): Promise<Property | null> {
  return propertyStore.find((p) => p.id === id) ?? null;
}

// ── Create new listing + attach AI valuation ──────────────────────────────────
export async function createProperty(dto: CreatePropertyDTO): Promise<Property> {
  const id = `prop_${Date.now()}`;
  const now = new Date().toISOString();

  // 1. Build the base property record first
  const property: Property = {
    id,
    title:         dto.title,
    location:      dto.location,
    property_type: dto.property_type,
    bedrooms:      dto.bedrooms,
    size_sqm:      dto.size_sqm,
    age_years:     dto.age_years,
    asking_price:  dto.asking_price,
    images:        dto.images,
    description:   dto.description ?? "",
    status:        "available",
    ai_valuation:  undefined, // will be populated below
    created_at:    now,
    updated_at:    now,
  };

  // 2. Call AI service — runs in parallel, doesn't block
  //    If AI service is down, listing still saves successfully
  const valuation = await getPropertyValuation({
    location:      dto.location,
    property_type: dto.property_type,
    bedrooms:      dto.bedrooms,
    size_sqm:      dto.size_sqm,
    age_years:     dto.age_years,
  });

  if (valuation) {
    property.ai_valuation = valuation;
    console.info(`[Property Service] Valuation attached to ${id}: ${valuation.display}`);
  } else {
    console.warn(`[Property Service] No valuation for ${id} — AI service unavailable.`);
  }

  // 3. Save to store (replace with: await supabase.from('properties').insert(property))
  propertyStore.push(property);

  return property;
}

// ── Seed existing listings with valuations (run once on startup) ─────────────
// Useful for demo data that was created before AI service was integrated.
export async function seedValuationsForExistingListings(): Promise<void> {
  console.info("[Property Service] Seeding AI valuations for existing listings …");

  for (const property of propertyStore) {
    if (!property.ai_valuation) {
      const valuation = await getPropertyValuation({
        location:      property.location,
        property_type: property.property_type,
        bedrooms:      property.bedrooms,
        size_sqm:      property.size_sqm,
        age_years:     property.age_years,
      });

      if (valuation) {
        property.ai_valuation = valuation;
        property.updated_at   = new Date().toISOString();
        console.info(`  ✅ ${property.id} — ${valuation.display}`);
      } else {
        console.warn(`  ⚠️  ${property.id} — valuation failed, skipping.`);
      }
    }
  }

  console.info("[Property Service] Seeding complete.");
}
