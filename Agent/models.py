# =========================================================
# CYBI AI MODELS
# =========================================================

import warnings
import os

from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_openrouter import ChatOpenRouter


# =========================================================
# LOAD ENVIRONMENT
# =========================================================

warnings.filterwarnings(
    "ignore",
    category=UserWarning
)

load_dotenv()


# =========================================================
# API KEYS
# =========================================================

groq_api = os.getenv("GROQ_API_KEY")
nvidia_api = os.getenv("NVIDIA_API_KEY")
openrouter_api = os.getenv("OPENROUTER_API_KEY")


# =========================================================
# CHECK API KEYS
# =========================================================

if not groq_api:
    print("⚠️ GROQ_API_KEY is missing")

if not nvidia_api:
    print("⚠️ NVIDIA_API_KEY is missing")

if not openrouter_api:
    print("⚠️ OPENROUTER_API_KEY is missing")


# =========================================================
# GROQ
# =========================================================

groq_model = None

if groq_api:

    groq_model = ChatGroq(

        model="openai/gpt-oss-120b",

        api_key=groq_api,

        temperature=0.4,

        max_completion_tokens=1000
    )


# =========================================================
# NVIDIA
# =========================================================

nvidia_model = None

if nvidia_api:

    nvidia_model = ChatNVIDIA(

        model="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",

        api_key=nvidia_api,

        temperature=0.0
    )


# =========================================================
# OPENROUTER
# =========================================================

openrouter_model = None

if openrouter_api:

    openrouter_model = ChatOpenRouter(

        model="nvidia/nemotron-3-ultra-550b-a55b:free",

        api_key=openrouter_api,

        temperature=0.4
    )


# =========================================================
# PROVIDER STATUS
# =========================================================

print("\n======================================")
print("        CYBI PROVIDER STATUS")
print("======================================")

print(
    "Groq       :",
    "READY" if groq_model else "UNAVAILABLE"
)

print(
    "NVIDIA     :",
    "READY" if nvidia_model else "UNAVAILABLE"
)

print(
    "OpenRouter :",
    "READY" if openrouter_model else "UNAVAILABLE"
)

print("======================================\n")