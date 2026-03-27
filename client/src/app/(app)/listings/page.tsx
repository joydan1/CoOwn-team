"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { propertiesApi, poolsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
  status?: "available" | "pooling" | "open_pool"
  image: string
  description?: string
  aiValuation?: { min: number; max: number; confidence: "High" | "Medium" | "Low" }
  bedrooms?: number
  bathrooms?: number
  squareMeters?: number
}

interface OpenPool {
  id: string
  propertyId: string
  name: string
  propertyTitle: string
  propertyLocation: string
  propertyType: string
  propertyImage: string
  targetAmount: number
  raisedAmount: number
  remainingStake: number
  remainingPercentage: number
  memberCount: number
  memberLimit: number
  deadline: string
}

const FILTERS = ["All", "Land", "Apartment", "Duplex", "Commercial"]

const normalizeType = (type: string) => {
  if (!type) return ""
  const t = type.trim().toLowerCase()
  if (t === "land" || t === "lands" || t === "plot" || t === "plots") return "Land"
  if (t === "apartment" || t === "flat" || t === "studio" || t === "apartments") return "Apartment"
  if (t === "duplex" || t === "semi-detached" || t === "terraced" || t === "townhouse") return "Duplex"
  if (t === "commercial" || t === "office" || t === "shop" || t === "retail") return "Commercial"
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

const getFallbackImage = (type: string, id: string) => {
  const images: Record<string, string[]> = {
    Land: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    ],
    Apartment: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    ],
    Duplex: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&q=80",
    ],
    Commercial: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    ],
  }
  const normalized = normalizeType(type)
  const pool = images[normalized] ?? images.Apartment
  const seed = parseInt(id, 10)
  return pool[isNaN(seed) ? 0 : seed % pool.length]
}

const fmt = (n: number) =>
  "₦" + (n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + "M"
    : (n / 1000).toFixed(0) + "K")

const daysLeft = (deadline: string) =>
  Math.max(0, Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))

