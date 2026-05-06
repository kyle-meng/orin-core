# ORIN Core

> **Every space knows you.**

ORIN is a revolutionary DePIN protocol that recognizes users across physical spaces (hotels, homes, and cars) and automatically synchronizes their environment to their saved preferences via Solana-based identities.

---

## Hackathon Highlights: Spring 2026

We've moved beyond a simple IoT bridge to a full-stack hospitality settlement layer:

- **Frictionless Onboarding**: Our **Auto-Activation** technology allows new users to register on Solana implicitly during their first interaction (like saving a room preset or paying). No "Account Initialization" road-blocks.
- **PUSD Loyalty Loop**: A complete circular economy. Pay with **$PUSD**, earn **ORIN Points** on-chain (10% reward), and redeem points for instant discounts (10:1 ratio) during your next booking.
- **Hash-Lock Privacy**: Sovereign identity without the surveillance. Preferences are hashed locally; only 32-byte SHA-256 hashes are stored on-chain, ensuring absolute GDPR compliance while maintaining verifiability.
- **AI Concierge**: Integrated voice-to-intent pipeline using **Groq** and **Deepgram**, mapping natural language to on-chain state transitions.

---

## Modular Architecture

### 1. Identity Layer (Solana / Anchor)
- **Guest PDA**: Immutable, owner-controlled accounts.
- **Portable States**: Preferences travel with the user, not the hotel property.
- **On-chain Rewards**: Real-time loyalty issuance via dedicated reward authorities.

### 2. Settlement Layer (PUSD / Tokens)
- **Closed-loop Booking**: Integrated search-to-payment pipeline using $PUSD.
- **Dynamic Discounts**: Points-to-USD conversion logic enforced by smart contracts.

### 3. Intelligence Layer (The Hub)
- **Real-time Bridge**: Sub-second sync between Solana mutations and physical hardware.
- **Gas Relayer**: Zero-gas UX for guests; backend subsidizes identity and preference updates.
- **AI Agent**: Natural language interface for room control and booking.

---

## Tech Stack
- **L1 & Logic:** `Solana` / `Anchor` / `Rust`
- **Stablecoin:** `$PUSD`
- **Infrastructure:** `Node.js` / `TypeScript` / `Firebase Real-time DB` / `Redis`
- **AI/ML:** `Groq (Llama 3.1)` / `Deepgram (TTS/STT)` / `Cartesia`
- **UI/UX:** `Next.js 15` / `Vanilla CSS (Premium Aesthetic)` / `Privy (Social Auth)`

---

## Project Structure
- `programs/` - The source of truth: Smart contracts in Rust.
- `backend/` - The nervous system: Node.js listener, PUSD handler, and AI pipeline.
- `frontend/` - The interface: Premium Web3 concierge dashboard.
- `docs/` - Architecture diagrams and vision briefs.

## Core Team
- **Shalom**: Founder & Visionary (10+ years in Hospitality)
- **Kyle Meng**: Technical Lead (Smart Contracts & Backend)
- **Marvelbyte & Defi Mantle**: Frontend & UI/UX Engineer
- **Federico**: AI & Smart Logic Engineer


---

## Privacy-First Strategy
ORIN utilizes an Off-Chain Data / On-Chain Verification (Hash-Lock) strategy. Sensitive guest preferences are never stored as plaintext on-chain, ensuring 100% GDPR compliance and E2E privacy.

---
*Built with passion for the Solana Network State Spring 2026 Hackathon.*

## AI Agent (Backend)

The ORIN AI concierge implementation is available at:

- `backend/src/ai_agent.ts`

Full documentation:

- `docs/AI_AGENT_GUIDE.md`

Required backend environment variables:

- `GROQ_API_KEY`
- `DEEPGRAM_API_KEY`

Optional:

- `GROQ_MODEL`
- `DEEPGRAM_TTS_MODEL`

## Quick Start (Beginner Friendly)

If you are new to the project, follow these exact steps.

### 1. Install dependencies

```bash
npm install
cd backend
npm install
```

### 2. Create environment file

```bash
cd backend
cp .env.example .env
```

If you do not have Redis yet, set:

```env
STATE_PROVIDER=memory
```

### 3. Validate backend config

```bash
cd backend
npm run validate:env
```

### 4. Start backend services

```bash
cd backend
npm run dev:all
```

Expected:

- API running (`/health`)
- Secure Gateway listener running

### 5. Optional simulation

In another terminal:

```bash
cd backend
npm run simulate
```

### 6. Where to read more

- Development flow: `docs/DEVELOPMENT_GUIDE.md`
- Frontend/chain integration: `docs/INTEGRATION_SPEC.md`
- AI agent details: `docs/AI_AGENT_GUIDE.md`


