# 🏔️ HimalayaHub — Nepal's Crypto Super App

**One Wallet for Nepal's Money, Farms, Mountains & Future**

HimalayaHub is a unified wallet + remittance + marketplace super app for Nepal. It combines low-cost remittances for migrant workers, a digital wallet with MPC security, AgriChain (farmer-to-buyer marketplace with traceability), and Tourism Pay (seamless payments for tourists, hotels, and guides).

## Tech Stack

| Layer          | Technology                                                                          |
| -------------- | ----------------------------------------------------------------------------------- |
| **Frontend**   | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + TanStack Query |
| **Backend**    | Rust with Axum framework + sqlx                                                     |
| **Blockchain** | Stellar (Soroban smart contracts) + Solana                                          |
| **Database**   | PostgreSQL with Prisma ORM                                                          |
| **Wallet**     | MPC (Multi-Party Computation) wallet implementation                                 |
| **Auth**       | Argon2 password hashing + JWT                                                       |
| **i18n**       | i18next (Nepali + English)                                                          |
| **Hosting**    | Vercel (frontend), Railway/Fly.io (backend), Neon DB                                |

## Setup

### Prerequisites

- Node.js 20+ and pnpm
- Rust toolchain (rustup)
- PostgreSQL running locally

### Environment Variables

Copy `.env.example` to `.env` in `backend/`:

```bash
cp backend/.env.example backend/.env
cp packages/database/.env.example packages/database/.env
```

**Required variables:**

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `RUST_LOG` — Log level (default: `info`)

**Pi Network (optional, sandbox by default):**

