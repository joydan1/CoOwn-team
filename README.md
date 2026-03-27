# CoOwn — Group Property Co-Ownership Platform

> **"Turn a WhatsApp conversation into a title deed."**

[![Hackathon](https://img.shields.io/badge/Enyata%20x%20Interswitch-Hackathon%202026-5B4FCF)](https://github.com)
[![Sectors](https://img.shields.io/badge/Sectors-Real%20Estate%20%7C%20XB%20Payments%20%7C%20Payments-0F6E56)](https://github.com)
[![Status](https://img.shields.io/badge/Status-MVP%20Live-green)](https://github.com)

---

## The Problem

Most Nigerians cannot afford property alone — but groups of friends, family, and colleagues can. The gap is not financial willingness. It is the absence of trust infrastructure. Groups discuss buying land together on WhatsApp every day, but nothing happens because nobody knows how to manage the money, the ownership, or the exit — without destroying the friendship.

**CoOwn solves this.**

---

## What We Built

CoOwn is a group property co-ownership platform where young Nigerians pool funds with friends, family, or even strangers to purchase land, buildings, or fund construction projects — with full financial transparency, legal structure, AI-powered property intelligence, and cross-border payment support baked in.

---

## Key Features

### 🏘️ Property Marketplace
Browse verified listings across Lagos, Abuja, and Port Harcourt. Every property shows an AI-generated independent valuation so you know if the price is fair before you commit.

### 👥 Group Pool Creation
See a property you love? Start a pool in 3 taps. CoOwn generates a unique invite link instantly. Share it to WhatsApp. Friends join in under 60 seconds.

### 📊 Live Contribution Dashboard
The hero screen. Every pool member sees the target, how much has been raised, and everyone's exact ownership percentage — updating in real time as contributions come in. Nobody has to ask "have you paid?" The platform handles accountability.

### 🌍 Open Pool Mechanic *(Our Unique Feature)*
A group that has partially funded their property can list their remaining stake publicly. Any user on CoOwn can discover the pool, review the verified documents, and buy in as a co-owner — with people they have never met — safely, because the money sits in escrow and every member is BVN-verified.

### 💸 Cross-Border Payments
Diaspora members contribute from the UK, US, or Canada in their local currency. CoOwn converts via live FX rates and routes through Interswitch's cross-border infrastructure. Stake updates automatically in naira.

### 📜 Legal Co-Ownership Agreement
Auto-generated Tenancy-in-Common agreement signed digitally by every pool member before a single naira moves. Legally structured, digitally enforced.

### 🏆 Ownership Certificate
When the property is purchased, every co-owner receives a digital certificate recording their stake — verifiable, downloadable, and permanently stored in the document vault.

---

## Screenshots

> *(Add your screenshots here — see setup guide for instructions)*

| Listings | Pool Dashboard | Certificate |
|----------|---------------|-------------|
| ![Listings](docs/screenshots/listings.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Certificate](docs/screenshots/certificate.png) |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React ) | Cross-platform mobile app |
| Backend | Node.js + Express | REST API server |
| Database | PostgreSQL via Supabase | Relational data + auth |
| Real-time | Supabase Realtime | Live dashboard updates |
| Payments | Interswitch Webpay API | NGN contributions + XB |
| AI/ML | Python + XGBoost + FastAPI | Property valuation model |
| File Storage | Supabase Storage | Document vault uploads |
| Frontend Hosting | Vercel | Fast deploys |
| Backend Hosting | Railway | API server |

---

## How It Works

```
User browses listings
        ↓
Finds a property → 3 options:
  [Buy alone]  [Start a group pool]  [Join open pool]
        ↓
Creates pool → Invites friends via WhatsApp link
        ↓
Members join → Declare contribution amounts
        ↓
Everyone signs the co-ownership agreement
        ↓
Contributions flow into escrow (not anyone's personal account)
        ↓
Dashboard shows live ownership % per member
        ↓
Group votes to release funds → Seller is paid
        ↓
Ownership certificates issued to all members
```

---

## AI/ML Features

Our AI/ML engineer built two models:

**1. Property Valuation Model**
Trained on Nigerian property price data. Takes location, property type, size, and area growth rate as inputs. Returns an estimated market value range with a confidence score. Served as a FastAPI microservice called at listing creation.

**2. Ownership Value Forecaster**
Projects the estimated future value of each member's stake over 2–3 years based on historical area price appreciation data. Shown on the personal dashboard.

---

## Getting Started

See the full [Setup Guide](docs/SETUP.md) to run this project locally.

**Quick start:**

```bash
# Clone the repo
git clone https://github.com/YOUR-TEAM-NAME/coown.git
cd coown

# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npx expo start

# AI service (new terminal)
cd ai && pip install -r requirements.txt && uvicorn main:app --reload
```

---

## Project Structure

```
coown/
├── README.md
├── frontend/          # React Native (Expo) app
├── backend/           # Node.js + Express API
├── ai/                # Python valuation microservice
└── docs/
    ├── SETUP.md       # Full local setup guide
    ├── ARCHITECTURE.md # System design decisions
    ├── API.md          # All backend endpoints
    └── DEMO.md         # Demo script + walkthrough
```

---

## Business Model

CoOwn earns only when users succeed — fully aligned incentives.

| Revenue Stream | How It Works | Est. Per Transaction |
|---------------|-------------|---------------------|
| Pool completion fee | 1.5% of successful pool value | ₦120,000 on ₦8M pool |
| XB FX spread | 0.5% on cross-border contributions | ₦10,000 on ₦2M transfer |
| Premium listings | Developer partners pay for featured slots | ₦50,000–₦150,000/mo |
| Secondary market | 1% on stake resales | Variable |

---

## Hackathon Sectors Covered

- ✅ **R — Real Estate** (core product)
- ✅ **XB — Cross-Border Payments** (diaspora contributions)
- ✅ **P — Payments** (Interswitch integration)
- ✅ **S — Social Services** (group wealth building for underserved communities)

---

## Team

| Name | Role | Responsibility |
|------|------|---------------|
| [PM Name] | Product Manager | Product strategy, PRD, user research, demo |
| [Backend Name] | Backend Engineer | API, database, payments, escrow logic |
| [Frontend Name] | Frontend Engineer | Mobile UI, screens, real-time dashboard |
| [AI Name] | AI/ML Engineer | Valuation model, forecaster, FastAPI service |

---

## Demo

- 🌐 **Live app:** [your-demo-link.vercel.app](https://your-demo-link.vercel.app)
- 🎥 **Demo video:** [Loom link here]
- 📊 **Pitch deck:** [Link here]
- 📋 **Full PRD:** Available on request

---

## Links

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Demo Walkthrough](docs/DEMO.md)

---

*Built with purpose at the Enyata x Interswitch Developer Hackathon, March 2026.*

