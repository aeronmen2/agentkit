# -*- coding: utf-8 -*-
# mypy: disable-error-code="call-arg"

import logging
from typing import Dict, List, Optional, Union, Any

from langchain.embeddings import CacheBackedEmbeddings
from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_core.embeddings import Embeddings

from app.api.deps import get_redis_store
from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheBackedEmbeddingsExtended(CacheBackedEmbeddings):
    def embed_query(self, text: str) -> List[float]:
        """
        Embed query text with caching support.

        Args:
            text: The text to embed.

        Returns:
            The embedding for the given text.
        """
        # Get from cache if available
        vectors: List[Union[List[float], None]] = self.document_embedding_store.mget([text])
        text_embeddings = vectors[0]

        # Generate and cache if not found
        if text_embeddings is None:
            text_embeddings = self.underlying_embeddings.embed_query(text)
            self.document_embedding_store.mset([(text, text_embeddings)])

        return text_embeddings

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embed multiple documents.

        Args:
            texts: The texts to embed.

        Returns:
            The embeddings for the given texts.
        """
        # Check cache for existing embeddings
        vectors: List[Union[List[float], None]] = self.document_embedding_store.mget(texts)
        
        # Identify which texts need embedding
        missing_indices = [i for i, v in enumerate(vectors) if v is None]
        texts_to_embed = [texts[i] for i in missing_indices]
        
        # If there are texts that need embedding
        if texts_to_embed:
            # Generate embeddings for missing texts
            new_embeddings = self.underlying_embeddings.embed_documents(texts_to_embed)
            
            # Cache the new embeddings
            items_to_cache = list(zip(texts_to_embed, new_embeddings))
            self.document_embedding_store.mset(items_to_cache)
            
            # Update the vectors list with new embeddings
            for idx, missing_idx in enumerate(missing_indices):
                vectors[missing_idx] = new_embeddings[idx]
        
        # Return all embeddings (from cache and newly generated)
        return [v for v in vectors if v is not None]


def get_embedding_model(emb_model: Optional[str] = None) -> CacheBackedEmbeddingsExtended:
    """
    Get the embedding model from the embedding model type.
    Always uses Ollama for embeddings.

    Args:
        emb_model: Optional model name to use. If None, uses default.

    Returns:
        A cached embedding model instance.
    """
    return get_ollama_embedding_model(emb_model)


def get_ollama_embedding_model(emb_model: Optional[str] = None) -> CacheBackedEmbeddingsExtended:
    """
    Gets the embedding model from the embedding model type.
    
    Args:
        emb_model: Optional model name to use. If None, uses default.
        
    Returns:
        A cached Ollama embedding model instance.
    """
    # Map OpenAI model names to Ollama equivalents if needed
    if emb_model == "text-embedding-ada-002":
        # Replace with an Ollama-compatible embedding model
        emb_model = "nomic-embed-text"
    
    # Use default model if none specified
    if emb_model is None:
        emb_model = settings.OLLAMA_DEFAULT_MODEL

    # Create the underlying embeddings model
    try:
        underlying_embeddings = OllamaEmbeddings(
            base_url=settings.OLLAMA_URL, 
            model=emb_model, 
            show_progress=True
        )
        
        # Get Redis store for caching
        store = get_redis_store()
        
        # Create cached embeddings wrapper
        embedder = CacheBackedEmbeddingsExtended.from_bytes_store(
            underlying_embeddings, 
            store, 
            namespace=f"ollama_embeddings_{underlying_embeddings.model}"
        )
        
        logger.info(f"Successfully initialized embedding model: {emb_model}")
        return embedder
        
    except Exception as e:
        logger.error(f"Error initializing embedding model {emb_model}: {str(e)}")
        raise
