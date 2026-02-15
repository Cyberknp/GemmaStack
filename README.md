🤖 GemmaStack: Lightweight AI Chatbot
A full-stack, local-first AI chatbot built with Gemma 2B, FastAPI, and React. This project demonstrates how to implement real-time LLM streaming using Ollama as the inference engine.

🚀 Features
Local LLM: Powered by Google's Gemma 2B (no API keys required).

Streaming Responses: Real-time "typing" effect using Server-Sent Events (SSE) logic.

Modern UI: Clean, dark-mode interface built with Tailwind CSS and Lucide icons.

Markdown Support: Correct rendering of code blocks, bold text, and lists.

FastAPI Backend: High-performance asynchronous Python API.

🛠️ Tech Stack
LLM: Ollama (Gemma:2b)

Frontend: React, Vite, Tailwind CSS, Framer Motion

Backend: FastAPI, Uvicorn, Python 3.10+

📥 Getting Started
1. Prerequisites
Install Ollama.

Install Node.js (v18+).

Install Python 3.10+.

2. Prepare the Model
Open your terminal and pull the lightweight Gemma model:

Bash
ollama run gemma:2b
3. Backend Setup (FastAPI)
Bash
# Navigate to backend folder
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn ollama pydantic

# Start the server
uvicorn main:app --reload
The API will be running at http://localhost:8000.

4. Frontend Setup (React)
Bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
The UI will be running at http://localhost:5173.

📂 Project Structure
Plaintext
.
├── backend/
│   └── main.py          # FastAPI logic & Ollama integration
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main Chat Interface
│   │   └── main.jsx
│   └── tailwind.config.js
└── README.md
⚙️ Configuration
To change the model personality or switch to a different model (like Llama 3), update main.py:

Python
# Switch models by changing this line:
stream = ollama.chat(
    model='gemma:2b', # or 'llama3.2:1b'
    messages=[{'role': 'system', 'content': 'You are a helpful assistant.'}],
    stream=True,
)
🤝 Contributing
Feel free to fork this project and add features like message history, vector database (RAG) support, or dark/light mode toggles!
