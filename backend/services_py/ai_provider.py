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
        configured = settings.GEMINI_MODEL or "gemini-flash-lite-latest"
        # Strictly Gemini models only; Gemma, Groq, Ollama are completely excluded
        candidate_list = [configured] if configured else ["gemini-flash-lite-latest"]
        if "gemini-flash-lite-latest" not in candidate_list:
            candidate_list.append("gemini-flash-lite-latest")
        return candidate_list

    async def generate(self, prompt: str, is_json: bool = False) -> Dict[str, str]:
        if not prompt or not prompt.strip():
            return {"text": "" if not is_json else "{}", "provider": "gemini", "model": "none"}

        # Safe cap for extremely large prompts to prevent payload overflow
        safe_prompt = prompt.strip()[:30000]

        api_key = settings.GEMINI_API_KEY
        if not api_key or len(api_key.strip()) < 10:
            raise RuntimeError("Gemini API key is not configured.")

        models = self.get_model_candidates()
        last_error = None

        payload = {
            "contents": [{"parts": [{"text": safe_prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 2048 if is_json else 900
            }
        }
        if is_json:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        per_model_timeout = httpx.Timeout(min(self.timeout, 8.0), connect=3.0)
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
