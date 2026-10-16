import json
from typing import Dict, Any
from app.schemas.generation import GenerationRequest

class PromptBuilder:
    @staticmethod
    def build_system_prompt(brand_settings: Dict[str, Any]) -> str:
        brand_name = brand_settings.get("brand_name", "CatalogCraft Retail")
        brand_voice = brand_settings.get("brand_voice", "Professional, clear, customer-centric")
        preferred_words = ", ".join(brand_settings.get("preferred_words", []))
        prohibited_words = ", ".join(brand_settings.get("prohibited_words", []))
        mandatory_disclaimer = brand_settings.get("mandatory_disclaimer", "")
        content_rules = "\n".join([f"- {r}" for r in brand_settings.get("content_rules", [])])

        return f"""You are CatalogCraft AI, an expert e-commerce copywriter generating high-converting, SEO-optimized, accurate retail product descriptions for {brand_name}.

STRICT CONTENT & RESPONSIBLE AI RULES:
1. USE ONLY THE SUPPLIED PRODUCT INFORMATION.
2. DO NOT INVENT or guess specifications, materials, technical features, dimensions, warranties, certifications, prices, compatibility, safety claims, or sustainability claims.
3. If important information is missing, DO NOT make it up; instead, append an explanation to the "warnings" array.
4. MAINTAIN BRAND VOICE: {brand_voice}.
5. PREFERRED VOCABULARY: [{preferred_words}].
6. ABSOLUTELY PROHIBITED WORDS: [{prohibited_words}].
7. AVOID UNSUPPORTED SUPERLATIVES such as "best", "guaranteed", "number one", "perfect", "cheap", or "miracle".
8. Include primary SEO keywords naturally without keyword stuffing.
9. MANDATORY LEGAL DISCLAIMER PREFERENCE: Include subtle alignment with "{mandatory_disclaimer}" if relevant.
10. ADDITIONAL BRAND RULES:
{content_rules}

OUTPUT REQUIREMENTS:
You MUST respond with VALID JSON ONLY, wrapped in a single raw JSON object matching this exact schema:
{{
  "title": "string",
  "short_description": "string",
  "full_description": "string",
  "highlights": ["string"],
  "meta_title": "string",
  "meta_description": "string",
  "suggested_keywords": ["string"],
  "warnings": ["string"]
}}
Do not include markdown code block formatting (like ```json) in the JSON response if possible, or ensure it is valid JSON.
"""

    @staticmethod
    def build_user_prompt(request: GenerationRequest) -> str:
        data = {
            "product_name": request.name,
            "sku": request.sku,
            "brand": request.brand,
            "category": request.category,
            "price": f"{request.currency or 'USD'} {request.price}" if request.price else None,
            "key_features": request.features,
            "specifications": request.specifications,
            "target_audience": request.target_audience,
            "usp": request.usp,
            "material": request.material,
            "dimensions": request.dimensions,
            "color": request.color,
            "weight": request.weight,
            "primary_seo_keywords": request.primary_keywords,
            "secondary_seo_keywords": request.secondary_keywords,
            "competitor_reference_terms": request.competitor_terms,
            "meta_description_preference": request.meta_pref,
            "requested_tone": request.tone,
            "requested_word_count": request.word_count,
            "requested_language": request.language,
        }

        return f"""Generate an e-commerce product description based strictly on the structured product data below:

{json.dumps(data, indent=2)}

Remember to return ONLY a JSON object with keys: title, short_description, full_description, highlights, meta_title, meta_description, suggested_keywords, warnings.
"""