- `PI_API_KEY` — Get from [Pi Developer Portal](https://pi-apps.github.io/pi-sdk-docs/platform/DeveloperPortal) (`pi://develop.pinet.com` in Pi Browser). Leave unset or `sandbox_api_key` for sandbox mode.

### Database Setup

```bash
# Create database
createdb himalayahub

# Push Prisma schema
pnpm --filter @himalayahub/database exec prisma db push --schema=./schema.prisma
```

### Run the Backend

```bash
cd backend
cargo run
# API available at http://localhost:3000
```

### Run the Frontend

```bash
# Install all dependencies
pnpm install

# Start web app
pnpm --filter web dev
# Available at http://localhost:3001
```

## Project Structure

```
himalayahub/
├── apps/
│   ├── web/              # Main Next.js app (remittance, wallet, agrichain, tourism, pi-wallet, solana)
│   └── admin/            # Admin dashboard
├── backend/              # Rust Axum API server
│   └── src/
│       ├── main.rs       # Server entrypoint + routes
│       ├── handlers/     # Request handlers (auth, wallet, remittance)
│       ├── models/       # Data structures + AppState
│       └── services/     # Business logic (MPC signing, wallet creation)
├── blockchain/
│   ├── stellar/          # Soroban smart contracts
│   └── solana/           # Solana programs
├── packages/
│   ├── database/         # Prisma schema + client
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared configuration
│   └── ui/               # Shared UI components
└── docs/                 # Architecture docs + diagrams
```

## API Endpoints

| Method | Path                 | Description                       |
| ------ | -------------------- | --------------------------------- |
| GET    | `/health`            | Health check                      |
| POST   | `/api/auth/register` | Register new user                 |
| POST   | `/api/auth/login`    | Login user                        |
| GET    | `/api/dashboard`     | Get user dashboard                |
| POST   | `/api/wallets`       | Create MPC wallet                 |
| POST   | `/api/remittance`    | Create remittance                 |
| POST   | `/api/solana/faucet` | Request SOL airdrop (devnet)      |
| POST   | `/api/pi/approve`    | Approve Pi payment (server-side)  |
| POST   | `/api/pi/complete`   | Complete Pi payment (server-side) |

## Design System

### Colors

- **Terracotta** `#E07A5F` — Primary brand color
- **Saffron Gold** `#F2C94C` — Accent
- **Himalayan Green** `#81B29A` — AgriChain / success
- **Rhododendron** `#E63946` — Tourism Pay / alerts
- **Warm Beige** `#F4EDE4` — Background
- **Dark Slate** `#2F2F2F` — Text

### Fonts

- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Cultural Elements

Warm, earthy Nepali aesthetic inspired by traditional crafts. Rounded corners, gentle shadows, and a welcoming color palette.

## Security

### MPC Wallet

HimalayaHub uses a 2-of-2 Threshold Signature Scheme (TSS):

- **Share 1**: Stored on the user's mobile device
- **Share 2**: Stored in HimalayaHub's KMS
- The private key is NEVER reconstructed in memory
- Each signing requires both partial signatures

### Authentication

- Argon2 password hashing
- JWT tokens for session management
- JWT secret from environment variable

## NRB Compliance

The current implementation is a **development prototype** and not fully compliant with Nepal Rastra Bank (NRB) regulations. The architecture is modular with placeholders for:

- **KYC/AML**: `kycStatus` field on User model (UNVERIFIED → PENDING → VERIFIED → REJECTED)
- **Transaction limits**: To be added in middleware
- **Fiat on/off-ramp**: Placeholder for bank integration
- **Reporting**: Audit log placeholder

A dedicated compliance phase will add:

1. KYC provider integration (eGov Nepal, etc.)
2. Transaction monitoring and reporting
3. Remittance licensing module
4. Data localization (Nepal-based servers)
5. NRB-mandated transaction limits

## Pi Network Integration

HimalayaHub integrates with the [Pi Network SDK](https://pi-apps.github.io/pi-sdk-docs/) for Pi coin payments.

### How it works

1. **Frontend**: Pi SDK (`pi-sdk.js`) is loaded via `<script>` tag in the layout. The `/pi-wallet` page handles auth + payments.
2. **Backend**: Rust Axum endpoints call the [Pi Platform API](https://api.minepi.com/v2) for server-side payment approval and completion (the "double-check" flow).
3. **Sandbox Mode**: When `PI_API_KEY` is unset or `"sandbox_api_key"`, the backend skips Pi API calls — perfect for local development.

### Getting a PI_API_KEY

1. Open the **Pi Browser** and go to `pi://develop.pinet.com`
2. Register your app (select **Testnet** for development)
3. Find your API key in the app details
4. Set it in `backend/.env`: `PI_API_KEY=your_key_here`

### Pi Wallet Page

- **Connect**: Sign in with Pi Network (scopes: `username`, `payments`)
- **Send**: Create Pi payments with custom amount + memo
- **Receive**: Share your Pi username or UID

### Endpoints

| Method | Path               | Description                    |
| ------ | ------------------ | ------------------------------ |
| POST   | `/api/pi/approve`  | Server-side payment approval   |
| POST   | `/api/pi/complete` | Server-side payment completion |

## Roadmap

### Phase 1 ✅ — Remittance + Core Wallet

- [x] User registration & login
- [x] MPC wallet creation (Stellar + Solana)
- [x] Send remittance with MPC signing
- [x] Dashboard with wallet overview
- [x] i18n (Nepali + English)

### Phase 2 ✅ — AgriChain + Tourism Pay

- [x] AgriChain marketplace (browse + product listings)
- [x] Tourism Pay (hotels, guides, treks, transport)
- [x] Admin dashboard (user management, remittance overview)
- [x] Architecture documentation

### Phase 3 — Future

- [ ] Festival Savings Goals (Dashain, Tihar, Teej)
- [ ] Micro-insurance for farmers & migrants
- [ ] Migrant Job Board with blockchain credentials
- [ ] Bill Payments & Utility Recharge
- [ ] Real-time Weather & Market Price Alerts
- [ ] In-app Family Chat & Support
- [ ] Carbon Credit + Biodiversity Rewards
- [ ] Offline-first mode
- [ ] NRB compliance (KYC/AML, fiat gateway, licensing)

### Pi Network

- [x] Pi SDK integration (connect, send, receive)
- [x] Server-side payment approval & completion
- [x] Sandbox mode for local development
- [ ] Pi Testnet deployment
- [ ] Pi Mainnet deployment

## License

MIT
