#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, Address, Symbol, symbol_short};

#[contract]
pub struct HimalayaRemittance;

#[contractimpl]
impl HimalayaRemittance {
    pub fn init(env: Env, admin: Address) {
        env.storage().persistent().set(&symbol_short!("admin"), &admin);
    }

    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
        memo: String,
    ) {
        from.require_auth();
        env.storage().persistent().set(&symbol_short!("tx"), &amount);
    }

    pub fn get_balance(env: Env, addr: Address) -> i128 {
        0
    }
}
