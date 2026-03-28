"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PaymentCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("processing")

  useEffect(() => {
    const poolId = searchParams.get("poolId")
    const responseCode = searchParams.get("resp")
    const txnRef = searchParams.get("txnref")

    if (responseCode === "00") {
      setStatus("success")
      setTimeout(() => {
        router.push(`/pools/${poolId}?payment=success`)
      }, 3000)
    } else {
      setStatus("failed")
      setTimeout(() => {
        router.push(`/pools/${poolId}?payment=failed`)
      }, 3000)
    }
  }, [router, searchParams])

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        {status === "processing" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <h2>Processing Payment...</h2>
            <p>Please wait while we confirm your payment.</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2>Payment Successful!</h2>
            <p>Redirecting to pool page...</p>
          </>
        )}
        
        {status === "failed" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <h2>Payment Failed</h2>
            <p>Redirecting to pool page...</p>
          </>
        )}
      </div>
    </main>
  )
}