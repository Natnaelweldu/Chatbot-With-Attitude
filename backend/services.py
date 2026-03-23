from groq import AsyncGroq
import os, json, re, asyncio
from dotenv import load_dotenv

load_dotenv()
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

def save_to_json(full_history_list):
    with open("./database.json", "w") as f:
        json.dump(full_history_list, f, indent=4)

def load_from_json():
    file_path = "./database.json"
    if not os.path.exists(file_path) or os.stat(file_path).st_size == 0:
        return []
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except:
        return []

def clean_symbols(text):
    return re.sub(r'(\*\*|\||---|###)', '', text)

async def get_chatbot_response(full_history):
    context = full_history[-5:]
    messages = [{"role": "system", "content": "You are a blunt dev from Jimma. Keep it real."}] + context
    
    # stream=False is the default, but we'll be explicit
    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        stream=False, 
    )
    return completion.choices[0].message.content