import re
from typing import Dict, Any, List, Optional
from app.schemas.scoring import QualityScoreResult

class QualityScorer:
    @staticmethod
    def calculate_scores(
        product_data: Dict[str, Any],
        generated_output: Dict[str, Any],
        brand_settings: Optional[Dict[str, Any]] = None
    ) -> QualityScoreResult:
        recommendations: List[str] = []

        # 1. Completeness Score (Weight: 30%)
        required_fields = [
            ("name", "Product Name", 15),
            ("brand", "Brand Name", 10),
            ("category", "Category", 15),
            ("price", "Price", 10),
            ("features", "Features", 15),
            ("specifications", "Specifications", 10),
            ("target_audience", "Target Audience", 10),
            ("primary_keywords", "Primary Keywords", 10),
            ("usp", "USP", 5),
        ]
        
        completeness = 100.0
        missing_fields = []

        for key, label, deduction in required_fields:
            val = product_data.get(key)
            if val is None or val == "" or val == [] or val == {}:
                completeness -= deduction
                missing_fields.append(label)

        completeness = max(0.0, completeness)
        
        if missing_fields:
            recommendations.append(f"Add missing product information ({', '.join(missing_fields[:3])}) to boost completeness score.")

        # 2. SEO Score (Weight: 30%)
        seo = 100.0
        title = generated_output.get("title", "")
        full_desc = generated_output.get("full_description", "")
        meta_title = generated_output.get("meta_title", "")
        meta_desc = generated_output.get("meta_description", "")
        suggested_kw = generated_output.get("suggested_keywords", [])
        
        primary_kws = product_data.get("primary_keywords", [])
        if isinstance(primary_kws, str):
            primary_kws = [k.strip() for k in primary_kws.split(",") if k.strip()]

        # Keyword inclusion
        if primary_kws:
            found_kw = False
            for kw in primary_kws:
                if kw.lower() in title.lower() or kw.lower() in full_desc.lower():
                    found_kw = True
                    break
            if not found_kw:
                seo -= 20
                recommendations.append(f"Primary keyword ('{primary_kws[0]}') is missing from title and description.")

        # Meta title length check (ideal: 35-65 chars)
        if len(meta_title) < 30 or len(meta_title) > 65:
            seo -= 15
            recommendations.append("Meta title length should idealistically be between 35 and 65 characters.")

        # Meta description length check (ideal: 130-165 chars)
        if len(meta_desc) < 120 or len(meta_desc) > 170:
            seo -= 15
            recommendations.append("Meta description is suboptimal; aim for 130-165 characters for search engines.")

        if len(full_desc.split()) < 30:
            seo -= 20
            recommendations.append("Full description is too concise for SEO indexing. Add detailed features.")

        if not suggested_kw:
            seo -= 10

        seo = max(0.0, min(100.0, seo))

        # 3. Readability Score (Weight: 20%)
        readability = 100.0
        words = full_desc.split()
        word_count = len(words)
        
        if word_count > 0:
            sentences = [s for s in re.split(r'[.!?]+', full_desc) if s.strip()]
            sentence_count = max(1, len(sentences))
            avg_words_per_sentence = word_count / sentence_count

            # Penalty for long sentences (> 25 words avg)
            if avg_words_per_sentence > 25:
                readability -= 20
                recommendations.append("Sentences are quite long; break them into shorter, punchy sentences for readability.")

            avg_word_length = sum(len(w) for w in words) / word_count
            if avg_word_length > 7.5:
                readability -= 15
                recommendations.append("Vocabulary contains overly complex words; consider clearer, natural terms.")
        else:
            readability = 50.0

        readability = max(0.0, min(100.0, readability))

        # 4. Brand Tone Score (Weight: 20%)
        brand_score = 100.0
        prohibited = ["best", "guaranteed", "number one", "perfect", "cheap", "miracle", "industry-leading"]
        if brand_settings and brand_settings.get("prohibited_words"):
            prohibited.extend(brand_settings["prohibited_words"])
        
        prohibited_found = []
        full_text_lower = (title + " " + full_desc + " " + meta_desc).lower()

        for p_word in set(prohibited):
            if p_word.strip() and re.search(r'\b' + re.escape(p_word.strip().lower()) + r'\b', full_text_lower):
                prohibited_found.append(p_word)
                brand_score -= 25

        if prohibited_found:
            recommendations.append(f"Avoid prohibited/unverifiable words: '{', '.join(prohibited_found)}'.")

        preferred = ["durable", "innovative", "premium", "ergonomic", "efficient", "sleek"]
        if brand_settings and brand_settings.get("preferred_words"):
            preferred.extend(brand_settings["preferred_words"])

        pref_count = sum(1 for pw in set(preferred) if pw.lower() in full_text_lower)
        if pref_count == 0:
            brand_score -= 10
            recommendations.append("Consider weaving in preferred brand vocabulary to reinforce brand voice.")

        brand_score = max(0.0, min(100.0, brand_score))

        # Overall Formula
        overall = round(
            0.30 * completeness +
            0.30 * seo +
            0.20 * readability +
            0.20 * brand_score,
            1
        )

        status_color = "green" if overall >= 80 else ("yellow" if overall >= 60 else "red")

        if not recommendations:
            recommendations.append("High quality content! Ready for publishing.")

        return QualityScoreResult(
            completeness_score=round(completeness, 1),
            seo_score=round(seo, 1),
            readability_score=round(readability, 1),
            brand_tone_score=round(brand_score, 1),
            overall_quality_score=overall,
            status_color=status_color,
            recommendations=recommendations
        )
