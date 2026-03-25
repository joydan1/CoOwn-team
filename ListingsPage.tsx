// app/listings/page.tsx  (or pages/listings.tsx if using Pages Router)
// The main property marketplace — fetches listings from backend and renders cards.

"use client";

import React, { useEffect, useState } from "react";
import PropertyCard from "../../components/PropertyCard";
import { Property } from "../../types/property";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

// ── Filter state type ─────────────────────────────────────────────────────────
interface Filters {
  search:        string;
  property_type: string;
  status:        string;
  max_price:     string;
}

// ── Page component ────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered,   setFiltered]   = useState<Property[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search:        "",
    property_type: "",
    status:        "",
    max_price:     "",
  });

  // ── Fetch listings on mount ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/properties`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setProperties(json.data ?? []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError("Could not load listings. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  // ── Apply filters whenever properties or filters change ─────────────────────
  useEffect(() => {
    let result = [...properties];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }
    if (filters.property_type) {
      result = result.filter((p) => p.property_type === filters.property_type);
    }
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters.max_price) {
      const max = parseFloat(filters.max_price) * 1_000_000;
      result = result.filter((p) => p.asking_price <= max);
    }

    setFiltered(result);
  }, [properties, filters]);

  // ── CTA handlers ─────────────────────────────────────────────────────────────
  const handleBuyAlone  = (id: string) => { window.location.href = `/checkout/${id}`; };
  const handleStartPool = (id: string) => { window.location.href = `/pool/create/${id}`; };
  const handleJoinPool  = (id: string) => { window.location.href = `/pool/join/${id}`; };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Property Listings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse verified properties. All prices include AI market valuations.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or location…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <select
          value={filters.property_type}
          onChange={(e) => setFilters((f) => ({ ...f, property_type: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All types</option>
          {["flat", "duplex", "detached house", "semi-detached", "terrace", "bungalow", "land"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="pooling">Pooling</option>
          <option value="open_pool">Open pool</option>
        </select>

        <input
          type="number"
          placeholder="Max price (₦M)"
          value={filters.max_price}
          onChange={(e) => setFilters((f) => ({ ...f, max_price: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* Result count */}
        <span className="ml-auto self-center text-gray-400 text-sm">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-20 text-sm">
            No listings match your filters.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onBuyAlone={handleBuyAlone}
                onStartPool={handleStartPool}
                onJoinPool={handleJoinPool}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
