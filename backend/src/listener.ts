import { Connection, PublicKey } from '@solana/web3.js';
import * as admin from 'firebase-admin';
import { adjustRoomEnvironment } from './mqtt_mock';
import './firebase_config'; // Initialize Firebase Admin
import * as fs from 'fs';
import * as path from 'path';
import { BorshCoder, Idl } from '@coral-xyz/anchor';
import * as http from 'http';
import { createHash } from 'crypto';

// NOTE: Replace with your deployed Program ID
const PROGRAM_ID = new PublicKey("FqtrHgdYTph1DSP9jDYD7xrKPrjSjCTtnw6fyKMmboYk");
const NETWORK = process.env.NETWORK || 'Localnet';
const RPC_ENDPOINT = NETWORK === 'Localnet' ? 'http://127.0.0.1:8899' : 'https://api.devnet.solana.com';
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

const IDL_PATH = path.resolve(__dirname, "../../target/idl/orin_identity.json");
const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf8")) as Idl;
const coder = new BorshCoder(idl);

// ---------------------------------------------------------
// 🚀 OFF-CHAIN PAYLOAD CACHE (The Web2.5 Hybrid Model)
// Holds incoming sensitive JSON string until Solana anchor verifies it
// ---------------------------------------------------------
const offChainPayloadCache = new Map<string, any>();

const httpServer = http.createServer((req, res) => {
    // Only accept POST requests on /api/preferences
    if (req.method === 'POST' && req.url === '/api/preferences') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                // Must ensure exact string trim matching during SHA256 processing to avoid mismatched hashes
                const sanitizedBody = body.trim();
                const hashBuffer = createHash("sha256").update(sanitizedBody).digest(); 
                const hashHex = hashBuffer.toString('hex');

                console.log(`[HTTP Server] 📦 Received Off-Chain JSON Payload.`);
                console.log(`[HTTP Server] 🔐 Computed SHA256: ${hashHex}`);

                offChainPayloadCache.set(hashHex, JSON.parse(sanitizedBody));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", info: "Payload staged in Node.js. Awaiting Solana Hash Verification signal.", hash: hashHex }));
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid Payload or Hash mechanism." }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

httpServer.listen(3001, () => {
    console.log(`\n[ORIN-Backend] 🌐 HTTP Payload Server listening for Web2 JSON on port 3001`);
});

// ---------------------------------------------------------
// 🚀 ON-CHAIN VERIFICATION LISTENER
// ---------------------------------------------------------
export function startSolanaListener() {
    console.log(`[ORIN-Backend] 🚀 Starting Solana listener on ${RPC_ENDPOINT}`);
    console.log(`[ORIN-Backend] 📡 Watching Program ID: ${PROGRAM_ID.toBase58()}\n`);

    connection.onProgramAccountChange(
        PROGRAM_ID,
        async (updatedAccountInfo, context) => {
            console.log("\n---------------------------------------------------------");
            console.log(`[ORIN-Backend] 🔔 On-chain Verification Hash Recorded at slot ${context.slot}!`);
            const pubkey = updatedAccountInfo.accountId.toBase58();
            
            let onChainHashHex = "";
            try {
                const decoded = coder.accounts.decode("GuestIdentity", updatedAccountInfo.accountInfo.data);
                // Extract the 32-byte preferencesHash stored on-chain
                if (decoded.preferencesHash) {
                    onChainHashHex = Buffer.from(decoded.preferencesHash).toString('hex');
                }
            } catch (err) {
                console.error("[ORIN-Backend] ❌ Failed to decode GuestIdentity:", err);
                return;
            }
            
            console.log(`[ORIN-Backend] 👤 Guest PDA: ${pubkey}`);

            // Skip initialization events (hash is zeroes)
            if (onChainHashHex === "0000000000000000000000000000000000000000000000000000000000000000") {
                console.log(`[ORIN-Backend] 🌱 Initialized account detected. Skipping environment sync.`);
                console.log("---------------------------------------------------------");
                return;
            }

            console.log(`[ORIN-Backend] 📜 On-Chain Hash: ${onChainHashHex}`);

            const verifiedPayload = offChainPayloadCache.get(onChainHashHex);

            if (!verifiedPayload) {
                console.warn(`[ORIN-Backend] ⚠️ Hash mismatch or Private Payload missing! Cannot execute changes.`);
                console.log("---------------------------------------------------------");
                return;
            }

            console.log(`[ORIN-Backend] 🔐 HASH VERIFIED SUCCESSFULLY! Data is Authored & Untampered.`);
            console.log(`[ORIN-Backend] ✨ Authorized Payload:`, verifiedPayload);

            try {
                if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                    const dbRef = admin.database().ref(`/rooms/guest_${pubkey}`);
                    await dbRef.update({
                        has_arrived: true,
                        preferences: verifiedPayload,
                        last_updated: Date.now()
                    });
                    console.log(`[Firebase Sync] ✅ Triggered Real-time DB update for Frontend.`);
                } else {
                    console.log(`[Firebase Sync Mock] ⚠️ Bypassing real Firebase hit (No GCP credentials).`);
                    console.log(`[Firebase Sync Mock] ✅ Simulated DB Update.`);
                }

                adjustRoomEnvironment(pubkey, verifiedPayload);
                // Optionally garbage collect the memory cache here
                offChainPayloadCache.delete(onChainHashHex);

            } catch (error) {
                console.error("[ORIN-Backend] ❌ Failed to execute system integration:", error);
            }
            console.log("---------------------------------------------------------");
        },
        'confirmed'
    );
}

if (require.main === module) {
    startSolanaListener();
}
