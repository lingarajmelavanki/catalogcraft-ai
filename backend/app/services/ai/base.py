from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
from app.schemas.generation import GenerationRequest, ClaudeStructuredOutput

class BaseAIGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        request: GenerationRequest,
        brand_settings: Dict[str, Any]
    ) -> Tuple[ClaudeStructuredOutput, str]:
        """
        Generates product description.
        Returns: (ClaudeStructuredOutput, source_string)
        where source_string is 'claude' or 'mock'.
        """
        pass
