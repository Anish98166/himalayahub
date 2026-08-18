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

#[derive(Debug, Serialize, Deserialize)]
pub struct PiPaymentInfo {
    pub identifier: String,
    pub amount: f64,
    pub status: serde_json::Value,
}

const PI_API_BASE: &str = "https://api.minepi.com/v2";

fn get_pi_api_key() -> Result<String, StatusCode> {
    std::env::var("PI_NETWORK_API_KEY")
        .map_err(|_| {
            tracing::error!("PI_NETWORK_API_KEY env var not set");
            StatusCode::INTERNAL_SERVER_ERROR
        })
}

fn pi_api_key_or_sandbox() -> String {
    std::env::var("PI_NETWORK_API_KEY").unwrap_or_else(|_| "sandbox_api_key".to_string())
}

async fn call_pi_api(
    payment_id: &str,
    action: &str,
    txid: Option<&str>,
) -> Result<(), String> {
    let api_key = pi_api_key_or_sandbox();
    if api_key.is_empty() || api_key == "sandbox_api_key" {
        tracing::warn!("Pi sandbox mode — skipping external API call for {}", payment_id);
        return Ok(());
    }

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
        Ok(r) => {
            let body = r.text().await.unwrap_or_default();
            Err(format!("Pi API returned {}: {}", action, body))
        }
        Err(e) => Err(format!("Pi API error on {}: {}", action, e)),
    }
}

async fn fetch_payment_info(payment_id: &str) -> Result<PiPaymentInfo, String> {
    let api_key = pi_api_key_or_sandbox();
    if api_key.is_empty() || api_key == "sandbox_api_key" {
        return Ok(PiPaymentInfo {
            identifier: payment_id.to_string(),
            amount: 0.0,
            status: serde_json::json!("UNKNOWN"),
        });
    }

    let url = format!("{}/payments/{}", PI_API_BASE, payment_id);
    let client = reqwest::Client::new();
    let resp = client
        .get(&url)
        .header("Authorization", format!("Key {}", api_key))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch payment info: {}", e))?;

    resp.json::<PiPaymentInfo>()
        .await
        .map_err(|e| format!("Failed to parse payment info: {}", e))
}

pub async fn approve_payment(
    auth: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<ApprovePaymentRequest>,
) -> Result<Json<PiPaymentResponse>, StatusCode> {
    let payment_info = fetch_payment_info(&payload.payment_id)
        .await
        .map_err(|e| {
            tracing::error!("Failed to get payment info: {:?}", e);
            StatusCode::BAD_GATEWAY
        })?;

    tracing::info!(
        "Approving Pi payment {} — amount: {}, user: {}",
        payload.payment_id,
        payment_info.amount,
        auth.user_id
    );

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
    .bind(rust_decimal::Decimal::try_from(payment_info.amount).unwrap_or(rust_decimal::Decimal::ZERO))
    .bind("PI")
    .bind("PENDING")
    .bind("PI_PAYMENT")
    .bind(serde_json::json!({
        "piPaymentId": payload.payment_id,
        "amount": payment_info.amount,
    }))
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

pub async fn recover_incomplete_payment(
    State(state): State<AppState>,
    Json(payload): Json<ApprovePaymentRequest>,
) -> Result<Json<PiPaymentResponse>, StatusCode> {
    let payment_info = fetch_payment_info(&payload.payment_id)
        .await
        .map_err(|e| {
            tracing::error!("Failed to get incomplete payment info: {:?}", e);
            StatusCode::BAD_GATEWAY
        })?;

    tracing::info!(
        "Recovering incomplete Pi payment {} — status: {:?}",
        payload.payment_id,
        payment_info.status
    );

    let status_str = payment_info.status.get("name")
        .and_then(|v| v.as_str())
        .unwrap_or("UNKNOWN");

    if status_str == "COMPLETED" || status_str == "PAID" {
        if let Err(msg) = call_pi_api(&payload.payment_id, "complete", None).await {
            return Ok(Json(PiPaymentResponse {
                success: false,
                message: format!("Recovery complete failed: {}", msg),
                tx_id: None,
            }));
        }
    } else {
        if let Err(msg) = call_pi_api(&payload.payment_id, "approve", None).await {
            return Ok(Json(PiPaymentResponse {
                success: false,
                message: format!("Recovery approve failed: {}", msg),
                tx_id: None,
            }));
        }
        if let Err(msg) = call_pi_api(&payload.payment_id, "complete", None).await {
            return Ok(Json(PiPaymentResponse {
                success: false,
                message: format!("Recovery complete failed: {}", msg),
                tx_id: None,
            }));
        }
    }

    Ok(Json(PiPaymentResponse {
        success: true,
        message: "Incomplete payment recovered".to_string(),
        tx_id: Some(payload.payment_id),
    }))
}
