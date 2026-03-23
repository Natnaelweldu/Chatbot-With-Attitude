from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services import get_chatbot_response, save_to_json, load_from_json, clean_symbols

app = FastAPI()

# --- CORS SETUP ---
origins = ["http://localhost:5500", "http://127.0.0.1:5500",
           "https://natnaelweldu.github.io/Chatbot-With-Attitude/"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat_endpoint(user_message: str):
    # 1. Update history with user message
    history = load_from_json()
    history.append({"role": "user", "content": user_message})
    
    # 2. Get full AI response (Non-streaming)
    full_reply = await get_chatbot_response(history)
    full_reply = clean_symbols(full_reply)

    # 3. Save AI response to history
    history.append({"role": "assistant", "content": full_reply})
    save_to_json(history)

    # 4. Return as standard JSON
    return {"reply": full_reply}

@app.get('/history')
def get_history():
    return load_from_json()