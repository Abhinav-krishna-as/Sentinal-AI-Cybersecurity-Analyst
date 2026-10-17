from .selector import selector_agent
from .memory import save_message, load_message, create_chat


def run_Cybi(question: str, thread_id: str) -> str:

    # -------------------------------------------------
    # Make sure chat session exists
    # -------------------------------------------------

    create_chat(
        thread_id,
        "Sentinal Security Analysis"
    )

    # -------------------------------------------------
    # Get available providers
    # -------------------------------------------------

    agents = selector_agent(question)

    # -------------------------------------------------
    # Save user message
    # -------------------------------------------------

    save_message(
        thread_id,
        "user",
        question
    )

    # -------------------------------------------------
    # Load history
    # -------------------------------------------------

    history = load_message(thread_id)[-10:]

    messages = []

    for msg in history:

        messages.append(
            {
                "role": msg["role"],
                "content": msg["message"]
            }
        )

    # -------------------------------------------------
    # FALLBACK SYSTEM
    # -------------------------------------------------

    last_error = None

    for number, agent in enumerate(
        agents,
        start=1
    ):

        provider_name = type(agent).__name__

        print("\n" + "=" * 60)

        print(
            f"🧠 Cybi Provider {number}/{len(agents)}"
        )

        print(
            f"Provider: {provider_name}"
        )

        print("=" * 60)

        try:

            result = agent.invoke(

                {
                    "messages": messages
                },

                config={
                    "configurable": {
                        "thread_id": thread_id
                    }
                }
            )

            answer = result["messages"][-1]

            # -----------------------------------------
            # Save successful response
            # -----------------------------------------

            save_message(
                thread_id,
                "assistant",
                answer.content
            )

            print(
                f"✅ Cybi response received from "
                f"{provider_name}"
            )

            return answer.content

        except Exception as e:

            last_error = e

            print(
                f"❌ {provider_name} failed"
            )

            print(
                f"Error: {e}"
            )

            print(
                "➡️ Trying next provider..."
            )

    # -------------------------------------------------
    # ALL PROVIDERS FAILED
    # -------------------------------------------------

    raise Exception(
        "All Cybi AI providers failed.\n"
        f"Last Error: {last_error}"
    )

def main():

    user_id = username = input(
        "\n Enter your username > "
    )

    thread_id = user_id

    # Create chat session for terminal chat
    create_chat(
        thread_id,
        f"{user_id}'s Chat"
    )

    print(
        f"\n✨ Cybi > 👋 Hello, {username}! "
        "Welcome to Cybi AI. How can I help you today?"
    )

    while True:

        question = input(
            f"\n{username} > "
        )

        if question.lower() == "exit":

            print(
                "\nHave a Good Day, Goodbye!"
            )

            break

        answer = run_Cybi(
            question,
            thread_id
        )

        print(
            "\n✨ Cybi > ",
            answer
        )


# =====================================================
# RUN TERMINAL CHAT
# =====================================================

if __name__ == "__main__":

    main()