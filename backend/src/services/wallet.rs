use uuid::Uuid;
use crate::models::{AppState, Wallet};
use rust_decimal::Decimal;

pub struct WalletService;

impl WalletService {
    pub async fn create_mpc_wallet(
        state: &AppState,
        user_id: &str,
        chain: &str,
    ) -> Result<Wallet, String> {
        let simulated_pub_key = format!("{}_{}", chain, Uuid::new_v4());

        let wallet_id = Uuid::new_v4();
        let now = chrono::Utc::now().naive_utc();

        let wallet = Wallet {
            id: wallet_id.to_string(),
            userId: user_id.to_string(),
            address: format!("{}_addr_{}", chain, Uuid::new_v4()),
            publicKey: simulated_pub_key.clone(),
            chain: chain.to_string(),
            balance: Decimal::from(0),
            createdAt: now,
            updatedAt: now,
        };

        sqlx::query(
            "INSERT INTO \"Wallet\" (id, \"userId\", address, \"publicKey\", chain, balance, \"createdAt\", \"updatedAt\") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
        )
        .bind(&wallet.id)
        .bind(&wallet.userId)
        .bind(&wallet.address)
        .bind(&wallet.publicKey)
        .bind(&wallet.chain)
        .bind(wallet.balance)
        .bind(wallet.createdAt)
        .bind(wallet.updatedAt)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to create wallet in DB: {}", e))?;

        let shares = vec![
            (format!("encrypted_share_part_1_{}", simulated_pub_key), "user_device"),
            (format!("encrypted_share_part_2_{}", simulated_pub_key), "himalayahub_kms"),
        ];

        for (share_data, participant) in shares {
            sqlx::query(
                "INSERT INTO \"KeyShare\" (id, \"walletId\", \"shareData\", participant, \"createdAt\") 
                 VALUES ($1, $2, $3, $4, $5)"
            )
            .bind(Uuid::new_v4())
            .bind(wallet_id)
            .bind(&share_data)
            .bind(participant)
            .bind(now)
            .execute(&state.db)
            .await
            .map_err(|e| format!("Failed to store key share: {}", e))?;
        }

        tracing::info!("MPC Wallet created successfully for user: {}", user_id);
        Ok(wallet)
    }
}
