use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::middleware::auth::AuthenticatedUser;
use crate::models::AppState;

#[derive(Deserialize)]
pub struct ApprovePaymentRequest {
    pub payment_id: String,
}

#[derive(Deserialize)]
pub struct CompletePaymentRequest {
    pub payment_id: String,
    pub txid: String,
}

#[derive(Serialize)]
pub struct PiPaymentResponse {
    pub success: bool,
    pub message: String,
    pub tx_id: Option<String>,
}

const PI_API_BASE: &str = "https://api.minepi.com/v2";

fn is_sandbox() -> bool {
    let key = std::env::var("PI_API_KEY").unwrap_or_default();
    key.is_empty() || key == "sandbox_api_key"
}

fn get_api_key() -> String {
    std::env::var("PI_API_KEY").unwrap_or_else(|_| "sandbox_api_key".to_string())
}

async fn call_pi_api(
    payment_id: &str,
    action: &str,
    txid: Option<&str>,
) -> Result<(), String> {
    if is_sandbox() {
        return Ok(());
    }

    let api_key = get_api_key();
    let url = format!("{}/payments/{}/{}", PI_API_BASE, payment_id, action);

    let client = reqwest::Client::new();
    let mut req = client
        .post(&url)
        .header("Authorization", format!("Key {}", api_key));

    if let Some(tx) = txid {
        req = req.json(&serde_json::json!({"txid": tx}));
    }

    match req.send().await {
        Ok(r) if r.status().is_success() => Ok(()),
        Ok(r) => Err(format!("Pi API returned {}", r.status())),
        Err(e) => Err(format!("Pi API error: {}", e)),
    }
}

pub async fn approve_payment(
    auth: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<ApprovePaymentRequest>,
) -> Result<Json<PiPaymentResponse>, StatusCode> {
    if let Err(msg) = call_pi_api(&payload.payment_id, "approve", None).await {
        return Ok(Json(PiPaymentResponse {
            success: false,
            message: msg,
            tx_id: None,
        }));
    }

    let now = chrono::Utc::now().naive_utc();
    let tx_id = Uuid::new_v4();

    sqlx::query(
        r#"INSERT INTO "Transaction" (id, "userId", amount, currency, status, type, metadata, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5::"TransactionStatus", $6, $7, $8, $9)"#,
    )
    .bind(Uuid::new_v4())
    .bind(Uuid::parse_str(&auth.user_id).unwrap_or_else(|_| Uuid::new_v4()))
    .bind(rust_decimal::Decimal::ZERO)
    .bind("PI")
    .bind("PENDING")
    .bind("PI_PAYMENT")
    .bind(serde_json::json!({"piPaymentId": payload.payment_id}))
    .bind(now)
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Pi approve DB Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(PiPaymentResponse {
        success: true,
        message: "Payment approved by server".to_string(),
        tx_id: Some(tx_id.to_string()),
    }))
}

pub async fn complete_payment(
    auth: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<CompletePaymentRequest>,
) -> Result<Json<PiPaymentResponse>, StatusCode> {
    if let Err(msg) = call_pi_api(&payload.payment_id, "complete", Some(&payload.txid)).await {
        return Ok(Json(PiPaymentResponse {
            success: false,
            message: msg,
            tx_id: None,
        }));
    }

    let now = chrono::Utc::now().naive_utc();
    sqlx::query(
        r#"UPDATE "Transaction" SET status = 'COMPLETED'::"TransactionStatus", "txHash" = $1, "updatedAt" = $2
           WHERE metadata->>'piPaymentId' = $3"#,
    )
    .bind(&payload.txid)
    .bind(now)
    .bind(&payload.payment_id)
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Pi complete DB Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(PiPaymentResponse {
        success: true,
        message: "Payment completed successfully".to_string(),
        tx_id: Some(payload.txid),
    }))
}
