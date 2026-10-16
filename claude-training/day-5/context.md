# Context

Same question in two new sessions:

`Does reloadTotal write the total back onto the cart? Answer from the code.`

## Session A, no prior read

The question was the first message. Claude ran 3 commands, then answered from `day-2/app/cart.ts` lines 11–17.

Answer: no. `reloadTotal` reduces `cart.items` into a local `total` and returns it. It never assigns to `cart`.

`/context`: 65.8k / 1M (7%). Messages: 14.5k.

## Session B, file already read

The session had already read `day-2/app/cart.ts` and summarized the functions. The same question was sent after that.

Answer: no. `reloadTotal` at `cart.ts:11` reads `cart.items`, sums the prices into a local `total`, and returns it. It never assigns to `cart`.

`/context`: 64.3k / 1M (6%). Messages: 13k.

## Comparison

Both answers are right, and both name the same behavior: the function returns a local total and does not change the cart.

Session A spent more because it had to go read the file during the question. Messages are 14.5k there and 13k in session B. The context window is 65.8k against 64.3k. Session B already held the file, so the follow-up question cost less and needed no extra commands.
