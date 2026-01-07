import os
from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

# Define the output model for our Vibe Mapper
class BeadIcon(BaseModel):
    name: str = Field(..., description="Name of the icon (e.g., 'heart', 'star', 'soccer')")
    svg_path: str = Field(..., description="Simple SVG path data for the icon")
    relevance_score: float = Field(..., description="Confidence score 0-1")
    color_suggestion: str = Field(..., description="Recommended hex color for this vibe")

class VibeResponse(BaseModel):
    vibe_category: str = Field(..., description="Classified category: 'Sports', 'Love', 'Music', 'Nature', etc.")
    icons: List[BeadIcon] = Field(..., description="List of generated or selected bead icons")
    reasoning: str = Field(..., description="Why these icons fit the requested vibe")

# Initialize the Agent
# Note: Requires OPENAI_API_KEY or similar in environment variables
vibe_agent = Agent(
    'openai:gpt-4o',
    result_type=VibeResponse,
    system_prompt=(
        "You are the 'Vibe Mapper' for a custom keychain store. "
        "Your goal is to translate abstract user 'vibes' (e.g., 'cottagecore', 'varsity', 'lovers') "
        "into concrete visual bead icons (SVG paths) and color palettes. "
        "Stick to simple, iconic shapes suitable for small 8x8mm beads. "
        "ALWAYS return exactly 3 distinct icon options representing different interpretations of the vibe."
    )
)

@vibe_agent.tool
def lookup_icon_library(ctx: RunContext, keyword: str) -> Optional[str]:
    """
    Simulated vector database lookup for common icons.
    """
    library = {
        'heart': 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        'star': 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
        'soccer': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.06z'
    }
    return library.get(keyword.lower())

async def analyze_vibe(user_input: str) -> VibeResponse:
    """
    Main entry point to map user input to a VibeResponse.
    """
    result = await vibe_agent.run(user_input)
    return result.data 

# CLI Entry Point
if __name__ == "__main__":
    import sys
    import asyncio
    import json

    if len(sys.argv) > 1:
        # Join all args to form the prompt
        user_prompt = " ".join(sys.argv[1:])
        try:
            # Run the agent
            result = asyncio.run(analyze_vibe(user_prompt))
            # Output correct JSON
            print(json.dumps(result.model_dump()))
        except Exception as e:
            # Output error JSON
            print(json.dumps({"error": str(e), "details": "Agent execution failed"}))
    else:
        print(json.dumps({"error": "No prompt provided"}))
