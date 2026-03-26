"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useAuthStore } from "@/store/auth"
import { usersApi } from "@/lib/api"

const ACCENT  = "#00C853"
const CREAM   = "#F5F5F0"
const CHAR    = "#0D1F0F"
const MUTED   = "#5C6B5E"
const FAINT   = "#8A9E8C"
const BORDER  = "#D9D9D4"
const RED     = "#DC2626"
const RED_BG  = "rgba(220,38,38,0.07)"


function CallbackInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { setAuth }  = useAuthStore()

  const [status, setStatus] = useState<"loading" | "error">("loading")
  const [errMsg, setErrMsg] = useState("")

  useEffect(() => {
    // ── 1. Pull tokens from query string ──────────────────────────────
    // Backend may send: ?accessToken=xxx&refreshToken=yyy
    // or legacy:        ?token=xxx&refreshToken=yyy
    const token        = searchParams.get("accessToken") ?? searchParams.get("token")
    const refreshToken = searchParams.get("refreshToken") ?? undefined

    if (!token) {
      setStatus("error")
      setErrMsg("No token received from Google. Please try again.")
      setTimeout(() => router.replace("/login?error=oauth_failed"), 2800)
      return
    }

    // ── 2. Decode JWT payload to get userId ───────────────────────────
    // We never trust frontend-decoded data for auth — we use it only to
    // know which user endpoint to call. The real auth is the bearer token.
    let userId: string | undefined

    try {
      const base64Url = token.split(".")[1]
      if (!base64Url) throw new Error("Malformed token")
      const base64  = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const payload = JSON.parse(atob(base64))
      // Handle both common payload shapes: { id } or { sub }
      userId = payload.id ?? payload.sub
    } catch {
      setStatus("error")
      setErrMsg("Could not read your session. Please try again.")
      setTimeout(() => router.replace("/login?error=oauth_failed"), 2800)
      return
    }

    if (!userId) {
      setStatus("error")
      setErrMsg("User ID missing from token. Please try again.")
      setTimeout(() => router.replace("/login?error=oauth_failed"), 2800)
      return
    }

    // ── 3. Fetch full user object + persist auth ───────────────────────
    usersApi
      .getOne(userId)
      .then((res) => {
        setAuth(res.data, token, refreshToken)
        router.replace("/listings")
      })
      .catch((err) => {
        console.error("Callback: failed to fetch user", err)
        setStatus("error")
        setErrMsg("We couldn't load your account. Please sign in manually.")
        setTimeout(() => router.replace("/login?error=oauth_failed"), 2800)
      })
  }, [router, searchParams, setAuth])

  /* ── Loading state ── */
  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: CREAM, gap: "24px",
        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
      }}>
        {/* Logo */}
        <span style={{
          fontFamily: "var(--font-display, 'Fraunces', serif)",
          fontSize: "26px", fontWeight: 700,
          color: CHAR, letterSpacing: "-0.5px",
          animation: "fadeIn 0.6s ease both",
        }}>
          Co<span style={{ color: ACCENT }}>Own</span>
        </span>

        {/* Spinner */}
        <div style={{ position: "relative", width: "52px", height: "52px" }}>
          {/* Track */}
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: `3px solid ${BORDER}`,
          }}/>
          {/* Active arc */}
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: `3px solid transparent`,
            borderTopColor: ACCENT,
            animation: "spin 0.75s linear infinite",
          }}/>
          {/* Inner dot */}
          <div style={{
            position: "absolute",
            width: "10px", height: "10px",
            borderRadius: "50%",
            background: ACCENT,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.5,
            animation: "pulse 1.5s ease-in-out infinite",
          }}/>
        </div>

        {/* Text */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: "17px", fontWeight: 500, color: CHAR,
            marginBottom: "6px",
            animation: "fadeIn 0.6s ease 0.15s both",
          }}>
            Signing you in…
          </p>
          <p style={{
            fontSize: "14px", color: FAINT,
            animation: "fadeIn 0.6s ease 0.3s both",
          }}>
            Setting up your CoOwn account
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          width: "200px", height: "3px",
          background: BORDER, borderRadius: "999px",
          overflow: "hidden",
          animation: "fadeIn 0.6s ease 0.4s both",
        }}>
          <div style={{
            height: "100%", background: ACCENT,
            borderRadius: "999px",
            animation: "progressSlide 2s ease-in-out infinite",
          }}/>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
            50%       { opacity: 0.8; transform: translate(-50%, -50%) scale(1.4); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes progressSlide {
            0%   { width: 0%;   margin-left: 0%; }
            50%  { width: 60%;  margin-left: 20%; }
            100% { width: 0%;   margin-left: 100%; }
          }
        `}</style>
      </div>
    )
  }

  /* ── Error state ── */
  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: CREAM, gap: "20px",
      fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
      padding: "24px",
    }}>
      {/* Logo */}
      <span style={{
        fontFamily: "var(--font-display, 'Fraunces', serif)",
        fontSize: "26px", fontWeight: 700,
        color: CHAR, letterSpacing: "-0.5px",
      }}>
        Co<span style={{ color: ACCENT }}>Own</span>
      </span>

      {/* Error card */}
      <div style={{
        background: RED_BG,
        border: `1px solid rgba(220,38,38,0.18)`,
        borderRadius: "14px",
        padding: "20px 24px",
        maxWidth: "360px", width: "100%",
        textAlign: "center",
      }}>
        {/* Icon */}
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: "rgba(220,38,38,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={RED}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1" fill="white"/>
          </svg>
        </div>

        <p style={{ fontSize: "16px", fontWeight: 600, color: RED, marginBottom: "8px" }}>
          Sign-in failed
        </p>
        <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.6, marginBottom: "16px" }}>
          {errMsg}
        </p>
        <p style={{ fontSize: "13px", color: FAINT }}>
          Redirecting you back in a moment…
        </p>
      </div>

      {/* Manual redirect link */}
      <button
        onClick={() => router.replace("/login")}
        style={{
          background: "none", border: "none",
          color: ACCENT, fontSize: "15px", fontWeight: 600,
          cursor: "pointer", fontFamily: "var(--font-body)",
          textDecoration: "underline", textUnderlineOffset: "3px",
        }}
      >
        Go to sign in now
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────
   Page export — wraps inner in Suspense
   Required by Next.js 13+ when using
   useSearchParams() inside a client component
───────────────────────────────────────── */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#F5F5F0",
        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px",
            border: "3px solid #D9D9D4",
            borderTopColor: "#00C853",
            borderRadius: "50%",
            animation: "spin 0.75s linear infinite",
            margin: "0 auto 16px",
          }}/>
          <p style={{ color: "#5C6B5E", fontSize: "15px" }}>Loading…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}