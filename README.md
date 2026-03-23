# ORIN Core 🛰️

> **Every space knows your song.**

ORIN is a revolutionary DePIN protocol that recognizes users across physical spaces hotels, homes, and cars and automatically synchronizes their environment to their saved preferences via Solana based identities.

---

## 🏗️ Phase 1: MVP Architecture
- **[On-chain]** **Sovereign Identity:** Anchor-based Guest PDA structure for immutable preference storage.
- **[Middleware]** **Real-time Bridge:** High-performance Node.js & Firebase synchronization for sub-second physical response.
- **[Physical]** **IoT Control:** Integrated Philips Hue & Google Nest control logic (Mocked for Phase 1 Demo).

## 🧩 Modular Layers & Current Status

### 👑 CEO & Product Visionary
**Status:** Active & Scaling by @Shalom

The "Navigator" of ORIN, bridging technical innovation with real-world hospitality business.
- **Business Development:** Leading partnerships with hotel chains and the Solana ecosystem.
- **Fundraising & Growth:** Managing hackathon submissions, VC relations, and grant applications.
- **Product Quality (CPO):** Defining the "Premium & Seamless" brand identity and ensuring the UX meets global hospitality standards.
- **Strategy:** Aligning the "Web2.5" roadmap with long-term market demands.

### 🎨 Frontend Layer (UI/UX)
**Status:** In Progress by @Defidoctor10

The frontend is the "Entry Point" for guests, focusing on high-end animations and seamless Web3 onboarding.
- **Key Tech:** Next.js 15, Tailwind CSS, Framer Motion (for "butter-smooth" animations).
- **Identity:** Integration with Privy/Dynamic for Email-to-Wallet onboarding (Social Login).
- **State Management:** Real-time sync with Solana Devnet via `@solana/web3.js` and our Backend Hub.
- **Deliverables:** Guest Dashboard, Room Control Interface, and Service Booking.

### 🏗️ Backend & Settlement Layer (The Hub)
**Status:** Core Ready by @dex_p (Kyle Meng)

The "Brain" that bridges the physical IoT world with the Solana blockchain.
- **Blockchain:** Solana Program (Anchor Framework) deployed on Devnet.
- **Event Listener:** Real-time monitoring of Program ID: `FqtrHgdYTph1DSP9jDYD7xrKPrjSjCTtnw6fyKMmboYk`.
- **IoT Bridge:** MQTT protocol integration to sync On-chain Preferences to physical hardware (Nest, Hue, etc.).
- **Gas Relayer:** Handling meta-transactions to ensure guests never see a "Gas Fee" error.

### 🧠 AI Intelligence Layer (Concierge)
**Status:** Ready for @federico to implement.

The "Intent Translator" that turns guest natural language into on-chain states.
- **Core Logic:** GPT-4o / Claude 3.5 via Vercel AI SDK.
- **Function:** Mapping *"I'm feeling cold"* -> `Instruction: update_preferences(temp: 24.5)`.
- **Task:** Define System Prompts and response schemas for the "ORIN Concierge".

## 🛠️ Tech Stack
- **L1 & Logic:** `Solana` / `Anchor` / `Rust`
- **Infrastructure:** `Node.js` / `TypeScript` / `Firebase Real-time DB`
- **UI/UX:** `Next.js` / `Tailwind CSS` / `Solana Wallet Adapter`

## 📂 Project Structure
- `programs/` - The source of truth: Smart contracts in Rust.
- `backend/` - The nervous system: Node.js listener and Firebase sync logic.
- `frontend/` - The interface: Web3 dashboard for guest management.
- `docs/` - Architecture diagrams and vision briefs.

## 👥 Core Team
- **Shalom:** Founder & Visionary (10+ years in Hospitality)
- **Kyle Meng:** Technical Lead (Smart Contracts & Backend)
- **Defi Mantle:** Frontend & UI/UX Engineer
- **Federico:** AI & Smart Logic Engineer
- **Victor:** Strategy & M&A

Privacy-First Architecture: ORIN utilizes an Off-Chain Data / On-Chain Verification (Hash-Lock) strategy. Sensitve guest preferences are never stored as plaintext on-chain, ensuring 100% GDPR compliance and E2E privacy.

---
*Built with passion for the Solana Network State Spring 2026 Hackathon.*
