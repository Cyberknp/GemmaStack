import json

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    def generate():
        try:
            # Call Ollama API
            response = requests.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": "gemma:2b",
                    "messages": [{"role": "user", "content": request.message}],
                    "stream": True,
                },
                stream=True,
                timeout=30,
            )

            response.raise_for_status()

            # Stream the response
            for line in response.iter_lines():
                if line:
                    try:
                        chunk = json.loads(line)
                        if "message" in chunk and "content" in chunk["message"]:
                            yield chunk["message"]["content"]
                    except json.JSONDecodeError:
                        continue
        except requests.exceptions.ConnectionError:
            yield "Error: Could not connect to Ollama. Make sure Ollama is running on http://localhost:11434"
        except Exception as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")


@app.get("/health")
async def health():
    return {"status": "ok"}
