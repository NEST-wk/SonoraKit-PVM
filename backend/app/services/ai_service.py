"""
Servicio para interactuar con múltiples proveedores de IA.
Soporta OpenAI, Anthropic, Google, Mistral, Cohere, Groq y OpenRouter.
"""
import httpx
import json
from typing import AsyncGenerator, List, Dict, Any
from app.core.logger import logger


class AIService:
    """Servicio unificado para múltiples proveedores de IA."""

    def __init__(self):
        self.providers = {
            "openai": {
                "base_url": "https://api.openai.com/v1",
            },
            "anthropic": {
                "base_url": "https://api.anthropic.com/v1",
            },
            "google": {
                "base_url": "https://generativelanguage.googleapis.com/v1beta",
            },
            "mistral": {
                "base_url": "https://api.mistral.ai/v1",
            },
            "cohere": {
                "base_url": "https://api.cohere.ai/v2",
            },
            "groq": {
                "base_url": "https://api.groq.com/openai/v1",
            },
            "openrouter": {
                "base_url": "https://openrouter.ai/api/v1",
            }
        }

    async def chat_completion(
        self,
        provider: str,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        stream: bool = False,
        **kwargs
    ):
        """
        Envía mensajes a un proveedor de IA y obtiene respuesta.
        """
        if provider not in self.providers:
            raise ValueError(f"Provider '{provider}' not supported")

        if stream:
            if provider == "openai":
                return self._openai_stream(model, messages, api_key, **kwargs)
            elif provider == "anthropic":
                return self._anthropic_stream(model, messages, api_key, **kwargs)
            elif provider == "google":
                return self._google_stream(model, messages, api_key, **kwargs)
            elif provider == "mistral":
                return self._mistral_stream(model, messages, api_key, **kwargs)
            elif provider == "cohere":
                return self._cohere_stream(model, messages, api_key, **kwargs)
            elif provider == "groq":
                return self._groq_stream(model, messages, api_key, **kwargs)
            elif provider == "openrouter":
                return self._openrouter_stream(model, messages, api_key, **kwargs)
        else:
            if provider == "openai":
                return await self._openai_chat(model, messages, api_key, **kwargs)
            elif provider == "anthropic":
                return await self._anthropic_chat(model, messages, api_key, **kwargs)
            elif provider == "google":
                return await self._google_chat(model, messages, api_key, **kwargs)
            elif provider == "mistral":
                return await self._mistral_chat(model, messages, api_key, **kwargs)
            elif provider == "cohere":
                return await self._cohere_chat(model, messages, api_key, **kwargs)
            elif provider == "groq":
                return await self._groq_chat(model, messages, api_key, **kwargs)
            elif provider == "openrouter":
                return await self._openrouter_chat(model, messages, api_key, **kwargs)

        raise ValueError(f"Provider '{provider}' not implemented")

    # ==================== OpenAI ====================
    async def _openai_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Chat con OpenAI (sin streaming)."""
        url = f"{self.providers['openai']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"OpenAI error: {response.text}")
                raise Exception(
                    f"OpenAI API error: {response.status_code} - {response.text}")

            data = response.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage", {})
            }

    async def _openai_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Chat con OpenAI (streaming)."""
        url = f"{self.providers['openai']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"OpenAI error: {error_text}")
                    raise Exception(
                        f"OpenAI API error: {response.status_code}")

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            content = chunk.get("choices", [{}])[0].get(
                                "delta", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

    # ==================== Anthropic ====================
    async def _anthropic_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Chat con Anthropic Claude (sin streaming)."""
        url = f"{self.providers['anthropic']['base_url']}/messages"

        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }

        system_message = None
        anthropic_messages = []

        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                anthropic_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        payload = {
            "model": model,
            "messages": anthropic_messages,
            "max_tokens": kwargs.get("max_tokens", 4096)
        }

        if system_message:
            payload["system"] = system_message

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Anthropic error: {response.text}")
                raise Exception(
                    f"Anthropic API error: {response.status_code} - {response.text}")

            data = response.json()
            return {
                "content": data["content"][0]["text"],
                "usage": data.get("usage", {})
            }

    async def _anthropic_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Chat con Anthropic Claude (streaming)."""
        url = f"{self.providers['anthropic']['base_url']}/messages"

        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }

        system_message = None
        anthropic_messages = []

        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                anthropic_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        payload = {
            "model": model,
            "messages": anthropic_messages,
            "max_tokens": kwargs.get("max_tokens", 4096),
            "stream": True
        }

        if system_message:
            payload["system"] = system_message

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Anthropic error: {error_text}")
                    raise Exception(
                        f"Anthropic API error: {response.status_code}")

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        try:
                            chunk = json.loads(data)
                            if chunk.get("type") == "content_block_delta":
                                content = chunk.get(
                                    "delta", {}).get("text", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue

    # ==================== Google ====================
    async def _google_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Chat con Google Gemini (sin streaming)."""
        url = f"{self.providers['google']['base_url']}/models/{model}:generateContent?key={api_key}"

        headers = {"Content-Type": "application/json"}

        google_contents = []
        system_instruction = None

        for msg in messages:
            if msg["role"] == "system":
                system_instruction = msg["content"]
            else:
                role = "user" if msg["role"] == "user" else "model"
                google_contents.append({
                    "role": role,
                    "parts": [{"text": msg["content"]}]
                })

        payload = {
            "contents": google_contents,
            "generationConfig": {
                "maxOutputTokens": kwargs.get("max_tokens", 4096),
                "temperature": kwargs.get("temperature", 0.7)
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Google error: {response.text}")
                raise Exception(
                    f"Google API error: {response.status_code} - {response.text}")

            data = response.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            return {
                "content": content,
                "usage": data.get("usageMetadata", {})
            }

    async def _google_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Chat con Google Gemini (streaming)."""
        url = f"{self.providers['google']['base_url']}/models/{model}:streamGenerateContent?key={api_key}&alt=sse"

        headers = {"Content-Type": "application/json"}

        google_contents = []
        system_instruction = None

        for msg in messages:
            if msg["role"] == "system":
                system_instruction = msg["content"]
            else:
                role = "user" if msg["role"] == "user" else "model"
                google_contents.append({
                    "role": role,
                    "parts": [{"text": msg["content"]}]
                })

        payload = {
            "contents": google_contents,
            "generationConfig": {
                "maxOutputTokens": kwargs.get("max_tokens", 4096),
                "temperature": kwargs.get("temperature", 0.7)
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Google error: {error_text}")
                    raise Exception(
                        f"Google API error: {response.status_code}")

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        try:
                            chunk = json.loads(data)
                            parts = chunk.get("candidates", [{}])[0].get(
                                "content", {}).get("parts", [])
                            for part in parts:
                                text = part.get("text", "")
                                if text:
                                    yield text
                        except json.JSONDecodeError:
                            continue

    # ==================== Mistral ====================
    async def _mistral_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Chat con Mistral (sin streaming)."""
        url = f"{self.providers['mistral']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Mistral error: {response.text}")
                raise Exception(
                    f"Mistral API error: {response.status_code} - {response.text}")

            data = response.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage", {})
            }

    async def _mistral_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Chat con Mistral (streaming)."""
        url = f"{self.providers['mistral']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Mistral error: {error_text}")
                    raise Exception(
                        f"Mistral API error: {response.status_code}")

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            content = chunk.get("choices", [{}])[0].get(
                                "delta", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

    # ==================== Cohere ====================
    async def _cohere_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Chat con Cohere (sin streaming)."""
        url = f"{self.providers['cohere']['base_url']}/chat"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Cohere usa formato diferente
        cohere_messages = []
        for msg in messages:
            role = "assistant" if msg["role"] == "assistant" else msg["role"]
            if role == "system":
                role = "system"
            cohere_messages.append({
                "role": role,
                "content": msg["content"]
            })

        payload = {
            "model": model,
            "messages": cohere_messages,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Cohere error: {response.text}")
                raise Exception(
                    f"Cohere API error: {response.status_code} - {response.text}")

            data = response.json()
            content = data.get("message", {}).get(
                "content", [{}])[0].get("text", "")
            return {
                "content": content,
                "usage": data.get("usage", {})
            }

    async def _cohere_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Chat con Cohere (streaming)."""
        url = f"{self.providers['cohere']['base_url']}/chat"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        cohere_messages = []
        for msg in messages:
            role = "assistant" if msg["role"] == "assistant" else msg["role"]
            if role == "system":
                role = "system"
            cohere_messages.append({
                "role": role,
                "content": msg["content"]
            })

        payload = {
            "model": model,
            "messages": cohere_messages,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Cohere error: {error_text}")
                    raise Exception(
                        f"Cohere API error: {response.status_code}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        if chunk.get("type") == "content-delta":
                            content = chunk.get("delta", {}).get(
                                "message", {}).get("content", {}).get("text", "")
                            if content:
                                yield content
                    except json.JSONDecodeError:
                        continue

    # ==================== Groq ====================
    async def _groq_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Chat con Groq (sin streaming). Usa formato OpenAI."""
        url = f"{self.providers['groq']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Groq error: {response.text}")
                raise Exception(
                    f"Groq API error: {response.status_code} - {response.text}")

            data = response.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage", {})
            }

    async def _groq_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Chat con Groq (streaming). Usa formato OpenAI."""
        url = f"{self.providers['groq']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Groq error: {error_text}")
                    raise Exception(f"Groq API error: {response.status_code}")

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            content = chunk.get("choices", [{}])[0].get(
                                "delta", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

    # ==================== OpenRouter ====================
    async def _openrouter_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Chat con OpenRouter (sin streaming). Usa formato OpenAI."""
        url = f"{self.providers['openrouter']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://sonorakit.dev",
            "X-Title": "SonoraKit"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"OpenRouter error: {response.text}")
                raise Exception(
                    f"OpenRouter API error: {response.status_code} - {response.text}")

            data = response.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage", {})
            }

    async def _openrouter_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        api_key: str,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Chat con OpenRouter (streaming). Usa formato OpenAI."""
        url = f"{self.providers['openrouter']['base_url']}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://sonorakit.dev",
            "X-Title": "SonoraKit"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"OpenRouter error: {error_text}")
                    raise Exception(
                        f"OpenRouter API error: {response.status_code}")

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            content = chunk.get("choices", [{}])[0].get(
                                "delta", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue


# Singleton
ai_service = AIService()
