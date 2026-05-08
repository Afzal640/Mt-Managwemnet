import requests
import json

url = "https://mt-managwemnet.vercel.app/"
try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print("Headers:")
    print(json.dumps(dict(response.headers), indent=2))
except Exception as e:
    print(f"Error: {e}")
