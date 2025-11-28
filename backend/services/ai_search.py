import os
import json
from groq import Groq

class AIStockSearch:
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if api_key:
            self.client = Groq(api_key=api_key)
            self.enabled = True
            print("AI Search enabled with Groq")
        else:
            self.enabled = False
            print("AI Search disabled - no API key")
    
    def parse_query(self, user_query):
        if not self.enabled:
            return None
        
        try:
            # Build prompt cleanly
            prompt = (
                "Convert this stock search query into filter parameters.\n\n"
                f"User Query: {user_query}\n\n"
                "Respond ONLY with JSON containing these fields:\n"
                '{"sector": "Banking", "peMin": 10, "peMax": 25, "roeMin": 15, "debtRatioMax": 0.5}\n\n'
                "Use null for fields not mentioned in the query.\n\n"
                "Examples:\n"
                '- banking stocks with high ROE -> {"sector": "Banking", "roeMin": 20}\n'
                '- IT companies with low debt -> {"sector": "IT Services", "debtRatioMax": 0.3}\n'
                '- stocks with PE less than 20 -> {"peMax": 20}\n\n'
                "Respond ONLY with the JSON object. No markdown, no explanation."
            )

            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=500,
            )
            
            text = response.choices[0].message.content.strip()

            # Clean code block wrappers if model still returns them
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            # Extract JSON safely
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end > start:
                text = text[start:end+1]

            filters = json.loads(text)

            # Remove null values
            clean_filters = {k: v for k, v in filters.items() if v is not None}

            print("AI parsed query successfully:", clean_filters)
            return clean_filters
            
        except Exception as e:
            print("AI search error:", str(e))
            return None


ai_search = AIStockSearch()
