from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import ollama

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    def generate():
        # Stream responses from Gemma
        stream = ollama.chat(
            model='gemma:2b',
            messages=[{'role': 'user', 'content': request.message}],
            stream=True,
        )
        for chunk in stream:
            yield chunk['message']['content']

    return StreamingResponse(generate(), media_type="text/plain")
