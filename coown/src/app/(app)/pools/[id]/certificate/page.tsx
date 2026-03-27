"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { poolsApi, usersApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Pool {
  id: string
  name: string
  propertyId: string
  propertyTitle: string
  propertyLocation: string
  propertyPrice: number
  targetAmount: number
  raisedAmount: number
  status: string
  completedAt?: string
}

interface Member {
  id: string
  userId: string
  firstName: string
  lastName: string
  paidAmount: number
  ownershipPct: number
}

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

export default function CertificatePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const poolId = params.id as string
  const certificateRef = useRef<HTMLDivElement>(null)

  const [pool, setPool] = useState<Pool | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [currentUser, setCurrentUser] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchCertificateData()
  }, [poolId])

  const fetchCertificateData = async () => {
    try {
      setLoading(true)
      
      // Fetch pool details
      const poolData = await poolsApi.getOne(poolId)
      setPool(poolData)
      
      // Fetch pool members
      const membersData = await poolsApi.getMembers(poolId) || []
      setMembers(membersData)
      
      // Find current user in members
      const currentUserData = membersData.find((m: Member) => m.userId === user?.id)
      setCurrentUser(currentUserData || null)
      
    } catch (err: any) {
      console.error("Failed to fetch certificate data:", err)
      setError(err.response?.data?.message || "Failed to load certificate")
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async () => {
    if (!certificateRef.current) return
    
    setGenerating(true)
    try {
      // For hackathon demo, we'll use html2canvas and jsPDF
      // This is a simplified version - you'll need to install:
      // npm install html2canvas jspdf
      
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 297 // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`coown-certificate-${pool?.name || poolId}.pdf`)
      
    } catch (err) {
      console.error("Failed to generate PDF:", err)
      alert("Certificate download failed. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const shareToWhatsApp = () => {
    const text = `I just received my CoOwn ownership certificate for ${pool?.propertyTitle}! I own ${currentUser?.ownershipPct?.toFixed(1)}% of this property through group co-ownership. #CoOwn #PropertyInvestment`
    const url = `${window.location.origin}/pools/${poolId}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank')
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #E5E5E0",
            borderTopColor: "#00C853",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#5C6B5E" }}>Preparing your certificate</p>
        </div>
      </main>
    )
  }

  if (error || !pool || !currentUser) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error || "Certificate not available"}</p>
          <button
            onClick={() => router.push("/pools")}
            style={{
              padding: "12px 24px",
              background: "#00C853",
              color: "#0D1F0F",
              border: "none",
              borderRadius: "999px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Back to My Pools
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>

      {/* Navigation */}
      <nav style={{
        background: "#0D1F0F",
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(0,200,83,0.15)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <span onClick={() => router.push("/")} style={{ fontFamily: "var(--font-display)", fontSize: "25px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" }}>
            Co<span style={{ color: "#00C853" }}>Own</span>
          </span>
          <button
            onClick={() => router.push(`/pools/${poolId}`)}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "8px 20px",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Back to Pool
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        
        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", marginBottom: "32px" }}>
          <button
            onClick={shareToWhatsApp}
            style={{
              padding: "12px 24px",
              background: "#fff",
              border: "1px solid #00C853",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#00C853",
              cursor: "pointer"
            }}
          >
            Share on WhatsApp
          </button>
          <button
            onClick={downloadCertificate}
            disabled={generating}
            style={{
              padding: "12px 28px",
              background: generating ? "#BDBDBD" : "#00C853",
              border: "none",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 600,
              color: generating ? "#6E6E6E" : "#0D1F0F",
              cursor: generating ? "not-allowed" : "pointer"
            }}
          >
            {generating ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* Certificate Card */}
        <div
          ref={certificateRef}
          style={{
            background: "#fff",
            borderRadius: "24px",
            border: "1px solid #E5E5E0",
            padding: "48px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px", paddingBottom: "24px", borderBottom: "2px solid #00C853" }}>
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: 700, color: "#00C853" }}>
                CoOwn
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#5C6B5E", letterSpacing: "2px", textTransform: "uppercase" }}>
              Certificate of Ownership
            </p>
          </div>

          {/* Body */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontSize: "16px", color: "#5C6B5E", marginBottom: "12px" }}>
              This certifies that
            </p>
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#0D1F0F", marginBottom: "8px" }}>
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <p style={{ fontSize: "16px", color: "#5C6B5E", marginBottom: "32px" }}>
              is a verified co-owner of
            </p>
            <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#00C853", marginBottom: "16px" }}>
              {pool.propertyTitle}
            </h1>
            <p style={{ fontSize: "18px", color: "#5C6B5E", marginBottom: "8px" }}>
              Located at {pool.propertyLocation}
            </p>
          </div>

          {/* Ownership Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            background: "#F5F5F0",
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "40px"
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Ownership Stake</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#00C853" }}>
                {currentUser.ownershipPct.toFixed(1)}%
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Contribution Amount</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#0D1F0F" }}>
                {fmt(currentUser.paidAmount)}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Property Value</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#0D1F0F" }}>
                {fmt(pool.propertyPrice)}
              </p>
            </div>
          </div>

          {/* Pool Details */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Pool Name</p>
                <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>{pool.name}</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Total Members</p>
                <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>{members.length} co-owners</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Certificate Date</p>
                <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>{formatDate()}</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "4px" }}>Certificate ID</p>
                <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>
                  COOWN-{pool.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* All Members Section */}
          <div style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #E5E5E0"
          }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0D1F0F", marginBottom: "16px" }}>
              All Co-Owners in this Pool
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {members.map(member => (
                <span
                  key={member.id}
                  style={{
                    padding: "6px 14px",
                    background: member.userId === user?.id ? "rgba(0,200,83,0.1)" : "#F5F5F0",
                    borderRadius: "999px",
                    fontSize: "13px",
                    color: member.userId === user?.id ? "#00C853" : "#5C6B5E",
                    fontWeight: member.userId === user?.id ? 600 : 400
                  }}
                >
                  {member.firstName} {member.lastName} ({member.ownershipPct.toFixed(1)}%)
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: "48px",
            textAlign: "center",
            paddingTop: "24px",
            borderTop: "1px solid #E5E5E0"
          }}>
            <p style={{ fontSize: "12px", color: "#8A9E8C", marginBottom: "8px" }}>
              This certificate is generated automatically and is legally binding.
            </p>
            <p style={{ fontSize: "11px", color: "#BDBDBD" }}>
              CoOwn • Verified Co-Ownership Platform • {formatDate()}
            </p>
            <div style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "center",
              gap: "24px"
            }}>
              <span style={{ fontSize: "10px", color: "#BDBDBD" }}>BVN Verified</span>
              <span style={{ fontSize: "10px", color: "#BDBDBD" }}>Escrow Protected</span>
              <span style={{ fontSize: "10px", color: "#BDBDBD" }}>Legal Agreement Filed</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}