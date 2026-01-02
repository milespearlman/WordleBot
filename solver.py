words = []
WORD_LENGTH = 5

with open('solutions.txt', 'r') as file:
    for line in file:
        words.append(line.strip())

def getPattern(guess, answer):
    guessLower = guess.lower()
    answerLower = answer.lower()
    pattern = [''] * WORD_LENGTH
    letterCounts = {}
    for letter in answerLower:
        letterCounts[letter] = letterCounts.get(letter, 0) + 1
    for i in range(WORD_LENGTH):
        cur = guessLower[i]
        if cur == answerLower[i]:
            pattern[i] = 'G'
            letterCounts[cur] = letterCounts.get(cur) - 1
    for i in range(WORD_LENGTH):
        if pattern[i] != 'G':
            cur = guessLower[i]
            if cur in answerLower and letterCounts[cur] > 0:
                pattern[i] = 'Y'
                letterCounts[cur] = letterCounts.get(cur) - 1
            else:
                pattern[i] = 'B'
    return ''.join(pattern)

def filterBad(wordList, guess, pattern):
    validWords = []
    for word in wordList:
        if getPattern(guess, word) == pattern:
            validWords.append(word)
    return validWords

def getPatternGroups(guess, remainingWords):
    patternGroups = {}
    for word in remainingWords:
        pattern = getPattern(guess, word)
        if pattern in patternGroups:
            patternGroups[pattern].append(word)
        else:
            patternGroups[pattern] = [word]
    return patternGroups

def getLargestGroup(patternGroups):
    max = 0
    for pattern in patternGroups:
        if len(patternGroups[pattern]) > max:
            max = len(patternGroups[pattern])
    return max

def getNumGroups(patternGroups):
    return len(patternGroups)

def chanceOfCorrect(guess, remaining):
    if guess in remaining:
        percent = round(100/len(remaining))
        if percent < 1:
            return "<1%"
        return f"{percent}%"
    return "0%"

def calculateExpectedRemaining(patternGroups, total):
    sum = 0
    for pattern in patternGroups:
        sum += len(patternGroups[pattern]) * len(patternGroups[pattern])
    return round(sum/total, 1)

def rankRemaining(remaining):
    rankedResults = []
    for word in remaining:
        resultingPatternGroups = getPatternGroups(word, remaining)
        expectedSolutionsAfter = calculateExpectedRemaining(resultingPatternGroups, len(remaining))
        rankedResults.append((word, expectedSolutionsAfter))
    rankedResults.sort(key=lambda x: x[1])
    return rankedResults

def playGame(words):
    remaining = words
    firstGuess = True
    while len(remaining) > 1:
        guess = ""
        while len(guess) != WORD_LENGTH:
            guess = input("Enter Guess: ")
            if not firstGuess and guess not in remaining:
                print(f"'{guess}' is not a valid remaining word. Try again.")
                guess = ""
        firstGuess = False
        pattern = ""
        while len(pattern) != WORD_LENGTH:
            pattern = input("Enter Pattern (B/Y/G): ")
        old_remaining = remaining
        remaining = filterBad(remaining, guess, pattern)
        ranked = rankRemaining(remaining)
        patternGroups = getPatternGroups(guess, old_remaining)
        print(f"\n--- Results from your guess '{guess}' ---")
        print(f"Expected solutions after: {calculateExpectedRemaining(patternGroups, len(old_remaining))}")
        print(f"Actual solutions after: {len(remaining)}")
        print(f"Estimated chance guess was solution: {chanceOfCorrect(guess, old_remaining)}")
        for pair in ranked:
            print(f"{pair[0]} {str(pair[1])}")


playGame(words)