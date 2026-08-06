use regex::Regex;
use std::sync::OnceLock;

static PROMPT_INJECTION_PATTERNS: OnceLock<Vec<Regex>> = OnceLock::new();

fn get_patterns() -> &'static Vec<Regex> {
    PROMPT_INJECTION_PATTERNS.get_or_init(|| {
        vec![
            Regex::new(r"(?i)ignore\s+all\s+previous\s+instructions").unwrap(),
            Regex::new(r"(?i)you\s+are\s+now").unwrap(),
            Regex::new(r"(?i)act\s+as\s+a\s+(hacker|jailbreaker|unrestricted)").unwrap(),
            Regex::new(r"(?i)system\s+prompt").unwrap(),
            Regex::new(r"(?i)bypass\s+filter").unwrap(),
            Regex::new(r"(?i)forget\s+(about\s+)?your\s+rules").unwrap(),
        ]
    })
}

pub struct AiSecurityService;

impl AiSecurityService {
    /// Validates a prompt against common prompt injection techniques.
    /// Returns true if the prompt is deemed safe, false if it contains malicious patterns.
    pub fn is_prompt_safe(prompt: &str) -> bool {
        for pattern in get_patterns().iter() {
            if pattern.is_match(prompt) {
                return false;
            }
        }
        
        // Also check for excessive length which might be a DoS vector for the LLM
        if prompt.len() > 8000 {
            return false;
        }

        true
    }

    /// Sanitizes a prompt to ensure there are no dangerous system commands (if applicable).
    pub fn sanitize_prompt(prompt: &str) -> String {
        // Here we could implement basic string sanitization if we wanted, 
        // but typically rejecting is better than modifying for prompt injection.
        prompt.trim().to_string()
    }
}
