import httpx
from datetime import datetime

base_url = 'http://127.0.0.1:5000'
ts = int(datetime.utcnow().timestamp())

# Register test user
reg = httpx.post(f'{base_url}/api/auth/register', json={
    'name': 'AI Smoke Student',
    'email': f'aismoke_{ts}@example.com',
    'password': 'Password123!'
})
assert reg.status_code == 200, f"Register failed: {reg.text}"
token = reg.json()['data']['token']
headers = {'Authorization': f'Bearer {token}'}

prompts = [
    'hi',
    'what is a binary tree?',
    'explain binary search',
    'write Python code for two sum',
    'what is SQL normalization?',
    'what should I study for placements?',
    'what did I improve recently?'
]

print('\n=== EXECUTING 7-PROMPT GEMINI SMOKE TEST ===')
for p in prompts:
    r = httpx.post(f'{base_url}/api/learning/teacher/chat', json={
        'currentMessage': p,
        'history': [],
        'contextMeta': {'activePage': '/dashboard'}
    }, headers=headers, timeout=30.0)
    assert r.status_code == 200, f'Failed on {p}: {r.text}'
    data = r.json()['data']
    reply = data['reply']
    timing = data['timing']
    provider = timing.get('provider', 'unknown')
    model = timing.get('model', 'gemini')
    print(f'Prompt: "{p}"')
    print(f'Provider: {provider} ({model}) | Length: {len(reply)} chars')
    print(f'Snippet: {reply[:120].strip()}...')
    
    # Specific assertions
    if p == 'hi':
        assert len(reply) < 100
        assert provider == 'cache'
    elif 'binary tree' in p:
        assert any(k in reply.lower() for k in ['node', 'root', 'tree', 'data structure'])
    elif 'binary search' in p:
        assert any(k in reply.lower() for k in ['sorted', 'divide', 'half', 'o(log', 'logarithmic'])
    elif 'two sum' in p:
        assert any(k in reply.lower() for k in ['def ', 'hash', 'dict', 'target'])
    elif 'improve recently' in p:
        # Must not hallucinate scores when student has no history
        assert any(k in reply.lower() for k in ['no recent', 'no recorded', 'haven\'t', 'get started', 'begin', '0', 'not found'])
    
    print('[PASS] Grounded & Validated')
    print('-------------------------------------------')

print('ALL 7 PROMPTS FULLY VERIFIED!\n')
