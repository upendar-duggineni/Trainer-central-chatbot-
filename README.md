# Trainer Central AI Chatbot

A FastAPI + HTML/CSS/JavaScript chatbot. It fetches live records from the existing
Trainer Central API (`GET /api/entries`) and uses Claude to answer conversationally.

## Local run (Windows PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Add your Anthropic key to .env
uvicorn main:app --reload
```

Open http://127.0.0.1:8000

## Environment variables

- `ANTHROPIC_API_KEY` (required): your Anthropic API key
- `CLAUDE_MODEL` (optional): defaults to `claude-sonnet-4-5`
- `TRAINER_API_BASE` (optional): defaults to the supplied Trainer Central API
- `TRAINER_API_KEY` (optional): set only if the Trainer Central API requires an API key

## Deploy on Render

Create a new **Web Service** from this folder/repository:
- Runtime: Python
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Add `ANTHROPIC_API_KEY` in Render Environment. Add `TRAINER_API_KEY` only if required
by the Trainer Central API. Do not commit `.env`, API keys, Google credentials, or token files.

## API behavior

Every `/api/chat` request fetches fresh dashboard entries. It passes the retrieved
records and the question to Claude. The system prompt requires answers to stay grounded
in the retrieved records and say when information is unavailable. The chatbot is read-only.
