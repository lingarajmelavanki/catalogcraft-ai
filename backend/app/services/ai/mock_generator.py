from typing import Dict, Any, Tuple
from app.schemas.generation import GenerationRequest, ClaudeStructuredOutput
from app.services.ai.base import BaseAIGenerator

class MockGenerator(BaseAIGenerator):
    def generate_sync(
        self,
        request: GenerationRequest,
        brand_settings: Dict[str, Any]
    ) -> Tuple[ClaudeStructuredOutput, str]:
        name = request.name.strip()
        brand = request.brand or brand_settings.get("brand_name", "Retail Series")
        category = request.category or "General Product"
        price_str = f"${request.price:.2f}" if request.price is not None else ""
        
        # Tone adjustments
        tone = request.tone or "Professional"
        tone_prefixes = {
            "Professional": "Engineered for quality and dependable performance,",
            "Premium / Luxury": "Exquisitely crafted with uncompromising precision and elegance,",
            "Friendly": "Designed to make your everyday routine effortlessly enjoyable,",
            "Minimal": "Sleek, refined, and purposefully crafted,",
            "Technical": "Built with advanced specifications and precise craftsmanship,",
            "Playful": "Brighten up your day with this fun, high-utility essential,",
            "Eco-conscious": "Sustainably minded and built to deliver lasting utility,",
        }
        prefix = tone_prefixes.get(tone, "Engineered for dependable performance,")

        features_text = ""
        if request.features:
            features_text = "Key capabilities include " + ", ".join(request.features[:3]) + "."
        
        specs_parts = []
        if request.material:
            specs_parts.append(f"material: {request.material}")
        if request.dimensions:
            specs_parts.append(f"dimensions: {request.dimensions}")
        if request.color:
            specs_parts.append(f"color: {request.color}")
        if request.weight:
            specs_parts.append(f"weight: {request.weight}")
        
        specs_str = f" Highlights specific details like {', '.join(specs_parts)}." if specs_parts else ""

        audience_str = f" Tailored specifically for {request.target_audience}." if request.target_audience else ""
        usp_str = f" {request.usp}" if request.usp else ""

        short_description = f"{prefix} the {brand} {name} is a top choice in {category}. {features_text}{usp_str}".strip()

        word_pref = request.word_count or "Medium"
        if word_pref == "Short":
            full_description = f"{short_description}{specs_str}{audience_str}"
        elif word_pref == "Long":
            full_description = (
                f"{prefix} the {brand} {name} elevates the standard for {category}. "
                f"It is specifically engineered to meet high standards of functionality and reliability. "
                f"{features_text}{specs_str}{audience_str}{usp_str} "
                f"Whether upgrading your setup or seeking daily efficiency, the {name} delivers versatile performance you can rely on."
            )
        else: # Medium
            full_description = (
                f"{prefix} the {brand} {name} delivers versatile performance in {category}. "
                f"{features_text}{specs_str}{audience_str}{usp_str} "
                f"An essential addition crafted for seamless everyday integration."
            )

        highlights = list(request.features) if request.features else []
        if request.material and f"Material: {request.material}" not in highlights:
            highlights.append(f"Material: {request.material}")
        if request.color and f"Color: {request.color}" not in highlights:
            highlights.append(f"Color: {request.color}")
        if not highlights:
            highlights = [f"Premium {category} design", f"Authentic {brand} craftsmanship"]

        meta_title = f"{brand} {name} - {category} | Buy Online"[:60]
        meta_desc_base = f"Shop the {brand} {name}. {features_text} {price_str}".strip()
        meta_description = meta_desc_base[:155] if len(meta_desc_base) > 155 else meta_desc_base

        keywords = list(request.primary_keywords) + list(request.secondary_keywords)
        if not keywords:
            keywords = [name.lower(), category.lower(), brand.lower(), "retail", "buy online"]

        warnings = []
        if not request.material:
            warnings.append("Product material is missing. Add material specifications to avoid vague buyer expectations.")
        if not request.dimensions:
            warnings.append("Dimensions not specified. Providing exact measurements reduces customer returns.")
        if not request.primary_keywords:
            warnings.append("No primary SEO keywords provided. Targeted keywords improve search ranking.")
        if not request.target_audience:
            warnings.append("Target audience not specified. Adding target demographic improves tone personalization.")

        output = ClaudeStructuredOutput(
            title=f"{brand} {name}",
            short_description=short_description,
            full_description=full_description,
            highlights=highlights,
            meta_title=meta_title,
            meta_description=meta_description,
            suggested_keywords=keywords,
            warnings=warnings
        )

        return output, "mock"

    async def generate(
        self,
        request: GenerationRequest,
        brand_settings: Dict[str, Any]
    ) -> Tuple[ClaudeStructuredOutput, str]:
        return self.generate_sync(request, brand_settings)
