# =========================================================
# CYBI PROVIDER SELECTOR
# =========================================================

from .agent import (
    groq_agent,
    nvidia_agent,
    openrouter_agent
)


def selector_agent(question: str):

    """
    Return available Cybi providers in fallback order.

    Priority:

    1. Groq
    2. NVIDIA
    3. OpenRouter
    """

    agents = []


    # -----------------------------------------------------
    # PRIMARY
    # -----------------------------------------------------

    if groq_agent is not None:

        agents.append(groq_agent)


    # -----------------------------------------------------
    # FALLBACK 1
    # -----------------------------------------------------

    if nvidia_agent is not None:

        agents.append(nvidia_agent)


    # -----------------------------------------------------
    # FALLBACK 2
    # -----------------------------------------------------

    if openrouter_agent is not None:

        agents.append(openrouter_agent)


    # -----------------------------------------------------
    # Check providers
    # -----------------------------------------------------

    if not agents:

        raise RuntimeError(
            "No Cybi AI providers are available."
        )


    return agents