# API Reference

## Base URL
- Development: `http://localhost:3000`

## Endpoints

### Health
```
GET /health
→ "OK"
```

### Auth
```
POST /api/auth/register
Body: { email, password, full_name }
→ { token, user: { id, full_name, email, role } }

POST /api/auth/login
Body: { email, password }
→ { token, user: { id, full_name, email, role } }
```

### Dashboard
```
GET /api/dashboard
→ { user: { id, full_name, email, role }, wallets: [...] }
```

### Wallets
```
POST /api/wallets
Body: { chain: "stellar" | "solana" }
→ { id, userId, address, publicKey, chain, balance, createdAt, updatedAt }
```

### Remittance
```
POST /api/remittance
Body: { receiver_name, receiver_phone, amount, currency }
→ { id, senderId, receiverName, receiverPhone, amount, currency, fee, status, createdAt, updatedAt }
```
