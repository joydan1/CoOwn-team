"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { poolsApi, contributionsApi, milestonesApi, usersApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

interface Pool {
  id: string
  name: string
  propertyId: string
  propertyTitle: string
  propertyLocation: string
  propertyImage: string
  targetAmount: number
  raisedAmount: number
  memberCount: number
  memberLimit: number
  deadline: string
  status: "open" | "funding" | "active" | "completed"
  isPublic: boolean
  description?: string
  creatorId: string
}

interface Member {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  paidAmount: number
  ownershipPct: number
  joinedAt: string
  isCreator: boolean
}

interface Milestone {
  id: string
  title: string
  description: string
  targetAmount: number
  status: "pending" | "active" | "completed"
  votesReceived: number
  votesRequired: number
}

const fmt = (n: number) => "₦" + (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K")

export default function PoolDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const poolId = params.id as string

  const [pool, setPool] = useState<Pool | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "milestones">("overview")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [makingPublic, setMakingPublic] = useState(false)

  useEffect(() => {
    fetchPoolData()
  }, [poolId])

  const fetchPoolData = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      
      console.log("Fetching pool with ID:", poolId)
      
      const poolRes = await poolsApi.getOne(poolId)
      console.log("Pool API response:", poolRes)
      
      const data = poolRes.data
      console.log("Pool data:", data)
      
      const transformedPool: Pool = {
        id: data.id,
        name: data.name,
        propertyId: data.property?.id || data.property_id,
        propertyTitle: data.property?.title || data.property_title || "Property",
        propertyLocation: data.property?.location || data.property_location || "Location",
        propertyImage: data.property?.image || data.property?.images?.[0] || "",
        targetAmount: parseFloat(data.target_amount || data.targetAmount || "0"),
        raisedAmount: parseFloat(data.raised_amount || data.raisedAmount || "0"),
        memberCount: data.member_count || data.memberCount || 0,
        memberLimit: data.member_limit || data.memberLimit || 0,
        deadline: data.deadline,
        status: data.status || "open",
        isPublic: data.is_public ?? data.isPublic ?? false,
        description: data.description,
        creatorId: data.creator_id || data.creator?.id || "",
      }
      setPool(transformedPool)

      
console.log("=== USER DEBUG ===")
console.log("Current user ID:", user?.id)
console.log("Pool creator ID:", transformedPool.creatorId)
console.log("Is creator?", user?.id === transformedPool.creatorId)
      
      try {
        const membersRes = await poolsApi.getMembers(poolId)
        console.log("Members response:", membersRes)
        const membersData = membersRes.data || []
        
        const transformedMembers: Member[] = membersData.map((member: any) => ({
          id: member.id,
          userId: member.userId || member.user_id,
          firstName: member.firstName || member.first_name || "User",
          lastName: member.lastName || member.last_name || "",
          email: member.email,
          paidAmount: member.paidAmount || member.paid_amount || 0,
          ownershipPct: member.ownershipPct || member.ownership_pct || 0,
          joinedAt: member.joinedAt || member.joined_at || new Date().toISOString(),
          isCreator: member.isCreator || member.is_creator || false
        }))
        setMembers(transformedMembers)
      } catch (membersErr) {
        console.error("Failed to fetch members:", membersErr)
      }
      
      try {
        const milestonesRes = await milestonesApi.list()
        console.log("Milestones response:", milestonesRes)
        const poolMilestones = (milestonesRes.data || [])
          .filter((m: any) => m.poolId === poolId || m.pool_id === poolId)
          .map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description || "",
            targetAmount: m.targetAmount || m.target_amount || 0,
            status: m.status || "pending",
            votesReceived: m.votesReceived || m.votes_received || 0,
            votesRequired: m.votesRequired || m.votes_required || 0
          }))
        setMilestones(poolMilestones)
      } catch (milestonesErr) {
        console.error("Failed to fetch milestones:", milestonesErr)
      }
      
    } catch (err: any) {
      console.error("Failed to fetch pool:", err)
      console.error("Error response:", err.response)
      console.error("Error status:", err.response?.status)
      console.error("Error data:", err.response?.data)
      
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else if (err.response?.status === 404) {
        setError("Pool not found. It may have been deleted.")
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Failed to load pool. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = () => {
    router.push(`/pools/${poolId}/contribute`)
  }

  const handleInvite = () => {
    setShowInviteModal(true)
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/pools/join/${poolId}`
    navigator.clipboard.writeText(link)
    alert("Invite link copied to clipboard!")
  }

  const handleVote = async (milestoneId: string) => {
    try {
      await milestonesApi.vote(milestoneId)
      fetchPoolData()
    } catch (err) {
      console.error("Failed to vote:", err)
    }
  }

  const handleMakePublic = async () => {
    setMakingPublic(true)
    try {
      await poolsApi.togglePublic(poolId, { is_public: true })
      setSuccess("Pool is now public! It will appear on the Open Pools tab.")
      setPool(prev => prev ? { ...prev, isPublic: true } : null)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Failed to make pool public:", err)
      setError(err.response?.data?.message || "Could not make pool public")
      setTimeout(() => setError(""), 3000)
    } finally {
      setMakingPublic(false)
    }
  }

  const progress = pool ? (pool.raisedAmount / pool.targetAmount) * 100 : 0
  const daysLeft = pool ? Math.max(0, Math.ceil((new Date(pool.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
  const isCreator = user?.id === pool?.creatorId
  const currentUserMember = members.find(m => m.userId === user?.id)
  const currentUserContribution = currentUserMember?.paidAmount || 0

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
          <p style={{ color: "#5C6B5E" }}>Loading pool details...</p>
        </div>
      </main>
    )
  }

  if (error && !pool) {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
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

  if (!pool) return null

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", fontFamily: "var(--font-body)" }}>

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
            onClick={() => router.push("/pools")}
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
            Back
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        
        {success && (
          <div style={{
            background: "rgba(0,200,83,0.1)",
            border: "1px solid rgba(0,200,83,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#00C853"
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#dc2626"
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 700,
                color: "#0D1F0F",
                marginBottom: "8px"
              }}>
                {pool.name}
              </h1>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", color: "#5C6B5E" }}>
                  📍 {pool.propertyLocation}
                </span>
                {pool.isPublic && (
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: "rgba(0,200,83,0.1)",
                    color: "#00C853"
                  }}>
                    Open Pool
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleInvite}
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  border: "1px solid #00C853",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#00C853",
                  cursor: "pointer"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,200,83,0.05)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff" }}
              >
                Invite
              </button>
              
              {pool.status !== "completed" && (
                <button
                  onClick={handleContribute}
                  style={{
                    padding: "10px 24px",
                    background: "#00C853",
                    border: "none",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0D1F0F",
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#00E676" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#00C853" }}
                >
                  Contribute
                </button>
              )}
              
              {pool.status === "completed" && (
                <button
                  onClick={() => router.push(`/pools/${poolId}/certificate`)}
                  style={{
                    padding: "10px 20px",
                    background: "#fff",
                    border: "1px solid #00C853",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#00C853",
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,200,83,0.05)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff" }}
                >
                  View Certificate
                </button>
              )}
              
              {!pool.isPublic && (
  <button
    onClick={handleMakePublic}
    disabled={makingPublic}
    style={{
      padding: "10px 20px",
      background: makingPublic ? "#BDBDBD" : "#fff",
      border: "1px solid #F97316",
      borderRadius: "999px",
      fontSize: "14px",
      fontWeight: 600,
      color: makingPublic ? "#6E6E6E" : "#F97316",
      cursor: makingPublic ? "not-allowed" : "pointer"
    }}
    onMouseEnter={e => { if (!makingPublic) e.currentTarget.style.background = "rgba(249,115,22,0.05)" }}
    onMouseLeave={e => { e.currentTarget.style.background = "#fff" }}
  >
    {makingPublic ? "Making Public..." : "Make Public"}
  </button>
)}
            </div>
              </div>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "32px",
          border: "1px solid #E5E5E0"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", color: "#5C6B5E" }}>Progress</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#0D1F0F" }}>
                {fmt(pool.raisedAmount)} / {fmt(pool.targetAmount)}
              </span>
            </div>
            <div style={{ height: "12px", background: "#E5E5E0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "#00C853",
                borderRadius: "999px",
                transition: "width 0.3s"
              }} />
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Members</p>
              <p style={{ fontSize: "24px", fontWeight: 700, color: "#0D1F0F" }}>
                {pool.memberCount} / {pool.memberLimit}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Your Contribution</p>
              <p style={{ fontSize: "24px", fontWeight: 700, color: "#00C853" }}>
                {fmt(currentUserContribution)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Your Ownership</p>
              <p style={{ fontSize: "24px", fontWeight: 700, color: "#0D1F0F" }}>
                {currentUserMember?.ownershipPct.toFixed(1) || 0}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Days Left</p>
              <p style={{ fontSize: "24px", fontWeight: 700, color: daysLeft < 7 ? "#F97316" : "#0D1F0F" }}>
                {daysLeft}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #E5E5E0", marginBottom: "24px" }}>
          {[
            { key: "overview", label: "Overview" },
            { key: "members", label: `Members (${pool.memberCount})` },
            { key: "milestones", label: `Milestones (${milestones.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "12px 24px",
                background: "none",
                border: "none",
                fontSize: "16px",
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? "#00C853" : "#5C6B5E",
                borderBottom: activeTab === tab.key ? "2px solid #00C853" : "none",
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div>
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              border: "1px solid #E5E5E0"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D1F0F", marginBottom: "12px" }}>Pool Description</h3>
              <p style={{ fontSize: "15px", color: "#5C6B5E", lineHeight: 1.6 }}>
                {pool.description || "No description provided."}
              </p>
            </div>

            <div style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E5E5E0"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D1F0F", marginBottom: "16px" }}>Property Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Property</p>
                  <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>{pool.propertyTitle}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Location</p>
                  <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>{pool.propertyLocation}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Target Amount</p>
                  <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>{fmt(pool.targetAmount)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#8A9E8C" }}>Deadline</p>
                  <p style={{ fontSize: "16px", fontWeight: 500, color: "#0D1F0F" }}>
                    {new Date(pool.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E5E0",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#F5F5F0" }}>
                <tr>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Member</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Contribution</th>
                  <th style={{ padding: "16px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#5C6B5E" }}>Ownership</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} style={{ borderTop: "1px solid #E5E5E0" }}>
                    <td style={{ padding: "16px" }}>
                      <div>
                        <span style={{ fontWeight: 600, color: "#0D1F0F" }}>
                          {member.firstName} {member.lastName}
                          {member.isCreator && (
                            <span style={{ marginLeft: "8px", fontSize: "11px", color: "#00C853" }}>Creator</span>
                          )}
                          {member.userId === user?.id && (
                            <span style={{ marginLeft: "8px", fontSize: "11px", color: "#3B82F6" }}>You</span>
                          )}
                        </span>
                        <p style={{ fontSize: "12px", color: "#8A9E8C", marginTop: "2px" }}>{member.email}</p>
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", fontWeight: 600, color: "#0D1F0F" }}>
                      {fmt(member.paidAmount)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", fontWeight: 600, color: "#00C853" }}>
                      {member.ownershipPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "milestones" && (
          <div>
            {milestones.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "16px" }}>
                <p style={{ color: "#5C6B5E" }}>No milestones created yet</p>
                {isCreator && (
                  <button style={{
                    marginTop: "16px",
                    padding: "10px 20px",
                    background: "#00C853",
                    border: "none",
                    borderRadius: "999px",
                    cursor: "pointer"
                  }}>
                    Create First Milestone
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {milestones.map(milestone => (
                  <div key={milestone.id} style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #E5E5E0"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D1F0F" }}>{milestone.title}</h3>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: milestone.status === "completed" ? "rgba(0,200,83,0.1)" : "rgba(245,158,11,0.1)",
                        color: milestone.status === "completed" ? "#00C853" : "#F59E0B"
                      }}>
                        {milestone.status === "completed" ? "Completed" : "Pending Vote"}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#5C6B5E", marginBottom: "12px" }}>{milestone.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#8A9E8C" }}>
                        {milestone.votesReceived}/{milestone.votesRequired} votes
                      </span>
                      {milestone.status === "pending" && milestone.votesReceived === 0 && (
                        <button
                          onClick={() => handleVote(milestone.id)}
                          style={{
                            padding: "8px 20px",
                            background: "#00C853",
                            border: "none",
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Vote
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showInviteModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowInviteModal(false)}>
          <div style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%"
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Invite Members</h3>
            <p style={{ color: "#5C6B5E", marginBottom: "24px" }}>
              Share this link with friends to join your pool
            </p>
            <div style={{
              background: "#F5F5F0",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "20px",
              wordBreak: "break-all"
            }}>
              <code style={{ fontSize: "12px" }}>
                {`${window.location.origin}/pools/join/${poolId}`}
              </code>
            </div>
            <button
              onClick={copyInviteLink}
              style={{
                width: "100%",
                padding: "14px",
                background: "#00C853",
                border: "none",
                borderRadius: "999px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Copy Link
            </button>
            <button
              onClick={() => setShowInviteModal(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "transparent",
                border: "none",
                marginTop: "12px",
                cursor: "pointer",
                color: "#5C6B5E"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}