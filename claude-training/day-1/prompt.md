# Day 01 prompt log

Three cart questions. For each one, send Prompt A, then Prompt B in the same chat. Fill "What improved" after comparing the two answers.

## 1. Bug summary

Prompt A:

```text
The saved cart total comes back as 0. Summarize this bug.
```

Prompt B:

```text
Write a bug ticket summary for this cart bug only.

Context:
- Function: reloadTotal
- Symptom: reloadTotal returns 0 even when the saved cart still has items.
- Example: a saved cart [{ name: "tea", price: 3 }] reloads to a total of 0.
- There is no UI. This is a plain function.

Output exactly these 5 lines:
1. Symptom
2. Repro steps
3. Expected
4. Actual
5. Relevant function

Rules:
- Do not propose a fix.
- If a fact is not in the context above, write "unknown".
```

What improved: Naming reloadTotal, the tea/3 example, and a fixed 5-line format made Claude write the ticket instead of asking for files.

## 2. Explain this concept

Prompt A:

```text
Explain why a function should not change the object you pass in.
```

Prompt B:

```text
Explain why addItem must return a new cart instead of changing the cart passed in.

Context:
- addItem(cart, item) currently pushes the item into cart.items and returns that same cart.
- The caller still holds the original cart and expects it to stay unchanged.

Rules:
- Maximum 8 sentences.
- Use the names addItem, cart, and item.
- No suggested code changes.
```

What improved: Naming addItem, stating that the caller expects the original cart to stay unchanged, and capping the answer at 8 sentences kept Claude on this function instead of a general side-effect essay.

## 3. Drafting task

Prompt A:

```text
Write a PR description for the cart total fix.
```

Prompt B:

```text
Draft a pull request description for one fix only: reloadTotal should add the prices of saved cart items instead of returning 0.

Use exactly these four sections:
## What
## Why
## How tested
## Risk

Rules:
- Under 150 words.
- Neutral tone.
- How tested must be an empty checklist of 3 boxes. Do not claim tests were run.
- Do not add features beyond reloadTotal.
- If the note above is not enough to state a risk, write "Unknown from the note."
```

What improved: Stating the reloadTotal fix, locking the four section names, and forbidding invented tests made Claude fill What and Why and leave How tested and Risk empty instead of guessing.
