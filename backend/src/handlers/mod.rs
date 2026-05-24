pub mod auth;
pub mod pi;
pub mod remittance;
pub mod solana;
pub mod wallet;

use axum::{extract::State, Json, http::StatusCode};
use crate::middleware::auth::AuthenticatedUser;
use crate::models::{AppState, UserResponse, WalletResponse, DashboardData};
use sqlx::Row;

pub async fn health_check() -> &'static str {
    "OK"
}

pub async fn get_dashboard(
    auth: AuthenticatedUser,
    State(state): State<AppState>,
) -> Result<Json<DashboardData>, StatusCode> {
    let user_row = sqlx::query(
        "SELECT id, \"fullName\", email, role::TEXT FROM \"User\" WHERE id = $1"
    )
    .bind(&auth.user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    let user = UserResponse {
        id: user_row.get("id"),
        full_name: user_row.get("fullName"),
        email: user_row.get("email"),
        role: user_row.get("role"),
    };

    let wallet_rows = sqlx::query(
        "SELECT address, balance, chain FROM \"Wallet\" WHERE \"userId\" = $1"
    )
    .bind(&auth.user_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let wallets: Vec<WalletResponse> = wallet_rows
        .iter()
        .map(|row| {
            let balance: rust_decimal::Decimal = row.get("balance");
            WalletResponse {
                address: row.get("address"),
                balance: balance.to_string().parse().unwrap_or(0.0),
                currency: "USD".to_string(),
                chain: row.get("chain"),
            }
        })
        .collect();

    Ok(Json(DashboardData { user, wallets }))
}
