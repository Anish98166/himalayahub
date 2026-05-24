# HimalayaHub Architecture

## System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js 15)"]
        WEB["Web App<br/>apps/web"]
        ADMIN["Admin Dashboard<br/>apps/admin"]
        UI["UI Components<br/>@himalayahub/ui"]
    end

    subgraph Backend["Backend (Rust Axum)"]
        API["API Server<br/>backend/src"]
        DB["Database Layer<br/>sqlx + PostgreSQL"]
        MPC["MPC Wallet Service<br/>backend/src/services/mpc.rs"]
    end

    subgraph Blockchain["Blockchain Layer"]
        STELLAR["Stellar / Soroban<br/>blockchain/stellar"]
        SOLANA["Solana<br/>blockchain/solana"]
    end

    subgraph Database["PostgreSQL + Prisma"]
        SCHEMA["Schema<br/>packages/database/schema.prisma"]
    end

    WEB --> API
    ADMIN --> API
    API --> DB
    API --> MPC
    MPC --> STELLAR
    MPC --> SOLANA
    DB --> SCHEMA
```

## Security Architecture (MPC Wallet)

```mermaid
graph LR
    subgraph User["User Device"]
        KS1["Key Share 1<br/>(user_device)"]
    end

    subgraph Cloud["HimalayaHub KMS"]
        KS2["Key Share 2<br/>(himalayahub_kms)"]
    end

    subgraph Signing["MPC Signing"]
        SIG["Threshold Signature<br/>(requires 2/2 shares)"]
    end

    KS1 --> SIG
    KS2 --> SIG
    SIG --> TX["Blockchain Transaction"]
```

## Data Flow: Remittance

```mermaid
sequenceDiagram
    participant U as User (Web App)
    participant A as API (Axum)
    participant D as PostgreSQL
    participant M as MPC Service
    participant B as Blockchain

    U->>A: POST /api/remittance
    A->>D: Insert Remittance + Transaction
    A->>M: sign_transaction()
    M->>D: Fetch KeyShares
    M->>M: MPC Sign (simulated)
    M-->>A: tx_hash
    A->>D: Update tx_hash
    A-->>U: Remittance created
```

## Database Schema Relationships

```mermaid
erDiagram
    User ||--o{ Wallet : has
    User ||--o{ Transaction : makes
    User ||--o{ Remittance : sends
    Wallet ||--o{ KeyShare : splits
    Wallet ||--o{ Transaction : involves
    Remittance ||--o{ Transaction : contains

    User {
        uuid id PK
        string email UK
        string fullName
        string passwordHash
        string phoneNumber UK
        enum role
        enum kycStatus
    }

    Wallet {
        uuid id PK
        uuid userId FK
        string address UK
        string publicKey
        string chain
        decimal balance
    }

    KeyShare {
        uuid id PK
        uuid walletId FK
        string shareData
        string participant
    }

    Transaction {
        uuid id PK
        uuid userId FK
        uuid walletId FK
        decimal amount
        string currency
        enum status
        string type
        string txHash UK
        json metadata
        uuid remittanceId FK
    }

    Remittance {
        uuid id PK
        uuid senderId FK
        string receiverName
        string receiverPhone
        decimal amount
        string currency
        decimal fee
        enum status
    }
```

## Folder Structure

```
himalayahub/
├── apps/
│   ├── web/          # Main user-facing Next.js app
│   └── admin/        # Admin dashboard
├── backend/          # Rust Axum API server
├── blockchain/
│   ├── stellar/      # Soroban smart contracts
│   └── solana/       # Solana programs
├── packages/
│   ├── database/     # Prisma schema
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configuration
└── docs/             # Documentation
```

## User Flow: Phase 1 (Remittance + Wallet)

```mermaid
flowchart LR
    A[Register] --> B[Create Wallet]
    B --> C{Stellar or Solana?}
    C -->|Stellar| D[Stellar MPC Wallet]
    C -->|Solana| E[Solana MPC Wallet]
    D --> F[Dashboard]
    E --> F
    F --> G[Send Remittance]
    G --> H[MPC Sign Transaction]
    H --> I[Blockchain Settlement]
```

## User Flow: Phase 2 (AgriChain + Tourism)

```mermaid
flowchart LR
    A[Dashboard] --> B[AgriChain]
    A --> C[Tourism Pay]
    B --> D[Browse Products]
    B --> E[My Listings]
    B --> F[Add Product]
    C --> G[Browse Services]
    C --> H[My Bookings]
    C --> I[Book Now]
```
