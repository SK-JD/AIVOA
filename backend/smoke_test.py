"""Backend-only smoke test: run the LangGraph agent on the sample prompt and print the
resulting form patch — proves LangGraph + Groq tool-calling works without the UI.

Requires GROQ_API_KEY (in .env) and a reachable database. Run:
    cd backend && source .venv/bin/activate && python smoke_test.py
"""
from app.schemas import ChatRequest
from app.services.chat_service import run_chat

SAMPLE = (
    "I met Dr. Smith today regarding Product X. He responded positively. "
    "I shared two brochures and requested a follow-up in two weeks."
)


def main() -> None:
    print(f"USER: {SAMPLE}\n")
    res = run_chat(ChatRequest(message=SAMPLE))
    print(f"TOOLS USED : {res.tools_used}")
    print(f"REPLY      : {res.reply}\n")
    print("FORM PATCH :")
    for key, value in res.form_patch.items():
        print(f"  {key:20} = {value}")
    if res.suggestions:
        print(f"\nSUGGESTIONS: {res.suggestions}")


if __name__ == "__main__":
    main()
