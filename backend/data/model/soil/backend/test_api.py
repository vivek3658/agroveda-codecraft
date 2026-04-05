import requests

url = "http://127.0.0.1:5000/predict"

# Test inputs
tests = [
    {
        "name": "High rainfall",
        "data": {
            "N": 100, "P": 90, "K": 80,
            "temperature": 30, "humidity": 80,
            "rainfall": 800, "ph": 6.5
        }
    },
    {
        "name": "Low rainfall",
        "data": {
            "N": 100, "P": 90, "K": 80,
            "temperature": 30, "humidity": 60,
            "rainfall": 50, "ph": 6.5
        }
    }
]

for test in tests:
    print("\n", test["name"])
    response = requests.post(url, json=test["data"])
    print(response.json())