use axum::{extract::State, Json, http::StatusCode};
use crate::middleware::auth::AuthenticatedUser;
use crate::models::{AppState, Remittance};
use crate::services::mpc::MpcSigner;
use uuid::Uuid;
use rust_decimal::Decimal;
use std::str::FromStr;


#[derive(serde::Deserialize)]
pub struct CreateRemittanceRequest {
    pub receiver_name: String,
    pub receiver_phone: String,
    pub amount: String,
    pub currency: String,
}

pub async fn create_remittance(
    auth: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateRemittanceRequest>,
) -> Result<Json<Remittance>, StatusCode> {
    let amount_dec = Decimal::from_str(&payload.amount).map_err(|_| StatusCode::BAD_REQUEST)?;
    let now = chrono::Utc::now().naive_utc();
    let remittance_id = Uuid::new_v4();
    let sender_id = Uuid::parse_str(&auth.user_id).unwrap_or_else(|_| Uuid::new_v4());

    sqlx::query(
        "INSERT INTO \"Remittance\" (id, \"senderId\", \"receiverName\", \"receiverPhone\", amount, currency, fee, status, \"updatedAt\") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::\"TransactionStatus\", $9)"
    )
    .bind(remittance_id)
    .bind(sender_id)
    .bind(&payload.receiver_name)
    .bind(&payload.receiver_phone)
    .bind(amount_dec)
    .bind(&payload.currency)
    .bind(Decimal::from(1))
    .bind("PENDING")
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Remittance DB Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    sqlx::query(
        "INSERT INTO \"Transaction\" (id, \"userId\", amount, currency, status, type, \"remittanceId\", \"updatedAt\") 
         VALUES ($1, $2, $3, $4, $5::\"TransactionStatus\", $6, $7, $8)"
    )
    .bind(Uuid::new_v4())
    .bind(sender_id)
    .bind(amount_dec)
    .bind(&payload.currency)
    .bind("PENDING")
    .bind("REMITTANCE")
    .bind(remittance_id)
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let wallet_id = Uuid::new_v4();
    match MpcSigner::sign_transaction(&state, &wallet_id.to_string(), "remittance_payload").await {
        Ok(tx_hash) => tracing::info!("MPC Signature generated: {}", tx_hash),
        Err(e) => tracing::error!("MPC Signing failed: {}", e),
    }

    Ok(Json(Remittance {
        id: remittance_id.to_string(),
        senderId: sender_id.to_string(),
        receiverName: payload.receiver_name,
        receiverPhone: payload.receiver_phone,
        amount: amount_dec,
        currency: payload.currency,
        fee: Decimal::from(1),
        status: "PENDING".to_string(),
        createdAt: now,
        updatedAt: now,
    }))
}
