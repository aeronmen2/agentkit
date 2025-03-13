# -*- coding: utf-8 -*-
# mypy: disable-error-code="call-arg"

import logging
from typing import Optional

from langchain.base_language import BaseLanguageModel
from langchain_community.llms.ollama import Ollama
from langchain_community.chat_models import ChatOllama

from app.core.config import settings
from app.schemas.tool_schema import LLMType

logger = logging.getLogger(__name__)


def get_token_length(
    string: str,
    model: str = "mistral::1.5b",
) -> int:
    """
    Get the token length of a string.
    
    This is an approximation for Ollama models as they don't provide
    a direct token counting API like tiktoken.
    """
    # Simple approximation (4 characters ≈ 1 token)
    # This is a rough estimate and may not be accurate for all inputs
    return len(string) // 4


def get_llm(
    llm: LLMType,
    api_key: Optional[str] = None,  # Not used with Ollama but kept for API compatibility
) -> BaseLanguageModel:
    """Get the LLM instance for the given LLM type."""
    base_url = settings.OLLAMA_URL or "http://localhost:11434"
    
    # Default to mistral for all model types
    deepseek_model = "mistral"
    
    match llm:
        case "azure-3.5":
            logger.info("Using mistral instead of Azure GPT-3.5")
            return ChatOllama(
                base_url=base_url,
                model=deepseek_model,
                temperature=0,
                streaming=True,
            )
        case "gpt-3.5-turbo":
            logger.info("Using mistral instead of GPT-3.5 Turbo")
            return ChatOllama(
                base_url=base_url,
                model=deepseek_model,
                temperature=0,
                streaming=True,
            )
        case "gpt-4":
            logger.info("Using mistral instead of GPT-4")
            return ChatOllama(
                base_url=base_url,
                model=deepseek_model,
                temperature=0,
                streaming=True,
            )
        case "mistral::1.5b":
            # Direct request for mistral
            return ChatOllama(
                base_url=base_url,
                model=deepseek_model,
                temperature=0,
                streaming=True,
            )
        # If an exact match is not confirmed, this last case will be used if provided
        case _:
            logger.warning(f"LLM {llm} not found, using mistral as default")
            return ChatOllama(
                base_url=base_url,
                model=deepseek_model,
                temperature=0,
                streaming=True,
            )
