from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from solver import *

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def readRoot():
    return FileResponse("static/index.html")

@app.get("/words")
def getWords():
    return words

class GuessRequest(BaseModel):
    guess: str
    pattern: str
    remaining: list[str]

@app.post("/analyze")
def analyzeGuess(request: GuessRequest):
    filtered = filterBad(request.remaining, request.guess, request.pattern)
    patternGroups = getPatternGroups(request.guess, request.remaining)
    
    stats = {
        "expectedSolutions": calculateExpectedRemaining(patternGroups, len(request.remaining)),
        "actualSolutions": len(filtered),
        "chanceCorrect": chanceOfCorrect(request.guess, request.remaining),
        "percentEliminated": calculatePercentElim(len(filtered))
    }
    
    ranked = rankRemaining(filtered)
    
    return {
        "stats": stats,
        "remaining": filtered,
        "ranked": ranked
    }