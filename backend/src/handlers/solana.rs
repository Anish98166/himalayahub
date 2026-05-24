use axum::{Json, http::StatusCode};
use serde::Deserialize;
use crate::services::solana::SolanaService;

#[derive(Deserialize)]
pub struct FaucetRequest {
    pub address: String,
    pub amount: Option<f64>,
}

#[derive(serde::Serialize)]
pub struct FaucetResponse {
    pub success: bool,
    pub signature: Option<String>,
    pub message: String,
}

pub async fn faucet(
    Json(payload): Json<FaucetRequest>,
) -> Json<FaucetResponse> {
    let amount = payload.amount.unwrap_or(1.0);

    if amount > 5.0 {
        return Json(FaucetResponse {
            success: false,
            signature: None,
            message: "Max airdrop is 5 SOL per request".to_string(),
        });
    }

    match SolanaService::request_airdrop(&payload.address, amount).await {
        Ok(sig) => {
            let sig_clone = sig.clone();
            Json(FaucetResponse {
                success: true,
                signature: Some(sig),
                message: format!("Successfully airdropped {} SOL! Transaction: {}", amount, &sig_clone[..std::cmp::min(sig_clone.len(), 20)]),
            })
        },
        Err(e) => Json(FaucetResponse {
            success: false,
            signature: None,
            message: e,
        }),
    }
}


