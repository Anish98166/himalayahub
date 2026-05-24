use axum::{extract::State, Json, http::StatusCode};
use crate::models::{AppState, Wallet};
use crate::services::wallet::WalletService;
use crate::middleware::auth::AuthenticatedUser;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateWalletRequest {
    pub chain: String,
}

pub async fn create_wallet(
    auth: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateWalletRequest>,
) -> Result<Json<Wallet>, StatusCode> {
    let wallet = WalletService::create_mpc_wallet(&state, &auth.user_id, &payload.chain)
        .await
        .map_err(|e| {
            tracing::error!("Wallet creation error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(wallet))
}
