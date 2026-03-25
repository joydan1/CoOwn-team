// // types/property.ts
// // Must match the shape returned by GET /api/properties

// export interface ValuationResult {
//   display:      string;       // "Est. ₦7.2M – ₦8.8M"
//   confidence:   "High" | "Medium" | "Low";
//   estimated_min: number;
//   estimated_max: number;
//   mid_point:    number;
//   currency:     string;
// }

// export interface Property {
//   id:              string;
//   title:           string;
//   location:        string;
//   property_type:   string;
//   bedrooms:        number;
//   size_sqm:        number;
//   age_years:       number;
//   asking_price:    number;
//   images:          string[];
//   description:     string;
//   status:          "available" | "pooling" | "open_pool" | "sold";
//   stake_available_pct?: number;
//   ai_valuation?:   ValuationResult;
//   created_at:      string;
// }
