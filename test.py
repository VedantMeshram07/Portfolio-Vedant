import requests

API_KEY = "sk-2jF2EM2X9rzJ2UrWYXrEhOwb9zzBIUe2ydAepbJu5X0cJ2M53CMYs0FIcpi1If8W" 

url = "https://opencode.ai/zen/go/v1/messages"
headers = {
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json"
}

payload = {
    "model": "qwen3.7-max",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Server Response: {response.text}")
except Exception as e:
    print(f"Network Connection Failed: {e}")