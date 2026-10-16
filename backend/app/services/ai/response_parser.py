import json
import re
from typing import Dict, Any
from app.schemas.generation import ClaudeStructuredOutput

class ResponseParser:
    @staticmethod
    def parse_and_validate(raw_text: str) -> ClaudeStructuredOutput:
        """
        Extracts JSON from response and validates against ClaudeStructuredOutput schema.
        """
        cleaned_text = raw_text.strip()
        
        # Remove ```json ... ``` codeblock wrappers if present
        if cleaned_text.startswith("```"):
            cleaned_text = re.sub(r"^```(?:json)?\s*", "", cleaned_text)
            cleaned_text = re.sub(r"\s*```$", "", cleaned_text)

        # Attempt to locate JSON object substring
        match = re.search(r"\{.*\}", cleaned_text, re.DOTALL)
        if match:
            cleaned_text = match.group(0)

        data = json.loads(cleaned_text)
        return ClaudeStructuredOutput(**data)
