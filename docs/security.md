# Security & Compliance

## MPC Wallet Architecture

HimalayaHub uses a 2-of-2 Threshold Signature Scheme (TSS):

- **Share 1** (`user_device`): Stored on the user's mobile device
- **Share 2** (`himalayahub_kms`): Stored in HimalayaHub's Key Management Service

The private key is NEVER reconstructed in memory. Each party generates a partial signature that is combined into a full valid signature.

## NRB Compliance Readiness

### Current Status
The current implementation is a development prototype. The following placeholders exist for future NRB compliance:

| Requirement | Status | Module |
|------------|--------|--------|
| KYC/AML Verification | Placeholder (kycStatus enum) | User model |
| Data Localization | Not implemented | - |
| Remittance Licensing | Not implemented | - |
| Fiat On/Off Ramp | Not implemented | - |
| Transaction Reporting | Not implemented | - |
| Audit Logging | Not implemented | middleware/ |

### Future Implementation Plan

1. **KYC/AML Module**: Integrate with Nepal-based KYC providers (eGov, etc.)
2. **Transaction Limits**: Per-user and per-day limits compliant with NRB guidelines
3. **Reporting**: Automated transaction reporting to NRB
4. **Fiat Gateway**: Partner with Nepal-based banks for NPR on/off-ramps
5. **Data Sovereignty**: All user data stored in Nepal-based servers

## Security Features

- Password hashing with Argon2
- JWT-based authentication
- MPC wallet (private key never exposed)
- Rate limiting (planned)
- Anti-phishing protection (planned)
- Transaction simulation (planned)
