"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { contributionsApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export default function ContributePage() {
  const router = useRouter()
  const params = useParams()
  const poolId = params.id as string
  const { user } = useAuthStore()

  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const contributionAmount = parseFloat(amount);
  if (isNaN(contributionAmount) || contributionAmount <= 0) {
    setError("Please enter a valid amount");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const response = await contributionsApi.pay({
      pool_id: poolId,
      user_id: user?.id,
      amount: contributionAmount,
      currency: "NGN",
      paymentMethod: "card"
    });

    const paymentRef = response.data.payment_ref || response.data.id || `COOWN-${Date.now()}`;

    console.log("✅ Payment ref:", paymentRef);

    // Small delay to ensure script is ready
    setTimeout(() => {
      if (typeof (window as any).webpayCheckout === "function") {
        const paymentData = {
          merchantCode: "MX275869",
          payItemID: "Default_Payable_MX275869",
          amount: Math.round(contributionAmount * 100).toString(),
          currencyCode: "566",
          customerEmail: user?.email || "customer@example.com",
          transactionReference: paymentRef,
          siteRedirectURL: `${window.location.origin}/payment/callback?poolId=${poolId}`,
          mode: "TEST"
        };

        console.log("🚀 Calling webpayCheckout with:", paymentData);

        (window as any).webpayCheckout(paymentData, {
          onComplete: (response: any) => {
            console.log("✅ Payment Completed:", response);
            alert(`Payment Successful! Reference: ${response?.transactionReference || paymentRef}`);
            router.push(`/pools/${poolId}`);
          },
          onClose: () => {
            console.log("Modal closed by user");
            setLoading(false);
          },
          onError: (err: any) => {
            console.error("❌ Payment Error:", err);
            setError("Payment failed or cancelled.");
            setLoading(false);
          }
        });
      } else {
        console.error("❌ webpayCheckout function NOT found on window");
        setError("Interswitch not ready. Please refresh the page and try again.");
        setLoading(false);
      }
    }, 800); // 800ms delay helps in Next.js dev

  } catch (err: any) {
    console.error("Backend error:", err);
    setError(err.response?.data?.message || "Failed to start payment");
    setLoading(false);
  }
};

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F0", padding: "40px 24px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <button 
          onClick={() => router.back()} 
          style={{ background: "none", border: "none", marginBottom: "24px", cursor: "pointer", fontSize: "16px" }}
        >
          ← Back to Pool
        </button>

        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>Contribute to Pool</h1>
        <p style={{ color: "#5C6B5E", marginBottom: "32px" }}>Enter the amount you want to contribute</p>

        {error && (
          <div style={{ 
            background: "#fee2e2", 
            color: "#dc2626", 
            padding: "14px", 
            borderRadius: "8px", 
            marginBottom: "20px" 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ₦ (e.g. 50000)"
            style={{ 
              width: "100%", 
              padding: "14px", 
              border: "1px solid #ddd", 
              borderRadius: "8px", 
              marginBottom: "20px", 
              fontSize: "16px" 
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "16px", 
              background: loading ? "#9CA3AF" : "#00C853", 
              color: "#0D1F0F", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: 600, 
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing..." : "Continue to Pay"}
          </button>
        </form>
        <button
  onClick={() => {
    console.log("webpayCheckout exists?", typeof (window as any).webpayCheckout);
    alert("webpayCheckout function exists: " + (typeof (window as any).webpayCheckout === "function"));
  }}
  style={{ marginTop: "16px", padding: "10px", background: "#ddd" }}
>
  Check if Interswitch is Loaded
</button>
      </div>
    </main>
  )
}