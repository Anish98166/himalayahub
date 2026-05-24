export const config = {
  app: {
    name: "HimalayaHub",
    tagline: "One Wallet for Nepal's Money, Farms, Mountains & Future",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },
  blockchain: {
    stellar: {
      network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet",
    },
    solana: {
      network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
    },
  },
  features: {
    remittance: true,
    agrichain: true,
    tourismPay: true,
    festivalSavings: false,
    jobBoard: false,
  },
  currency: {
    default: "USD",
    supported: ["USD", "NPR", "XLM", "SOL"],
  },
} as const;

export const BRAND = {
  colors: {
    terracotta: "#E07A5F",
    saffron: "#F2C94C",
    himalayanGreen: "#81B29A",
    rhododendron: "#E63946",
    warmBeige: "#F4EDE4",
    darkSlate: "#2F2F2F",
  },
  fonts: {
    heading: "Playfair Display",
    body: "Inter",
  },
} as const;