export default function ListingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const [properties, setProperties] = useState<Property[]>([])
  const [openPools, setOpenPools]   = useState<OpenPool[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState("All")
  const [search, setSearch]         = useState("")
  const [error, setError]           = useState("")
  const [activeTab, setActiveTab]   = useState<"properties" | "openPools">("properties")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchData()
  }, [isAuthenticated, router])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")

      const [propertiesRes, poolsRes] = await Promise.all([
        propertiesApi.listings(),
        poolsApi.public(),
      ])

      console.log("=== OPEN POOLS DEBUG ===")
      console.log("Pools API response:", poolsRes)
      console.log("Pools data:", poolsRes.data)
      console.log("Number of pools:", poolsRes.data?.length)
      
      if (poolsRes.data && poolsRes.data.length > 0) {
        console.log("First pool fields:", Object.keys(poolsRes.data[0]))
        console.log("First pool:", poolsRes.data[0])
      }

      const formattedProperties: Property[] = (propertiesRes.data || []).map((prop: any) => ({
        id: prop.id,
        title: prop.title,
        location: prop.location,
        price: prop.price,
        type: normalizeType(prop.type || "Apartment"),
        status: prop.status || "available",
        image: prop.image || prop.images?.[0] || getFallbackImage(prop.type || "Apartment", prop.id),
        description: prop.description,
        bedrooms: prop.bedrooms ?? prop.beds,
        bathrooms: prop.bathrooms ?? prop.baths,
        squareMeters: prop.squareMeters ?? prop.sqm,
        aiValuation: prop.aiValuation ?? {
          min: Math.round(prop.price * 0.9),
          max: Math.round(prop.price * 1.1),
          confidence: "Medium" as const,
        },
      }))
      setProperties(formattedProperties)

      const openPoolsData: OpenPool[] = (poolsRes.data || [])
        .filter((pool: any) => {
          const isPublic = pool.isPublic ?? pool.is_public ?? false
          const status   = pool.status ?? "open"
          return isPublic === true && status === "open"
        })
        .map((pool: any) => {
          const targetAmount     = pool.targetAmount     ?? pool.target_amount     ?? 0
          const raisedAmount     = pool.raisedAmount     ?? pool.raised_amount     ?? 0
          const memberCount      = pool.memberCount      ?? pool.member_count      ?? 0
          const memberLimit      = pool.memberLimit      ?? pool.member_limit      ?? 10
          const propertyId       = pool.propertyId       ?? pool.property_id       ?? ""
          const propertyTitle    = pool.property?.title    ?? pool.propertyTitle    ?? pool.property_title    ?? "Property"
          const propertyLocation = pool.property?.location ?? pool.propertyLocation ?? pool.property_location ?? "Location"
          const propertyType     = pool.property?.type     ?? pool.propertyType     ?? pool.property_type     ?? "Apartment"
          const propertyImage    = pool.property?.image    ?? pool.property?.images?.[0] ?? pool.propertyImage ?? pool.property_image ?? ""
          const remaining        = targetAmount - raisedAmount

          return {
            id: pool.id,
            propertyId,
            name: pool.name,
            propertyTitle,
            propertyLocation,
            propertyType: normalizeType(propertyType),
            propertyImage: propertyImage || getFallbackImage(propertyType, pool.id),
            targetAmount,
            raisedAmount,
            remainingStake: remaining,
            remainingPercentage: targetAmount > 0 ? (remaining / targetAmount) * 100 : 0,
            memberCount,
            memberLimit,
            deadline: pool.deadline,
          }
        })
      setOpenPools(openPoolsData)

    } catch (err: any) {
      console.error("Failed to fetch data:", err)
      setError(err.response?.data?.message || "Failed to load properties")
    } finally {
      setLoading(false)
    }
  }

  const matchesFilter = (type: string) => filter === "All" || type === filter
  const matchesSearch = (title: string, location: string) =>
    !search ||
    title.toLowerCase().includes(search.toLowerCase()) ||
    location.toLowerCase().includes(search.toLowerCase())

  const filteredProperties = properties.filter(p =>
    matchesFilter(p.type) && matchesSearch(p.title, p.location)
  )
  const filteredOpenPools = openPools.filter(pool =>
    matchesFilter(pool.propertyType) && matchesSearch(pool.propertyTitle, pool.propertyLocation)
  )

  const firstName    = user?.firstName?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const avatarLetter = user?.firstName?.[0] || user?.email?.[0] || "U"

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px",
            border: "3px solid #E5E5E0", borderTopColor: "#00C853",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}/>
          <p style={{ color: "#5C6B5E", fontSize: "15px" }}>Loading properties…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>

      <nav style={{
        background: "#0D1F0F", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(0,200,83,0.15)",
      }}>
        <div style={{
          width: "100%", padding: "0 24px",
          display: "flex", alignItems: "center",
          height: "64px", boxSizing: "border-box",
        }}>
          <span
            onClick={() => router.push("/")}
            style={{
              fontFamily: "var(--font-display)", fontSize: "25px",
              fontWeight: 700, color: "#fff", letterSpacing: "-0.5px",
              cursor: "pointer", flexShrink: 0, marginRight: "32px",
            }}
          >
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>

          <div style={{ flex: 1, maxWidth: "480px", position: "relative" }}>
            <svg
              style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)",
                width: "16px", height: "16px", color: "rgba(255,255,255,0.4)",
                pointerEvents: "none",
              }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search properties or locations…"
              style={{
                width: "100%", padding: "10px 16px 10px 40px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "999px", fontSize: "14px",
                color: "#fff", fontFamily: "var(--font-body)", outline: "none",
                transition: "border-color 0.2s, background 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => {
                e.target.style.borderColor = "#00C853"
                e.target.style.background = "rgba(255,255,255,0.12)"
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(255,255,255,0.15)"
                e.target.style.background = "rgba(255,255,255,0.08)"
              }}
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => router.push("/milestones")}
              style={{
                background: "rgba(255,255,255,0.1)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px",
                padding: "9px 14px", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              Milestones
            </button>

            <button
              onClick={() => router.push("/properties/create")}
              style={{
                background: "rgba(255,255,255,0.12)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px",
                padding: "9px 16px", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              + New Property
            </button>

            <button
              onClick={() => router.push("/pools/create")}
              style={{
                background: "#00C853", color: "#0D1F0F",
                border: "none", borderRadius: "999px",
                padding: "9px 20px", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#00E676")}
              onMouseLeave={e => (e.currentTarget.style.background = "#00C853")}
            >
              + New Pool
            </button>

            <div ref={dropdownRef} style={{ position: "relative" }}>
              <div
                onClick={() => setDropdownOpen(prev => !prev)}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#00C853", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "14px", fontWeight: 700,
                  color: "#0D1F0F", cursor: "pointer", userSelect: "none",
                  outline: dropdownOpen ? "2px solid rgba(0,200,83,0.5)" : "none",
                  outlineOffset: "2px", transition: "outline 0.15s",
                }}
              >
                {avatarLetter}
              </div>

              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "#fff", borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(13,31,15,0.18)",
                  border: "1px solid #E8E8E3",
                  minWidth: "180px", overflow: "hidden", zIndex: 100,
                }}>
                  <div style={{
                    padding: "12px 16px", borderBottom: "1px solid #F0F0EC",
                    background: "#F7F7F5",
                  }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#0D1F0F", margin: 0 }}>
                      {user?.firstName || "User"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#8A9E8C", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.email || ""}
                    </p>
                  </div>

                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/profile") }}
                    style={{
                      width: "100%", padding: "11px 16px",
                      background: "none", border: "none",
                      display: "flex", alignItems: "center", gap: "10px",
                      fontSize: "14px", color: "#0D1F0F",
                      cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F7F7F5")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile
                  </button>

                  <button
                    onClick={() => { setDropdownOpen(false); logout(); router.push("/login") }}
                    style={{
                      width: "100%", padding: "11px 16px",
                      background: "none", border: "none",
                      borderTop: "1px solid #F0F0EC",
                      display: "flex", alignItems: "center", gap: "10px",
                      fontSize: "14px", color: "#dc2626",
                      cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FFF5F5")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div style={{
        background: "#0D1F0F", padding: "32px 24px 28px",
        borderBottom: "1px solid rgba(0,200,83,0.10)",
      }}>
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", marginBottom: "4px" }}>
            Welcome back,
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700, color: "#fff",
            letterSpacing: "-1px", marginBottom: "28px",
          }}>
            {firstName} 👋
          </h1>

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "12px", padding: "12px 16px",
              marginBottom: "20px", color: "#dc2626", fontSize: "14px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              {error}
              <button onClick={fetchData} style={{
                color: "#00C853", background: "none", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "14px",
              }}>
                Retry
              </button>
            </div>
          )}

          <div style={{
            display: "flex", gap: "28px", marginBottom: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            {(["properties", "openPools"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  paddingBottom: "12px", background: "none", border: "none",
                  fontSize: "16px", fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#00C853" : "rgba(255,255,255,0.5)",
                  borderBottom: activeTab === tab ? "2px solid #00C853" : "2px solid transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                  transition: "color 0.2s", marginBottom: "-1px",
                }}
              >
                {tab === "properties" ? "Properties" : "Open Pools"}
                {tab === "openPools" && openPools.length > 0 && (
                  <span style={{
                    background: "#00C853", color: "#0D1F0F",
                    fontSize: "11px", fontWeight: 700,
                    padding: "2px 7px", borderRadius: "999px",
                  }}>
                    {openPools.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 18px", borderRadius: "999px",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "var(--font-body)", border: "none",
                  background: filter === f ? "#00C853" : "rgba(255,255,255,0.08)",
                  color: filter === f ? "#0D1F0F" : "rgba(255,255,255,0.6)",
                  transition: "background 0.18s, color 0.18s",
                }}
              >
                {f}
                {f !== "All" && (
                  <span style={{ marginLeft: "5px", opacity: 0.7, fontSize: "11px" }}>
                    ({activeTab === "properties"
                      ? properties.filter(p => p.type === f).length
                      : openPools.filter(p => p.propertyType === f).length})
                  </span>
                )}
              </button>
            ))}

            <div style={{
              marginLeft: "auto",
              background: "rgba(0,200,83,0.12)",
              border: "1px solid rgba(0,200,83,0.25)",
              borderRadius: "999px", padding: "6px 14px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00C853", display: "inline-block" }}/>
              <span style={{ fontSize: "12px", color: "#00C853", fontWeight: 600 }}>
                {activeTab === "properties" ? filteredProperties.length : filteredOpenPools.length} shown
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", padding: "40px 24px 120px", boxSizing: "border-box" }}>

        {activeTab === "properties" && (
          filteredProperties.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              background: "#fff", borderRadius: "20px",
            }}>
              <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "8px" }}>
                No {filter !== "All" ? filter : ""} properties found
              </p>
              <p style={{ fontSize: "14px", color: "#8A9E8C" }}>
                {search ? "Try a different search term" : "Check back soon"}
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "28px",
            }}>
              {filteredProperties.map((p, i) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  index={i}
                  onView={() => router.push(`/listings/${p.id}`)}
                  onPool={() => router.push(`/pools/create?propertyId=${p.id}`)}
                />
              ))}
            </div>
          )
        )}

        {activeTab === "openPools" && (
          filteredOpenPools.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              background: "#fff", borderRadius: "20px",
            }}>
              <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "16px" }}>
                No open pools {filter !== "All" ? `for ${filter}` : "available"}
              </p>
              <button
                onClick={() => router.push("/pools/create")}
                style={{
                  padding: "12px 28px", background: "#00C853", color: "#0D1F0F",
                  border: "none", borderRadius: "999px", fontWeight: 600,
                  cursor: "pointer", fontSize: "15px",
                }}
              >
                Create a Pool
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "28px",
            }}>
              {filteredOpenPools.map((pool, i) => (
                <OpenPoolCard
                  key={pool.id}
                  pool={pool}
                  index={i}
                  onClick={() => router.push(`/pools/${pool.id}`)}
                />
              ))}
            </div>
          )
        )}
      </div>

      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #E5E5E0",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 20px", zIndex: 50,
        boxShadow: "0 -4px 16px rgba(13,31,15,0.06)",
      }}>
        {[
          { label: "Explore",  path: "/listings", active: true },
          { label: "My Pools", path: "/pools",    active: false },
          { label: "Payments", path: "/payments", active: false },
          { label: "Profile",  path: "/profile",  active: false },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "4px",
              background: "none", border: "none",
              cursor: "pointer", padding: "0 16px",
            }}
          >
            <span style={{
              fontSize: "12px", fontWeight: item.active ? 600 : 400,
              color: item.active ? "#00C853" : "#8A9E8C",
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(255,255,255,0.38); font-size: 14px; }
      `}</style>
    </main>
  )
}

function PropertyCard({
  property: p, index: i, onView, onPool,
}: {
  property: Property
  index: number
  onView: () => void
  onPool: () => void
}) {
  return (
    <div
      onClick={onView}
      style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #E8E8E3", overflow: "hidden",
        cursor: "pointer",
        animation: `fadeInUp 0.5s ease ${i * 0.06}s both`,
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)"
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(13,31,15,0.12)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
        <img
          src={p.image} alt={p.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.07)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          onError={e => { (e.currentTarget as HTMLImageElement).src = getFallbackImage(p.type, p.id) }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,31,15,0.65) 0%, transparent 55%)" }}/>
        <div style={{
          position: "absolute", bottom: "12px", left: "14px",
          fontFamily: "var(--font-display)", fontSize: "24px",
          fontWeight: 700, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}>
          {fmt(p.price)}
        </div>
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          background: "rgba(13,31,15,0.72)", backdropFilter: "blur(4px)",
          borderRadius: "999px", padding: "4px 12px",
          fontSize: "11px", fontWeight: 600, color: "#fff",
        }}>
          {p.type}
        </div>
      </div>

      <div style={{ padding: "18px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0D1F0F", marginBottom: "5px" }}>
          {p.title}
        </h3>
        <div style={{
          fontSize: "13px", color: "#5C6B5E", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "5px",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {p.location}
        </div>

        {p.aiValuation && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(0,200,83,0.06)", border: "1px solid rgba(0,200,83,0.15)",
            borderRadius: "10px", padding: "8px 12px", marginBottom: "16px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00C853", flexShrink: 0 }}/>
            <span style={{ fontSize: "12px", color: "#2A3D2C" }}>
              AI est. {fmt(p.aiValuation.min)} — {fmt(p.aiValuation.max)}
            </span>
            <span style={{
              marginLeft: "auto", fontSize: "10px", fontWeight: 600,
              color: p.aiValuation.confidence === "High" ? "#00C853"
                : p.aiValuation.confidence === "Medium" ? "#F59E0B" : "#9E9E9E",
            }}>
              {p.aiValuation.confidence}
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={e => { e.stopPropagation(); onView() }}
            style={{
              flex: 1, padding: "11px 8px",
              background: "#0D1F0F", color: "#fff",
              border: "none", borderRadius: "10px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              transition: "background 0.18s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1A3A1D")}
            onMouseLeave={e => (e.currentTarget.style.background = "#0D1F0F")}
          >
            View Details
          </button>
          <button
            onClick={e => { e.stopPropagation(); onPool() }}
            style={{
              flex: 1, padding: "11px 8px",
              background: "#00C853", color: "#0D1F0F",
              border: "none", borderRadius: "10px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              transition: "background 0.18s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#00E676")}
            onMouseLeave={e => (e.currentTarget.style.background = "#00C853")}
          >
            Start Pool
          </button>
        </div>
      </div>
    </div>
  )
}

function OpenPoolCard({
  pool, index: i, onClick,
}: {
  pool: OpenPool
  index: number
  onClick: () => void
}) {
  const progress = pool.targetAmount > 0 ? (pool.raisedAmount / pool.targetAmount) * 100 : 0
  const days = daysLeft(pool.deadline)

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #E8E8E3", overflow: "hidden",
        cursor: "pointer",
        animation: `fadeInUp 0.5s ease ${i * 0.06}s both`,
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)"
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(13,31,15,0.12)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
        <img
          src={pool.propertyImage} alt={pool.propertyTitle}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.07)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          onError={e => { (e.currentTarget as HTMLImageElement).src = getFallbackImage(pool.propertyType, pool.id) }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,31,15,0.65) 0%, transparent 55%)" }}/>
        <div style={{
          position: "absolute", top: "12px", left: "12px",
          background: "#F97316", borderRadius: "999px",
          padding: "5px 12px", fontSize: "11px", fontWeight: 700, color: "#fff",
        }}>
          {pool.remainingPercentage.toFixed(0)}% stake available
        </div>
        <div style={{
          position: "absolute", bottom: "12px", left: "14px",
          fontFamily: "var(--font-display)", fontSize: "24px",
          fontWeight: 700, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}>
          {fmt(pool.remainingStake)}
        </div>
        <div style={{
          position: "absolute", bottom: "12px", right: "12px",
          background: "rgba(0,0,0,0.55)", borderRadius: "999px",
          padding: "4px 10px", fontSize: "10px", color: "#fff", fontWeight: 500,
        }}>
          Open Pool
        </div>
      </div>

      <div style={{ padding: "18px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0D1F0F", marginBottom: "5px" }}>
          {pool.propertyTitle}
        </h3>
        <div style={{
          fontSize: "13px", color: "#5C6B5E", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "5px",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {pool.propertyLocation}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: "12px", color: "#5C6B5E", marginBottom: "6px",
          }}>
            <span>Pool progress</span>
            <span style={{ fontWeight: 500 }}>{progress.toFixed(0)}%</span>
          </div>
          <div style={{ height: "6px", background: "#E8E8E3", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(progress, 100)}%`,
              background: "#00C853", borderRadius: "999px",
              transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
            }}/>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: "11px", color: "#8A9E8C", marginTop: "5px",
          }}>
            <span>{fmt(pool.raisedAmount)} raised</span>
            <span>{fmt(pool.targetAmount)} target</span>
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "12px", color: "#5C6B5E", marginBottom: "16px",
          background: "#F7F7F5", borderRadius: "8px", padding: "8px 12px",
        }}>
          <span>👥 {pool.memberCount}/{pool.memberLimit} members</span>
          <span style={{ color: days <= 7 ? "#F97316" : "#5C6B5E", fontWeight: days <= 7 ? 600 : 400 }}>
            ⏱ {days} days left
          </span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onClick() }}
          style={{
            width: "100%", padding: "13px",
            background: "#00C853", color: "#0D1F0F",
            border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
            transition: "background 0.18s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#00E676")}
          onMouseLeave={e => (e.currentTarget.style.background = "#00C853")}
        >
          Buy {pool.remainingPercentage.toFixed(0)}% stake — {fmt(pool.remainingStake)}
        </button>
      </div>
    </div>
  )
}