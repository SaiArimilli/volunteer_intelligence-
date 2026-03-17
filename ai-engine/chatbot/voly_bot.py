"""
chatbot/voly_bot.py
Standalone chatbot wrapper using the Anthropic API.

Run interactively:
  ANTHROPIC_API_KEY=sk-... python chatbot/voly_bot.py
"""

import os
import asyncio

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


SYSTEM_PROMPT = """You are Voly, the friendly AI assistant for the Volunteer Intelligence System — 
a platform connecting volunteers with meaningful social-impact opportunities.

Your role:
- Help volunteers find tasks that match their skills
- Explain how the badge and impact score system works
- Motivate volunteers who seem disengaged
- Answer questions about volunteering best practices
- Give concise, warm, and actionable advice

Tone: Friendly, encouraging, concise. Avoid jargon. Keep replies under 150 words unless a detailed
explanation is explicitly needed.
"""


class VolyBot:
    def __init__(self, api_key: str | None = None):
        key = api_key or os.getenv('ANTHROPIC_API_KEY')
        if not key or not ANTHROPIC_AVAILABLE:
            self.client = None
        else:
            self.client = anthropic.Anthropic(api_key=key)

    def chat(self, message: str, history: list[dict] | None = None) -> str:
        """
        Synchronous chat.
        history: [{"role": "user"/"assistant", "content": "..."}]
        """
        if not self.client:
            return ("Hi! I'm Voly 🌱 — your volunteer assistant. "
                    "Please set ANTHROPIC_API_KEY to enable AI responses.")

        messages = list(history or [])
        messages.append({"role": "user", "content": message})

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        return response.content[0].text

    async def chat_async(self, message: str, history: list[dict] | None = None) -> str:
        """Async version for FastAPI integration."""
        if not self.client:
            return ("Hi! I'm Voly 🌱 — your volunteer assistant. "
                    "Please set ANTHROPIC_API_KEY to enable AI responses.")

        async_client = anthropic.AsyncAnthropic(api_key=self.client.api_key)
        messages = list(history or [])
        messages.append({"role": "user", "content": message})

        response = await async_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        return response.content[0].text


def interactive_demo():
    """Run an interactive CLI chat session with Voly."""
    bot = VolyBot()
    history = []
    print("\n🌱 Voly — Volunteer AI Assistant (type 'quit' to exit)\n")
    print("Voly:", bot.chat("Hello! Introduce yourself briefly."))
    print()

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ('quit', 'exit', 'q'):
            print("Voly: Thanks for volunteering! Stay impactful 🌱")
            break
        if not user_input:
            continue
        reply = bot.chat(user_input, history)
        history.append({"role": "user", "content": user_input})
        history.append({"role": "assistant", "content": reply})
        print(f"Voly: {reply}\n")


if __name__ == '__main__':
    interactive_demo()
