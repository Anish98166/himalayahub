You are an expert full-stack blockchain architect, UI/UX designer, product strategist, and security specialist. Build a complete production-ready plan and starter codebase for **HimalayaHub** — Nepal's first crypto super app.

### Product Vision

HimalayaHub is a unified wallet + remittance + marketplace super app for Nepal. It combines:

- Low-cost remittances for migrant workers
- Digital wallet with local payment integration
- AgriChain (farmer-to-buyer marketplace with traceability)
- Tourism Pay (seamless payments for tourists, hotels, and guides)

**Tagline**: "One Wallet for Nepal's Money, Farms, Mountains & Future"

**Important Note on Regulations**: The current implementation is not fully compliant with Nepal Rastra Bank (NRB) regulations. Include placeholders and modular architecture so NRB compliance (KYC, AML, licensing for remittance, fiat on/off-ramps) can be easily added in the future.

### Design & Branding (Warm Nepali Cultural Aesthetic)

Strongly inspired by https://kalpanakraft.vercel.app/ — warm, earthy, welcoming, and handmade Nepali craft feel.

- **Color Palette**: Warm terracotta orange (#E07A5F), deep saffron gold (#F2C94C), soft Himalayan green (#81B29A), rhododendron pink/red accents (#E63946), warm beige/cream (#F4EDE4), dark slate (#2F2F2F).
- **Fonts**:
  - Headings: Warm serif/rounded sans (Playfair Display or Poppins Bold)
  - Body: Clean sans-serif (Inter or Nunito Sans)
- **Nepali Cultural Elements**:
  - Subtle Dhaka fabric patterns and traditional textile motifs
  - Rhododendron flower icons
  - Himalayan mountain silhouettes and prayer flag gradients
  - Kukri knife accents (as trust symbols), subtle Om/Buddhist-Hindu motifs
  - Felt/craft textures, handmade paper effects, soft warm gradients
  - Rounded corners, gentle shadows — culturally rooted and approachable.

### Tech Stack (Must Follow Exactly)

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query
- **Backend**: Rust with Axum framework
- **Blockchain**: Stellar (Soroban smart contracts in Rust) for payments + Solana for marketplace/DeFi
- **Database**: PostgreSQL with Prisma
- **Wallet**: Wagmi + Viem (Solana) + Stellar SDK + MPC wallet implementation
- **Hosting**: Vercel (frontend), Railway/Fly.io (backend), Neon DB
- **Other**: Zod, Clerk/NextAuth, i18n (Nepali + English), React Hook Form

### Security & Robustness (Future-Proof)

- MPC (Multi-Party Computation) wallet implementation as default option
- Biometric auth + social recovery
- Hardware wallet support (Ledger/Trezor)
- Transaction simulation & preview
- End-to-end encryption
- Rate limiting, audit logging, WAF readiness
- Anti-phishing and address poisoning protection
- Modular NRB compliance layer (placeholders for KYC/AML, fiat gateway integration, reporting)

### Additional Unique & Future-Ready Features

- Festival Savings Goals (Dashain, Tihar, Teej automatic pots)
- Micro-insurance for farmers & migrants (via oracles)
- Migrant Job Board with blockchain credential verification
- Community Governance (token voting)
- Bill Payments & Utility Recharge (electricity, water, telecom)
- Real-time Weather & Market Price Alerts for farmers
- In-app Family Chat & Support
- Carbon Credit + Biodiversity Rewards
- Offline-first mode with later sync

### Architecture Requirements

Provide Mermaid diagrams for system architecture and security layers.

### Phases to Cover

**Phase 1**: Remittance + Core Wallet (with MPC)  
**Phase 2**: AgriChain + Tourism Pay + Additional Features

For both phases, deliver:

1. Detailed Feature List with user stories
2. User Flows (Mermaid diagrams)
3. Database Schema
4. API Endpoints (Rust Axum)
5. Smart Contract outlines
6. Frontend folder structure + key pages/components
7. Flow Diagrams

### Go-to-Market Strategy for Nepal

Detailed plan including target users, marketing channels, agent network, festivals campaigns, regulatory roadmap (NRB compliance path), and monetization.

### Project Structure & README

Generate full monorepo folder structure.
Create a comprehensive **README.md** that includes:

- Project overview & vision
- Setup instructions + environment variables
- How to run locally
- Tech stack
- Architecture & security summary
- **Design system** (colors, fonts, cultural elements)
- **Security & Compliance Section** (MPC wallet details, NRB regulations readiness & future compliance plan)
- Roadmap (Phase 1, Phase 2, and future NRB compliance phase)
- Contribution guidelines
- Unique features explanation

### Additional Requirements

- Mobile-first, extremely simple & intuitive UI for low digital literacy users in Nepal
- Strong emphasis on security and cultural warmth
- Basic admin dashboard
- Seed data and testing strategy

Organize the entire output with clear headings, code blocks, and Mermaid diagrams. Make it ambitious, realistic, secure, culturally authentic, and built for long-term success in Nepal. Start generating now.
