mod auth;
pub use auth::{AuthResponse, Claims, LoginRequest, RegisterRequest};

use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub full_name: String,
    pub email: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletResponse {
    pub address: String,
    pub balance: f64,
    pub currency: String,
    pub chain: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardData {
    pub user: UserResponse,
    pub wallets: Vec<WalletResponse>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct Wallet {
    pub id: String,
    pub userId: String,
    pub address: String,
    pub publicKey: String,
    pub chain: String,
    pub balance: Decimal,
    pub createdAt: NaiveDateTime,
    pub updatedAt: NaiveDateTime,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct KeyShare {
    pub id: String,
    pub walletId: String,
    pub shareData: String,
    pub participant: String,
    pub createdAt: NaiveDateTime,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub userId: String,
    pub walletId: Option<String>,
    pub amount: Decimal,
    pub currency: String,
    pub status: String,
    pub r#type: String,
    pub txHash: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub createdAt: NaiveDateTime,
    pub updatedAt: NaiveDateTime,
    pub remittanceId: Option<String>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct Remittance {
    pub id: String,
    pub senderId: String,
    pub receiverName: String,
    pub receiverPhone: String,
    pub amount: Decimal,
    pub currency: String,
    pub fee: Decimal,
    pub status: String,
    pub createdAt: NaiveDateTime,
    pub updatedAt: NaiveDateTime,
}
