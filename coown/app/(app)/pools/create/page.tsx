"use client"

import { Suspense } from "react"
import CreatePoolContent from "./CreatePoolContent"

export default function CreatePoolPage() {
  return (
    <Suspense fallback={
      <main style={{ 
        minHeight: "100vh", 
        background: "#F5F5F0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
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
          <p style={{ color: "#5C6B5E" }}>Loading create pool form...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    }>
      <CreatePoolContent />
    </Suspense>
  )
}