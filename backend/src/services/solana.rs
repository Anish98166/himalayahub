use serde_json::json;

const DEVNET_RPC: &str = "https://api.devnet.solana.com";

pub struct SolanaService;

impl SolanaService {
    pub async fn request_airdrop(address: &str, amount_sol: f64) -> Result<String, String> {
        let lamports = (amount_sol * 1_000_000_000.0) as u64;

        let body = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "requestAirdrop",
            "params": [address, lamports]
        });

        let client = reqwest::Client::new();
        let resp = client
            .post(DEVNET_RPC)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("RPC request failed: {}", e))?;

        let text = resp.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
        let json: serde_json::Value = serde_json::from_str(&text)
            .map_err(|e| format!("Invalid JSON response: {}", e))?;

        if let Some(tx) = json["result"].as_str() {
            Ok(tx.to_string())
        } else if let Some(err) = json["error"].as_object() {
            let msg = err["message"].as_str().unwrap_or("unknown error");
            Err(format!("Solana RPC error: {}", msg))
        } else {
            Err(format!("Unexpected response: {}", text))
        }
    }
}
