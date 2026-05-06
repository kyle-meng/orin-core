# ORIN Frontend: The Premium Concierge

> **Elevating hospitality through ambient intelligence and frictionless Web3 onboarding.**

The ORIN frontend is a high-end, mobile-first dashboard designed for the modern traveler. It serves as the gateway to the ORIN DePIN protocol, allowing guests to manage their sovereign identity, room preferences, and hotel bookings through a single, elegant interface.

## Premium User Experience
- **Frictionless Social Login**: Integrated with **Privy**, allowing guests to create a Solana wallet using just an email or social account. 
- **Implicit Registration**: New users are automatically registered on-chain during their first interaction (Save Setup/Pay), removing all Web3 onboarding friction.
- **AI-Driven Interactions**: Real-time voice and text interface to control physical environments and curate hotel stays.
- **Financial Clarity**: Transparent $PUSD payment flows with real-time status updates and on-chain loyalty point visualization.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (Curated Palette: Cormorant Garamond & DM Mono)
- **Identity:** Privy (Social/Email Auth)
- **Blockchain:** Solana Devnet via `@coral-xyz/anchor` & `@solana/web3.js`
- **Stablecoin:** $PUSD (Spl-Token)

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
src/
|-- app/
|   |-- layout.tsx          # Root layout (fonts, wallet provider)
|   |-- page.tsx            # Main page (nav, room control, footer)
|   `-- globals.css         # ORIN design system
|-- components/
|   `-- RoomControl.tsx     # Room control UI (modes, sliders, save)
|-- providers/
|   `-- SolanaWalletProvider.tsx
`-- lib/
    |-- hash.ts             # Canonical stableStringify + SHA-256
    |-- pda.ts              # Guest PDA derivation from email
    |-- api.ts              # Backend API client (POST /api/v1/voice-command)
    |-- solana.ts           # Anchor program interactions
    `-- savePreferences.ts  # Steps A -> B -> C orchestrator
```

## Hash-Lock Workflow

The frontend implements a privacy-first 3-step flow:

1. **Step A** - Send raw command to backend API (staged in Redis)
2. **Step B** - Compute SHA-256 hash locally using canonical JSON serialization
3. **Step C** - Write only the 32-byte hash to Solana (`updatePreferences`)

The backend listener verifies on-chain hash against AI-generated payload hash before triggering IoT devices.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `` |
| `NEXT_PUBLIC_RPC_ENDPOINT` | Solana RPC endpoint | Devnet |

## IDL Setup

Copy the Anchor IDL to the public folder for runtime loading:

```bash
cp ../target/idl/orin_identity.json public/orin_identity.json
```

## Build

```bash
npm run build
```

## Deployment

Compatible with Vercel, Netlify, or any Node.js hosting. Set the root directory to `frontend/` in your deployment config.

## .env.local.example
# 1. Point to the Solana node on your local machine where the protocol was just successfully implemented (if left blank, the frontend will connect to Devnet by default).
NEXT_PUBLIC_RPC_ENDPOINT=http://127.0.0.1:8899

# 2. Point to the main API gateway (port 3001) that you just started running on your local machine.
NEXT_PUBLIC_API_URL=http://127.0.0.1:3001
NEXT_PUBLIC_API_KEY=orin_secret_key_2026_dev
