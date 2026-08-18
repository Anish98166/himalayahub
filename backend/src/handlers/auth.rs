use axum::{extract::State, Json, http::StatusCode};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{encode, Header, EncodingKey};
use crate::models::{AppState, AuthResponse, RegisterRequest, LoginRequest, PiAuthRequest, Claims, UserResponse};
use sqlx::Row;
use uuid::Uuid;

fn get_jwt_secret() -> String {
    std::env::var("JWT_SECRET").unwrap_or_else(|_| "himalayahub_dev_secret_change_in_prod".to_string())
}

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let existing = sqlx::query("SELECT id FROM \"User\" WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if existing.is_some() {
        return Err(StatusCode::CONFLICT);
    }

    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .to_string();

    let user_id = Uuid::new_v4();
    let now = chrono::Utc::now().naive_utc();

    sqlx::query(
        "INSERT INTO \"User\" (id, email, \"fullName\", \"passwordHash\", role, \"updatedAt\") 
         VALUES ($1, $2, $3, $4, $5::\"UserRole\", $6)"
    )
    .bind(user_id.to_string())
    .bind(&payload.email)
    .bind(&payload.full_name)
    .bind(&hash)
    .bind("USER")
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Register DB Error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let secret = get_jwt_secret();
    let token = encode(
        &Header::default(),
        &Claims { sub: user_id.to_string(), exp: 10000000000 },
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id: user_id.to_string(),
            full_name: payload.full_name,
            email: payload.email,
            role: "USER".to_string(),
        },
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let row = sqlx::query(
        "SELECT id, \"fullName\", email, \"passwordHash\", role::TEXT FROM \"User\" WHERE email = $1"
    )
    .bind(&payload.email)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::UNAUTHORIZED)?;

    let user_id: String = row.get("id");
    let full_name: String = row.get("fullName");
    let email: String = row.get("email");
    let hashed: String = row.get("passwordHash");
    let role: String = row.get("role");

    let parsed = argon2::PasswordHash::new(&hashed)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let secret = get_jwt_secret();
    let token = encode(
        &Header::default(),
        &Claims { sub: user_id.clone(), exp: 10000000000 },
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id: user_id,
            full_name,
            email,
            role,
        },
    }))
}

pub async fn pi_auth(
    State(state): State<AppState>,
    Json(payload): Json<PiAuthRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let client = reqwest::Client::new();
    let pi_user = client
        .get("https://api.minepi.com/v2/me")
        .header("Authorization", format!("Bearer {}", payload.access_token))
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?
        .json::<serde_json::Value>()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    let pi_uid = pi_user["uid"]
        .as_str()
        .ok_or(StatusCode::UNAUTHORIZED)?
        .to_string();
    let pi_username = pi_user["username"]
        .as_str()
        .unwrap_or("pi_user")
        .to_string();

    let email = format!("{}@pi.network", pi_uid);

    let existing = sqlx::query("SELECT id, \"fullName\", email, role::TEXT FROM \"User\" WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let (user_id, full_name, role) = if let Some(row) = existing {
        let id: String = row.get("id");
        let name: String = row.get("fullName");
        let role: String = row.get("role");
        (id, name, role)
    } else {
        let user_id = Uuid::new_v4();
        let now = chrono::Utc::now().naive_utc();
        let display_name = format!("Pi User: {}", pi_username);

        sqlx::query(
            "INSERT INTO \"User\" (id, email, \"fullName\", \"passwordHash\", role, \"updatedAt\")
             VALUES ($1, $2, $3, $4, $5::\"UserRole\", $6)",
        )
        .bind(user_id.to_string())
        .bind(&email)
        .bind(&display_name)
        .bind("")
        .bind("USER")
        .bind(now)
        .execute(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Pi auth DB Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        (user_id.to_string(), display_name, "USER".to_string())
    };

    let secret = get_jwt_secret();
    let token = encode(
        &Header::default(),
        &Claims { sub: user_id.clone(), exp: 10000000000 },
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id: user_id,
            full_name,
            email,
            role,
        },
    }))
}
