from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from solver import *

app = FastAPI()

# Serve static files (your HTML/CSS/JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return FileResponse("static/index.html")

# Test endpoint
@app.get("/test")
def test():
    return {"message": "FastAPI is working!"}

@app.get("/words")
def get_words():
    return words

class GuessRequest(BaseModel):
    guess: str
    pattern: str
    remaining: list[str]  # List of words still possible

@app.post("/analyze")
def analyze_guess(request: GuessRequest):
    # Filter remaining words based on guess and pattern
    filtered = filterBad(request.remaining, request.guess, request.pattern)
    
    # Get pattern groups for stats
    pattern_groups = getPatternGroups(request.guess, request.remaining)
    
    # Calculate stats
    stats = {
        "expected_solutions": calculateExpectedRemaining(pattern_groups, len(request.remaining)),
        "actual_solutions": len(filtered),
        "chance_correct": chanceOfCorrect(request.guess, request.remaining)
    }
    
    # Rank remaining words
    ranked = rankRemaining(filtered)
    
    return {
        "stats": stats,
        "remaining": filtered,
        "ranked": ranked
    }