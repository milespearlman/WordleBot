from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from solver import *

app = FastAPI()

# Serve static files (your HTML/CSS/JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def readRoot():
    return FileResponse("static/index.html")

# Test endpoint
@app.get("/test")
def test():
    return {"message": "FastAPI is working!"}

@app.get("/words")
def getWords():
    return words

class GuessRequest(BaseModel):
    guess: str
    pattern: str
    remaining: list[str]  # List of words still possible

@app.post("/analyze")
def analyzeGuess(request: GuessRequest):
    # Filter remaining words based on guess and pattern
    filtered = filterBad(request.remaining, request.guess, request.pattern)
    
    # Get pattern groups for stats
    patternGroups = getPatternGroups(request.guess, request.remaining)
    
    # Calculate stats
    stats = {
        "expectedSolutions": calculateExpectedRemaining(patternGroups, len(request.remaining)),
        "actualSolutions": len(filtered),
        "chanceCorrect": chanceOfCorrect(request.guess, request.remaining),
        "percentEliminated": calculatePercentElim(len(filtered))
    }
    
    # Rank remaining words
    ranked = rankRemaining(filtered)
    
    return {
        "stats": stats,
        "remaining": filtered,
        "ranked": ranked
    }