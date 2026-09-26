import pytest
import sys
import json
import re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_ai_teacher_binary_search():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/learning/teacher/chat", json={
            "topicId": "binary-search",
            "history": [],
            "currentMessage": "Can you explain binary search with code, dry run, and visualization?",
            "step": "general"
        })
        assert res.status_code == 200
        data = res.json()["data"]
        reply = data.get("reply", "")

        # 1. Non-empty
        assert len(reply) > 200, f"Reply too short: {reply}"

        # 2. Must contain code block
        assert "```" in reply, "Must contain code block"

        # 3. Must contain Time Complexity section (not truncated)
        assert ("time complexity" in reply.lower() or "time & space complexity" in reply.lower() or ("time" in reply.lower() and "complexity" in reply.lower())), "Must contain Time Complexity"

        # 4. Must contain Space Complexity section
        assert ("space complexity" in reply.lower() or "o(1)" in reply.lower()), "Must contain Space Complexity"

        # 5. Raw XML svg code block must NOT be exposed as raw code
        assert not re.search(r"```svg\s*<svg", reply, re.IGNORECASE), "Raw svg code block must not be exposed"

        # 6. Must have visualization data block or template
        has_vis_block = "```visualization" in reply
        has_vis_field = "visualization" in data
        assert has_vis_block or has_vis_field, "Must have interactive visualizer data"

        if has_vis_block:
            vis_match = re.search(r"```visualization\s*([\s\S]*?)\s*```", reply)
            assert vis_match is not None
            parsed_vis = json.loads(vis_match.group(1))
            assert "steps" in parsed_vis or "type" in parsed_vis
            print("Binary Search visualizer payload valid:", parsed_vis.get("type"))

@pytest.mark.asyncio
async def test_ai_teacher_linear_search():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/learning/teacher/chat", json={
            "topicId": "linear-search",
            "history": [],
            "currentMessage": "Explain linear search step by step with code and visualization",
            "step": "general"
        })
        assert res.status_code == 200
        data = res.json()["data"]
        reply = data.get("reply", "")

        assert len(reply) > 200
        assert "```" in reply
        assert ("time complexity" in reply.lower() or "o(n)" in reply.lower())
        assert not re.search(r"```svg\s*<svg", reply, re.IGNORECASE)

        has_vis = "```visualization" in reply or "visualization" in data
        assert has_vis, "Linear search must have visualizer data"
        print("Linear Search test passed successfully!")

@pytest.mark.asyncio
async def test_ai_teacher_two_pointers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/learning/teacher/chat", json={
            "topicId": "two-pointers",
            "history": [],
            "currentMessage": "How does the two pointers technique work?",
            "step": "general"
        })
        assert res.status_code == 200
        data = res.json()["data"]
        reply = data.get("reply", "")

        assert len(reply) > 150
        assert not re.search(r"```svg\s*<svg", reply, re.IGNORECASE)
        print("Two Pointers test passed successfully!")
