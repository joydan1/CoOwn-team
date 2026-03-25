// components/PropertyCard.tsx
// Listing card shown in the marketplace grid.
// Displays the AI valuation badge, status badge, and 3 CTAs.

import React from "react";
import { Property } from "../types/property";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatNaira(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `₦${(amount / 1_000_000).toFixed(1)}M`;
  return `₦${amount.toLocaleString()}`;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  High:   "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low:    "bg-gray-100  text-gray-600",
};

const STATUS_CONFIG = {
  available:  { label: "Available",                bg: "bg-green-500"  },
  pooling:    { label: "Pooling in progress",      bg: "bg-blue-500"   },
  open_pool:  { label: "Open pool",                bg: "bg-purple-500" },
  sold:       { label: "Sold",                     bg: "bg-gray-400"   },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface PropertyCardProps {
  property:       Property;
  onBuyAlone?:    (id: string) => void;
  onStartPool?:   (id: string) => void;
  onJoinPool?:    (id: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PropertyCard({
  property,
  onBuyAlone,
  onStartPool,
  onJoinPool,
}: PropertyCardProps) {
  const { ai_valuation, status } = property;
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  const confidenceStyle = ai_valuation
    ? CONFIDENCE_STYLES[ai_valuation.confidence]
    : "";

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">

      {/* ── Image ── */}
      <div className="relative">
        <img
          src={property.images[0] ?? "/placeholder-property.jpg"}
          alt={property.title}
          className="w-full h-48 object-cover"
        />

        {/* Status badge */}
        <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${statusCfg.bg}`}>
          {status === "open_pool" && property.stake_available_pct
            ? `${property.stake_available_pct}% stake left`
            : statusCfg.label}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Title + location */}
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-snug">
            {property.title}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            📍 {property.location}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 text-sm text-gray-600">
          <span>🛏 {property.bedrooms} bed</span>
          <span>📐 {property.size_sqm} m²</span>
          <span>🏠 {property.property_type}</span>
        </div>

        {/* Asking price */}
        <div className="text-lg font-bold text-gray-900">
          {formatNaira(property.asking_price)}
        </div>

        {/* ── AI Valuation badge ── */}
        {ai_valuation ? (
          <div className="bg-indigo-50 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">
                🤖 AI Valuation
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceStyle}`}>
                {ai_valuation.confidence} confidence
              </span>
            </div>
            <p className="text-indigo-900 font-semibold text-sm">
              {ai_valuation.display}
            </p>
            {/* Fair deal indicator */}
            {(() => {
              const diff = ((property.asking_price - ai_valuation.mid_point) / ai_valuation.mid_point) * 100;
              if (diff <= -5)  return <p className="text-green-600 text-xs">✅ Below market estimate — good deal</p>;
              if (diff >= 10)  return <p className="text-red-500   text-xs">⚠️ Above market estimate</p>;
              return               <p className="text-gray-500   text-xs">≈ Fairly priced</p>;
            })()}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-400 text-xs">AI valuation unavailable</p>
          </div>
        )}

        {/* ── CTAs ── */}
        <div className="mt-auto flex flex-col gap-2 pt-2">

          {/* Buy alone — always shown */}
          <button
            onClick={() => onBuyAlone?.(property.id)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Buy alone
          </button>

          {/* Start a group pool — shown when status is available */}
          {status === "available" && (
            <button
              onClick={() => onStartPool?.(property.id)}
              className="w-full bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Start a group pool
            </button>
          )}

          {/* Join open pool — shown only for open_pool listings */}
          {status === "open_pool" && (
            <button
              onClick={() => onJoinPool?.(property.id)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Join open pool — {property.stake_available_pct}% left
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
