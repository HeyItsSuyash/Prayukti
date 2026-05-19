use rand::Rng;

pub fn generate_otp() -> String {
    let mut rng = rand::thread_rng();
    let code: u32 = rng.gen_range(100000..=999999);
    code.to_string()
}
