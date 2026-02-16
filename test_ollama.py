import json

import requests


def test_ollama():
    """Test if Ollama is running and accessible"""
    print("Testing Ollama connectivity...")

    try:
        # Test basic health check
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json()
            print("✅ Ollama is running!")
            print(f"Available models: {json.dumps(models, indent=2)}")

            # Check if gemma:2b is available
            model_names = [m.get("name") for m in models.get("models", [])]
            if "gemma:2b" in model_names:
                print("✅ gemma:2b model is installed!")
            else:
                print("❌ gemma:2b model is NOT installed")
                print("Run: ollama run gemma:2b")
        else:
            print(f"❌ Ollama returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Ollama on http://localhost:11434")
        print("Make sure Ollama is running: ollama serve")
    except Exception as e:
        print(f"❌ Error: {e}")


def test_chat():
    """Test if chat endpoint works"""
    print("\nTesting chat endpoint...")

    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "gemma:2b",
                "messages": [{"role": "user", "content": "Say hello!"}],
                "stream": False,
            },
            timeout=30,
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Chat endpoint works!")
            print(f"Response: {result.get('message', {}).get('content', 'No content')}")
        else:
            print(f"❌ Chat returned status {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Chat error: {e}")


if __name__ == "__main__":
    test_ollama()
    test_chat()
