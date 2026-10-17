# =========================================================
# CYBI AGENTS
# =========================================================

from langchain.agents import create_agent

from cybersecurity.security_tools import system_status

from .models import (
    groq_model,
    nvidia_model,
    openrouter_model
)

from .prompt import SystemPrompt


# =========================================================
# CREATE GROQ AGENT
# =========================================================

groq_agent = None

if groq_model:

    groq_agent = create_agent(

        model=groq_model,

        tools=[
            system_status
        ],

        system_prompt=SystemPrompt
    )


# =========================================================
# CREATE NVIDIA AGENT
# =========================================================

nvidia_agent = None

if nvidia_model:

    nvidia_agent = create_agent(

        model=nvidia_model,

        tools=[
            system_status
        ],

        system_prompt=SystemPrompt
    )


# =========================================================
# CREATE OPENROUTER AGENT
# =========================================================

openrouter_agent = None

if openrouter_model:

    openrouter_agent = create_agent(

        model=openrouter_model,

        tools=[
            system_status
        ],

        system_prompt=SystemPrompt
    )