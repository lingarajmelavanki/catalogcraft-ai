import logging
import os
from typing import Dict, Any, Tuple
import httpx
from anthropic import AsyncAnthropic, APIError
from app.config import settings
from app.schemas.generation import GenerationRequest, ClaudeStructuredOutput
from app.services.ai.base import BaseAIGenerator
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.response_parser import ResponseParser
from app.services.ai.mock_generator import MockGenerator

logger = logging.getLogger("catalogcraft.ai")

class ClaudeAIService(BaseAIGenerator):
    def __init__(self):
        self.mock_generator = MockGenerator()

    async def generate(
        self,
        request: GenerationRequest,
        brand_settings: Dict[str, Any]
    ) -> Tuple[ClaudeStructuredOutput, str]:
        anthropic_key = (settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY") or "").strip()
        openrouter_key = (settings.OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY") or "").strip()

        system_prompt = PromptBuilder.build_system_prompt(brand_settings)
        user_prompt = PromptBuilder.build_user_prompt(request)

        # Mode A: Direct Anthropic SDK
        if anthropic_key:
            try:
                logger.info(f"Generating live copy via Anthropic Claude ({settings.CLAUDE_MODEL})...")
                client = AsyncAnthropic(api_key=anthropic_key)
                response = await client.messages.create(
                    model=settings.CLAUDE_MODEL,
                    max_tokens=1500,
                    temperature=0.3,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": user_prompt}
                    ]
                )
                raw_text = response.content[0].text
                structured_output = ResponseParser.parse_and_validate(raw_text)
                return structured_output, "claude"
            except APIError as exc:
                logger.error(f"Anthropic API Error: {exc.message}. Attempting fallback...")
            except Exception as exc:
                logger.error(f"Anthropic SDK error: {str(exc)}. Attempting fallback...")

        # Mode B: OpenRouter API (Live Claude Sonnet / Haiku / DeepSeek)
        if openrouter_key:
            models_to_try = [
                settings.OPENROUTER_MODEL,
                "anthropic/claude-haiku-5.5",
                "deepseek/deepseek-chat"
            ]
            for model_name in models_to_try:
                try:
                    logger.info(f"Generating live copy via OpenRouter model: {model_name}...")
                    async with httpx.AsyncClient(timeout=35.0) as http_client:
                        resp = await http_client.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {openrouter_key}",
                                "Content-Type": "application/json",
                                "HTTP-Referer": "http://localhost:5173",
                                "X-Title": "CatalogCraft AI"
                            },
                            json={
                                "model": model_name,
                                "max_tokens": 1500,
                                "temperature": 0.3,
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": user_prompt}
                                ],
                                "response_format": {"type": "json_object"}
                            }
                        )
                        if resp.status_code == 200:
                            data = resp.json()
                            content = data["choices"][0]["message"]["content"]
                            structured_output = ResponseParser.parse_and_validate(content)
                            return structured_output, "claude"
                        else:
                            logger.warning(f"OpenRouter model {model_name} returned status {resp.status_code}: {resp.text[:200]}")
                except Exception as exc:
                    logger.warning(f"OpenRouter attempt with {model_name} failed: {exc}")

        # Mode C: Fallback to MockGenerator if no live keys or all calls failed
        logger.warning("No live AI keys available or all live requests failed; falling back to MockGenerator.")
        output, _ = await self.mock_generator.generate(request, brand_settings)
        if not (anthropic_key or openrouter_key):
            output.warnings.append("Notice: Running in Mock Engine mode. Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY for Live AI.")
        else:
            output.warnings.append("Notice: Live AI API call timed out or failed. Output generated via Mock Engine fallback.")
        return output, "mock"

