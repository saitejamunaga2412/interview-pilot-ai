import json
import re
import logging
import httpx
from typing import Optional, Dict, Any, List
from core.config import settings

logger = logging.getLogger("uvicorn.error")

class GeminiProvider:
    def __init__(self):
        self.timeout = settings.GEMINI_TIMEOUT

    def get_model_candidates(self) -> List[str]:
        from pathlib import Path
        from dotenv import dotenv_values
        env_path = Path(__file__).resolve().parent.parent / ".env"
        env_vals = dotenv_values(env_path) if env_path.exists() else {}
        configured = env_vals.get("GEMINI_MODEL") or settings.GEMINI_MODEL or "gemini-flash-lite-latest"
        # Strictly Gemini models only; Gemma, Groq, Ollama are completely excluded
        candidate_list = [configured] if configured else ["gemini-flash-lite-latest"]
        standard_models = [
            "gemini-flash-lite-latest",
            "gemini-flash-latest",
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
            "gemini-pro-latest"
        ]
        for m in standard_models:
            if m not in candidate_list:
                candidate_list.append(m)
        return candidate_list

    async def generate(self, prompt: str, is_json: bool = False) -> Dict[str, str]:
        if not prompt or not prompt.strip():
            return {"text": "" if not is_json else "{}", "provider": "gemini", "model": "none"}

        # Safe cap for extremely large prompts to prevent payload overflow
        safe_prompt = prompt.strip()[:30000]

        from pathlib import Path
        from dotenv import dotenv_values
        env_path = Path(__file__).resolve().parent.parent / ".env"
        env_vals = dotenv_values(env_path) if env_path.exists() else {}
        api_key = (env_vals.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY or "").strip().strip("'\"")
        if not api_key or len(api_key.strip()) < 10:
            raise RuntimeError("Gemini API key is not configured.")

        models = self.get_model_candidates()
        last_error = None

        payload = {
            "contents": [{"parts": [{"text": safe_prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 2048 if is_json else 2500
            }
        }
        if is_json:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        # Allow sufficient time for full, comprehensive lesson generation (up to 20s per model)
        per_model_timeout = httpx.Timeout(min(self.timeout, 20.0), connect=5.0)
        async with httpx.AsyncClient(timeout=per_model_timeout) as client:
            for model_name in models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                    resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and len(candidates) > 0:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and len(parts) > 0:
                                return {"text": parts[0].get("text", "").strip(), "provider": "gemini", "model": model_name}
                    else:
                        err_msg = resp.text
                        if resp.status_code == 401:
                            logger.warning(f"[GeminiProvider] Model {model_name} HTTP 401: Invalid API key. Ensure GEMINI_API_KEY in backend/.env is a valid Google AI Studio key (starts with AIzaSy...).")
                            break
                        elif resp.status_code == 429:
                            logger.warning(f"[GeminiProvider] Project quota reached (HTTP 429). Fast-failing to curated fallback engine.")
                            last_error = RuntimeError(f"Gemini quota exceeded (429)")
                            break
                        else:
                            logger.warning(f"[GeminiProvider] Model {model_name} HTTP {resp.status_code}: {err_msg[:120]}")
                        last_error = RuntimeError(f"Gemini {model_name} HTTP {resp.status_code}: {err_msg[:120]}")
                except Exception as ex:
                    logger.warning(f"[GeminiProvider] Model {model_name} failed: {ex}")
                    last_error = ex

        raise last_error or RuntimeError("All Gemini model candidates failed.")

    async def generate_json(self, prompt: str) -> Dict[str, Any]:
        result = await self.generate(prompt, is_json=True)
        raw_text = result["text"]

        # 1. Try direct parse
        try:
            return {"data": json.loads(raw_text), "provider": "gemini"}
        except Exception:
            pass

        # 2. Try balanced extraction
        clean_json = self.extract_balanced_json(raw_text)
        if clean_json:
            try:
                return {"data": json.loads(clean_json), "provider": "gemini"}
            except Exception as ex:
                logger.error(f"[GeminiProvider] JSON parse error: {ex}. Raw: {raw_text[:200]}")
                raise RuntimeError(f"AI generated invalid JSON: {ex}")

        raise RuntimeError("No valid JSON structure found in Gemini response.")

    def extract_balanced_json(self, text: str) -> Optional[str]:
        if not text:
            return None
            
        # Strip markdown fences
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
        if fence_match:
            text = fence_match.group(1).strip()

        first_brace = text.find("{")
        first_bracket = text.find("[")
        if first_brace == -1 and first_bracket == -1:
            return None

        if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
            start_char, end_char = "{", "}"
            start = first_brace
        else:
            start_char, end_char = "[", "]"
            start = first_bracket

        count = 0
        in_string = False
        escape = False
        end = -1

        for i in range(start, len(text)):
            c = text[i]
            if escape:
                escape = False
                continue
            if c == "\\":
                escape = True
                continue
            if c == '"':
                in_string = not in_string
                continue
            if not in_string:
                if c == start_char:
                    count += 1
                elif c == end_char:
                    count -= 1
                    if count == 0:
                        end = i
                        break

        if end != -1:
            return text[start : end + 1]
        return None

ai_provider = GeminiProvider()
