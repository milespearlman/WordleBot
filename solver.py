words = []
WORD_LENGTH = 5

with open('words.txt', 'r') as file:
    for line in file:
        words.append(line.strip())

def getPattern(guess, answer):
    guessLower = guess.lower()
    answerLower = answer.lower()
    pattern = [''] * WORD_LENGTH
    # Create a dictionary of counts
    letterCounts = {}
    for letter in answerLower:
        letterCounts[letter] = letterCounts.get(letter, 0) + 1
    # Check for greens
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

def playGame(words):
    remaining = words
    while len(remaining) > 1:
        guess = ""
        while len(guess) != WORD_LENGTH:
            guess = input("Enter Guess: ")
        pattern = ""
        while len(pattern) != WORD_LENGTH:
            pattern = input("Enter Pattern (B/Y/G): ")
        remaining = filterBad(remaining, guess, pattern)
        for word in remaining:
            print(word)

playGame(words)