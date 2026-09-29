import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from groq import Groq

logger = logging.getLogger("groq_service")

# Default model requested by specification
DEFAULT_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

# Fallback production models if specified model is unavailable on current Groq tier
FALLBACK_MODELS = [
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b"
]

def _load_env_file():
    """Attempt to load .env from backend folder if not already loaded into os.environ"""
    if os.environ.get("GROQ_API_KEY"):
        return
    base_dir = Path(__file__).resolve().parent
    env_file = base_dir / ".env"
    if env_file.exists():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and not os.environ.get(k):
                            os.environ[k] = v
        except Exception as e:
            logger.warning(f"Could not parse .env file: {e}")

# Initial load
_load_env_file()

def get_groq_api_key() -> Optional[str]:
    _load_env_file()
    key = os.environ.get("GROQ_API_KEY", "").strip()
    return key if key and key != "YOUR_REAL_KEY" else None

def get_groq_model() -> str:
    _load_env_file()
    return os.environ.get("GROQ_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL

def is_groq_available() -> bool:
    key = get_groq_api_key()
    return bool(key and len(key) > 10)

def call_groq_chat(
    system_prompt: str,
    messages: List[Dict[str, str]],
    temperature: float = 0.2,
    max_tokens: int = 1500,
    json_mode: bool = False
) -> Tuple[Optional[str], Optional[str]]:
    """
    Calls Groq Chat Completion with system prompt and user conversation history.
    Returns: (response_text, error_message)
    """
    api_key = get_groq_api_key()
    if not api_key:
        return None, "GROQ_API_KEY is not configured in backend environment."

    model_candidates = [get_groq_model()]
    for m in FALLBACK_MODELS:
        if m not in model_candidates:
            model_candidates.append(m)

    payload_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ["user", "assistant"] and content:
            payload_messages.append({"role": role, "content": content})

    client = Groq(api_key=api_key)
    last_error = None

    for model_name in model_candidates:
        try:
            logger.info(f"Dispatching chat completion to Groq model: {model_name}")
            extra_kwargs = {}
            if json_mode:
                extra_kwargs["response_format"] = {"type": "json_object"}

            completion = client.chat.completions.create(
                model=model_name,
                messages=payload_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=0.9,
                **extra_kwargs
            )
            content = completion.choices[0].message.content
            if content:
                return content.strip(), None
        except Exception as e:
            err_str = str(e)
            logger.warning(f"Groq API call with model '{model_name}' failed: {err_str}")
            last_error = err_str
            # If rate limit, try next candidate model (e.g. 20b has separate TPM pool)
            if "rate_limit" in err_str.lower():
                continue
            # If invalid API key, do not keep trying
            if "invalid_api_key" in err_str.lower() or "authentication" in err_str.lower():
                return None, "Invalid Groq API Key. Please verify credentials in backend environment."
            # Continue to next model only if model not found/deprecated
            if "model" in err_str.lower() or "not found" in err_str.lower() or "decommissioned" in err_str.lower():
                continue
            else:
                break

    return None, f"Groq API error: {last_error or 'Unknown failure'}"

def call_groq_json(
    system_prompt: str,
    messages: List[Dict[str, str]],
    temperature: float = 0.1,
    max_tokens: int = 2000
) -> Tuple[Optional[dict], Optional[str]]:
    """
    Calls Groq Chat Completion and parses result as structured JSON.
    Returns: (parsed_json_dict, error_message)
    """
    text, err = call_groq_chat(system_prompt, messages, temperature=temperature, max_tokens=max_tokens, json_mode=True)
    if (err or not text) and "response_format" in str(err or ""):
        # Retry without json_mode if model doesn't support response_format
        text, err = call_groq_chat(system_prompt, messages, temperature=temperature, max_tokens=max_tokens, json_mode=False)

    if err or not text:
        return None, err or "Empty response from Groq"

    cleaned = text.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```", 1)[1].split("```", 1)[0].strip()

    try:
        data = json.loads(cleaned)
        return data, None
    except Exception as e:
        logger.warning(f"Could not parse Groq JSON response: {e}. Output was: {text[:200]}")
        return None, f"JSON parse error: {e}"


