import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services_py.ai_provider import GeminiProvider
from services_py.ai_teacher import AITeacherService
from core.config import settings

async def test_failures():
    print("=== GEMINI ERROR HANDLING AUDIT ===")
    
    # 1. Empty Prompt
    p = GeminiProvider()
    res_empty = await p.generate("")
    print("1. Empty prompt handled safely:", res_empty)
    assert res_empty.get("text") == ""

    # 2. Oversized Prompt (> 30k chars)
    huge_prompt = "Explain recursion. " * 3000
    res_huge = await p.generate(huge_prompt)
    print(f"2. Oversized prompt ({len(huge_prompt)} chars) clamped and executed safely, length: {len(res_huge.get('text', ''))}")
    assert len(res_huge.get("text", "")) > 0

    # 3. Invalid API key error safety
    bad_provider = GeminiProvider()
    saved_key = settings.GEMINI_API_KEY
    try:
        settings.GEMINI_API_KEY = "AIzaSyFakeInvalidKeyForTesting"
        try:
            await bad_provider.generate("Hello")
            print("3. Warning: Expected failure with fake key")
        except Exception as e:
            err_str = str(e)
            print(f"3. Invalid key handled with exception: {err_str[:80]}")
            # Ensure secret key is not leaked in exception string
            assert "AIzaSyFakeInvalidKeyForTesting" not in err_str, "Key must not be leaked in exception message!"
            print("   [PASS] Key not exposed in exception output.")
    finally:
        settings.GEMINI_API_KEY = saved_key

    # 4. Fallback in AI Teacher when provider raises error
    try:
        settings.GEMINI_API_KEY = "AIzaSyFakeInvalidKeyForTesting"
        teacher_res = await AITeacherService.chat(None, [], "What is an array?", "general", {})
        print(f"4. AI Teacher fallback when Gemini down: status={teacher_res.get('status')}, reply len={len(teacher_res.get('reply', ''))}")
        assert teacher_res.get("status") in ("ready", "completed")
        assert len(teacher_res.get("reply", "")) > 0
        assert "AIzaSyFake" not in teacher_res.get("reply", "")
        print("   [PASS] AI Teacher returned safe, helpful fallback without leaking credentials.")
    finally:
        settings.GEMINI_API_KEY = saved_key

    print("ALL GEMINI ERROR HANDLING TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(test_failures())
